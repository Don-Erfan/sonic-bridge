import { TResolvedTheme, TThemeMode } from './interface';

/** `localStorage` key holding the user's {@link TThemeMode}. */
export const THEME_STORAGE_KEY = `ozone-theme`;

/** Mode used until the user picks one. */
export const DEFAULT_THEME_MODE: TThemeMode = `system`;

/** Every valid mode, used to validate untrusted storage values. */
export const THEME_MODES: readonly TThemeMode[] = [`light`, `dark`, `system`];

/** Classes HeroUI and Tailwind's `dark:` variant key off (`.light` / `.dark`). */
export const RESOLVED_THEMES: readonly TResolvedTheme[] = [`light`, `dark`];

/** Media query for the OS-level dark preference. */
export const DARK_SCHEME_QUERY = `(prefers-color-scheme: dark)`;
