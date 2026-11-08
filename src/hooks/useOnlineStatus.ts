import { useSyncExternalStore } from 'react';

const subscribe = (listener: () => void): (() => void) => {
  window.addEventListener(`online`, listener);
  window.addEventListener(`offline`, listener);
  return () => {
    window.removeEventListener(`online`, listener);
    window.removeEventListener(`offline`, listener);
  };
};

/**
 * Whether the browser reports a network connection. Assumes online during
 * SSR and hydration, so the offline banner never flashes on load.
 */
export const useOnlineStatus = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
