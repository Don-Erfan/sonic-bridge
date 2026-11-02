import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { detectSupport, type SupportReport } from "../web";

const useIsomorphicLayoutEffect: typeof useEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** "Latest ref" pattern: stable identity, always-current value (for callbacks and options). */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Feature detection after mount, so server and first client render agree. */
export function useSupport(): SupportReport | null {
  const [support, setSupport] = useState<SupportReport | null>(null);
  useEffect(() => setSupport(detectSupport()), []);
  return support;
}

/** Stable key for the options that require a new engine instance when they change. */
export const optionsKey = (options: object): string =>
  JSON.stringify(options, (_key, value: unknown) =>
    typeof value === "function" ? undefined : value,
  );
