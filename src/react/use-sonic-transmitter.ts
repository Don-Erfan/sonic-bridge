import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { EncodedSignal, PayloadInput, SonicError } from "../core";
import {
  SonicTransmitter,
  type TransmitterOptions,
  type TransmitterState,
  type TransmitterStatus,
} from "../web";
import { useSonicBridgeContext } from "./context";
import { optionsKey, useLatest, useSupport } from "./internal";

export interface UseSonicTransmitterOptions extends Omit<TransmitterOptions, "audio"> {
  readonly onSent?: (signal: EncodedSignal) => void;
  readonly onError?: (error: SonicError) => void;
}

export interface UseSonicTransmitterResult {
  /** Sends a payload. Never rejects — failures land in `error`/`status`. Call from a click handler. */
  readonly transmit: (payload: PayloadInput) => Promise<EncodedSignal | undefined>;
  /** Like `transmit`, but rejects with a `SonicError`. */
  readonly transmitAsync: (payload: PayloadInput) => Promise<EncodedSignal>;
  readonly cancel: () => void;
  readonly reset: () => void;
  readonly state: TransmitterState;
  readonly status: TransmitterStatus;
  /** 0–1 while transmitting. */
  readonly progress: number;
  readonly error: SonicError | null;
  readonly isTransmitting: boolean;
  /** `null` until detected on the client. */
  readonly isSupported: boolean | null;
  /** The underlying framework-agnostic instance. */
  readonly transmitter: SonicTransmitter;
}

export function useSonicTransmitter(
  options: UseSonicTransmitterOptions = {},
): UseSonicTransmitterResult {
  const shared = useSonicBridgeContext();
  const latest = useLatest(options);
  const { onSent: _s, onError: _e, ...engineOptions } = options;
  const key = optionsKey({ ...shared?.defaults, ...engineOptions });

  // biome-ignore lint/correctness/useExhaustiveDependencies: recreated only when serializable options change
  const transmitter = useMemo(
    () =>
      new SonicTransmitter({
        ...shared?.defaults,
        ...engineOptions,
        ...(shared ? { audio: shared.audio } : {}),
        destination: (context) => latest.current.destination?.(context) ?? context.destination,
      }),
    [key, shared?.audio],
  );
  useEffect(() => () => void transmitter.release(), [transmitter]);

  const state = useSyncExternalStore(
    transmitter.subscribe,
    transmitter.getSnapshot,
    transmitter.getSnapshot,
  );
  const support = useSupport();

  const transmitAsync = useCallback(
    async (payload: PayloadInput) => {
      try {
        const signal = await transmitter.transmit(payload);
        latest.current.onSent?.(signal);
        return signal;
      } catch (error) {
        latest.current.onError?.(error as SonicError);
        throw error;
      }
    },
    [transmitter, latest],
  );
  const transmit = useCallback(
    (payload: PayloadInput) => transmitAsync(payload).catch(() => undefined),
    [transmitAsync],
  );

  return {
    transmit,
    transmitAsync,
    cancel: useCallback(() => transmitter.cancel(), [transmitter]),
    reset: useCallback(() => transmitter.reset(), [transmitter]),
    state,
    status: state.status,
    progress: state.status === "transmitting" ? state.progress : state.status === "done" ? 1 : 0,
    error: state.status === "error" ? state.error : null,
    isTransmitting: state.status === "preparing" || state.status === "transmitting",
    isSupported: support ? support.transmit : null,
    transmitter,
  };
}
