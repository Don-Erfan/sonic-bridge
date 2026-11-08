import { useSyncExternalStore } from 'react';
import { IUseThemeResult, themeStore } from '@/lib/theme';

/**
 * Reads and changes the colour theme.
 *
 * Subscribes to the theme store (Observer) through `useSyncExternalStore`, so
 * only components calling this hook re-render on a theme change.
 * `resolvedTheme` is `undefined` during SSR and hydration — render a neutral
 * placeholder until it is known to avoid a hydration mismatch.
 *
 * @example
 * const { resolvedTheme, setMode } = useTheme();
 * setMode(resolvedTheme === `dark` ? `light` : `dark`);
 */
export const useTheme = (): IUseThemeResult => {
  const snapshot = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );
  return { ...snapshot, setMode: themeStore.setMode };
};
