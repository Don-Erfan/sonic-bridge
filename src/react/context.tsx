import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { ProtocolOptions } from "../core";
import { AudioContextManager } from "../web";

export interface SonicBridgeContextValue {
  /** One AudioContext shared by every hook below the provider. */
  readonly audio: AudioContextManager;
  /** Protocol defaults (band, speed, ecc…) applied to every hook. */
  readonly defaults: ProtocolOptions;
}

const SonicBridgeContext = createContext<SonicBridgeContextValue | null>(null);

export interface SonicBridgeProviderProps extends ProtocolOptions {
  readonly children?: ReactNode;
  /** Bring your own AudioContext (e.g. one your app already uses). */
  readonly context?: AudioContext;
}

/**
 * Optional. Without it every hook works standalone; with it, hooks share one AudioContext
 * and protocol defaults — so a sender and a receiver on the same page always agree.
 */
export function SonicBridgeProvider({
  children,
  context,
  ...defaults
}: SonicBridgeProviderProps): ReactNode {
  const [audio] = useState(() => new AudioContextManager(context));
  useEffect(() => () => void audio.close(), [audio]);
  const key = JSON.stringify(defaults);
  // `key` captures `defaults` by value, so a new object with equal contents keeps the context stable.
  const value = useMemoValue(() => ({ audio, defaults }), [audio, key]);
  return <SonicBridgeContext.Provider value={value}>{children}</SonicBridgeContext.Provider>;
}

function useMemoValue<T>(factory: () => T, deps: readonly unknown[]): T {
  const [state] = useState(() => ({ deps, value: factory() }));
  if (deps.some((d, i) => !Object.is(d, state.deps[i]))) {
    state.deps = deps;
    state.value = factory();
  }
  return state.value;
}

export const useSonicBridgeContext = (): SonicBridgeContextValue | null =>
  useContext(SonicBridgeContext);
