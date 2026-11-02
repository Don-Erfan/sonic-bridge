import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { messageToText, type SonicError, type SonicMessage } from "../core";
import {
  type ListenOptions,
  type ReceiverOptions,
  type ReceiverState,
  type ReceiverStatus,
  SonicReceiver,
} from "../web";
import { useSonicBridgeContext } from "./context";
import { optionsKey, useLatest, useSupport } from "./internal";

export interface UseSonicReceiverOptions<T>
  extends Omit<ReceiverOptions, "audio">,
    Omit<ListenOptions, "signal"> {
  /** Maps a message to `data`. Default: its text form (`messageToText`). */
  readonly parse?: (message: SonicMessage) => T;
  readonly onMessage?: (message: SonicMessage, data: T) => void;
  readonly onError?: (error: SonicError) => void;
}

export interface UseSonicReceiverResult<T> {
  /** Starts listening. Never rejects. Call from a click handler (microphone permission). */
  readonly listen: () => Promise<SonicMessage | undefined>;
  /** Like `listen`, but rejects with a `SonicError`. */
  readonly listenAsync: () => Promise<SonicMessage | undefined>;
  readonly stop: () => void;
  readonly reset: () => void;
  readonly state: ReceiverState;
  readonly status: ReceiverStatus;
  /** Parsed value of the latest message, or `null`. */
  readonly data: T | null;
  readonly message: SonicMessage | null;
  readonly error: SonicError | null;
  /** Input level 0–1, for meters. */
  readonly level: number;
  /** 0–1 while a frame is being received. */
  readonly progress: number;
  readonly isListening: boolean;
  readonly isSupported: boolean | null;
  readonly receiver: SonicReceiver;
}

const latestMessage = (state: ReceiverState): SonicMessage | null => {
  switch (state.status) {
    case "success":
      return state.message;
    case "listening":
    case "receiving":
      return state.lastMessage ?? null;
    default:
      return null;
  }
};

/** Default: `data` is the message as text. */
export function useSonicReceiver(
  options?: UseSonicReceiverOptions<string>,
): UseSonicReceiverResult<string>;
/** With `parse`, `data` takes its return type. */
export function useSonicReceiver<T>(
  options: UseSonicReceiverOptions<T> & { readonly parse: (message: SonicMessage) => T },
): UseSonicReceiverResult<T>;
export function useSonicReceiver<T>(
  options: UseSonicReceiverOptions<T> = {},
): UseSonicReceiverResult<T> {
  const shared = useSonicBridgeContext();
  const latest = useLatest(options);
  const {
    parse: _p,
    onMessage: _m,
    onError: _e,
    timeout: _t,
    continuous: _c,
    stream: _s,
    ...engineOptions
  } = options;
  const key = optionsKey({ ...shared?.defaults, ...engineOptions });

  // biome-ignore lint/correctness/useExhaustiveDependencies: recreated only when serializable options change
  const receiver = useMemo(
    () =>
      new SonicReceiver({
        ...shared?.defaults,
        ...engineOptions,
        ...(shared ? { audio: shared.audio } : {}),
      }),
    [key, shared?.audio],
  );
  useEffect(() => () => void receiver.release(), [receiver]);

  useEffect(() => {
    const parse = (m: SonicMessage): T =>
      (latest.current.parse ?? (messageToText as unknown as (m: SonicMessage) => T))(m);
    const offMessage = receiver.on("message", (m) => latest.current.onMessage?.(m, parse(m)));
    const offError = receiver.on("error", (e) => latest.current.onError?.(e));
    return () => {
      offMessage();
      offError();
    };
  }, [receiver, latest]);

  const state = useSyncExternalStore(
    receiver.subscribe,
    receiver.getSnapshot,
    receiver.getSnapshot,
  );
  const support = useSupport();
  const message = latestMessage(state);
  const parse = options.parse;
  const data = useMemo(
    () =>
      message ? (parse ?? (messageToText as unknown as (m: SonicMessage) => T))(message) : null,
    [message, parse],
  );

  const listenAsync = useCallback(async () => {
    const { timeout, continuous, stream } = latest.current;
    const listenOptions: Omit<ListenOptions, "continuous"> = {
      ...(timeout === undefined ? {} : { timeout }),
      ...(stream === undefined ? {} : { stream }),
    };
    if (continuous) {
      await receiver.listen({ ...listenOptions, continuous: true });
      return undefined;
    }
    return receiver.listen(listenOptions);
  }, [receiver, latest]);

  const listen = useCallback(() => listenAsync().catch(() => undefined), [listenAsync]);

  return {
    listen,
    listenAsync,
    stop: useCallback(() => receiver.stop(), [receiver]),
    reset: useCallback(() => receiver.reset(), [receiver]),
    state,
    status: state.status,
    data,
    message,
    error: state.status === "error" ? state.error : null,
    level: state.status === "listening" || state.status === "receiving" ? state.level : 0,
    progress: state.status === "receiving" ? state.progress : state.status === "success" ? 1 : 0,
    isListening: state.status === "listening" || state.status === "receiving",
    isSupported: support ? support.receive : null,
    receiver,
  };
}
