/** What the user picked. `system` follows the OS `prefers-color-scheme`. */
export type TThemeMode = `light` | `dark` | `system`;

/** The theme actually painted — the class written to `<html>`. */
export type TResolvedTheme = Exclude<TThemeMode, `system`>;

/**
 * Immutable state published by the theme store. A new object is created only
 * when something changes, which is what `useSyncExternalStore` relies on.
 */
export interface IThemeSnapshot {
  mode: TThemeMode;
  /** `undefined` on the server, where the visitor's theme is unknown. */
  resolvedTheme: TResolvedTheme | undefined;
}

/** Observer contract of the theme store, shaped for `useSyncExternalStore`. */
export interface IThemeStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): IThemeSnapshot;
  getServerSnapshot(): IThemeSnapshot;
  setMode(mode: TThemeMode): void;
  /** Starts syncing with the OS preference and other tabs; returns the cleanup. */
  connect(): () => void;
}

/** Value returned by the `useTheme` hook. */
export interface IUseThemeResult extends IThemeSnapshot {
  setMode: IThemeStore[`setMode`];
}
