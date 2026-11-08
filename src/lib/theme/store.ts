import {
  DARK_SCHEME_QUERY,
  DEFAULT_THEME_MODE,
  RESOLVED_THEMES,
  THEME_MODES,
  THEME_STORAGE_KEY,
} from './constants';
import { siteConfig } from '@/config';
import {
  IThemeSnapshot,
  IThemeStore,
  TResolvedTheme,
  TThemeMode,
} from './interface';

/** Stylesheet that freezes every transition while the theme class flips. */
const DISABLE_TRANSITIONS_CSS = `*,*::before,*::after{-webkit-transition:none!important;transition:none!important}`;

const isBrowser = (): boolean => typeof window !== `undefined`;

const isThemeMode = (value: unknown): value is TThemeMode =>
  THEME_MODES.includes(value as TThemeMode);

/**
 * Theme store — a framework-agnostic Singleton that applies the colour theme
 * and notifies subscribers (Observer) when it changes.
 *
 * - Plugs straight into `useSyncExternalStore`, so there is no React context
 *   and no provider re-render: only components that read the theme update.
 * - Resolves `system` against `prefers-color-scheme` and follows the OS live.
 * - Persists the choice in `localStorage` and syncs it across tabs.
 * - The first paint is handled by `themeInitScript`; this store takes over
 *   after hydration and keeps the same resolution rules.
 * - Keeps `<meta name="theme-color">` in step with the *chosen* theme, so an
 *   installed PWA's status bar matches even when it differs from the OS.
 */
class ThemeStore implements IThemeStore {
  private static instance: ThemeStore | undefined;

  private readonly listeners = new Set<() => void>();

  private readonly serverSnapshot: IThemeSnapshot = {
    mode: DEFAULT_THEME_MODE,
    resolvedTheme: undefined,
  };

  private snapshot: IThemeSnapshot = this.serverSnapshot;

  private constructor() {
    if (isBrowser()) {
      const mode = this.readStoredMode();
      this.snapshot = { mode, resolvedTheme: this.resolve(mode) };
    }
  }

  /** Returns the one shared store (Singleton). */
  public static getInstance(): ThemeStore {
    ThemeStore.instance ??= new ThemeStore();
    return ThemeStore.instance;
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): IThemeSnapshot => this.snapshot;

  public getServerSnapshot = (): IThemeSnapshot => this.serverSnapshot;

  public setMode = (mode: TThemeMode): void => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Storage can be unavailable (private mode); the choice still applies
      // for the current page.
    }
    this.update(mode);
  };

  public connect = (): (() => void) => {
    if (!isBrowser()) {
      return () => {};
    }

    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const onSchemeChange = (): void => {
      if (this.snapshot.mode === `system`) {
        this.update(`system`);
      }
    };
    const onStorage = (event: StorageEvent): void => {
      if (event.key === THEME_STORAGE_KEY) {
        this.update(this.readStoredMode());
      }
    };

    media.addEventListener(`change`, onSchemeChange);
    window.addEventListener(`storage`, onStorage);
    // Re-sync in case the OS preference changed between the bootstrap script
    // and hydration.
    this.update(this.snapshot.mode);

    return () => {
      media.removeEventListener(`change`, onSchemeChange);
      window.removeEventListener(`storage`, onStorage);
    };
  };

  private update(mode: TThemeMode): void {
    const resolvedTheme = this.resolve(mode);
    this.apply(resolvedTheme);
    this.syncThemeColor(resolvedTheme);

    if (
      mode === this.snapshot.mode &&
      resolvedTheme === this.snapshot.resolvedTheme
    ) {
      return;
    }
    this.snapshot = { mode, resolvedTheme };
    this.listeners.forEach((listener) => listener());
  }

  private resolve(mode: TThemeMode): TResolvedTheme {
    if (mode !== `system`) {
      return mode;
    }
    return window.matchMedia(DARK_SCHEME_QUERY).matches ? `dark` : `light`;
  }

  private readStoredMode(): TThemeMode {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return isThemeMode(stored) ? stored : DEFAULT_THEME_MODE;
    } catch {
      return DEFAULT_THEME_MODE;
    }
  }

  /** Points every `theme-color` meta tag at the painted theme's base colour. */
  private syncThemeColor(resolvedTheme: TResolvedTheme): void {
    const color = siteConfig.themeColor[resolvedTheme];
    document
      .querySelectorAll<HTMLMetaElement>(`meta[name="theme-color"]`)
      .forEach((meta) => meta.setAttribute(`content`, color));
  }

  /** Writes the theme class to `<html>` without animating every colour change. */
  private apply(resolvedTheme: TResolvedTheme): void {
    const root = document.documentElement;
    if (root.classList.contains(resolvedTheme)) {
      return;
    }

    const freeze = document.createElement(`style`);
    freeze.appendChild(document.createTextNode(DISABLE_TRANSITIONS_CSS));
    document.head.appendChild(freeze);

    root.classList.remove(...RESOLVED_THEMES);
    root.classList.add(resolvedTheme);

    // Force a style recalculation so the frozen state is committed before the
    // transitions are restored.
    void window.getComputedStyle(document.body).opacity;
    requestAnimationFrame(() => freeze.remove());
  }
}

export const themeStore: IThemeStore = ThemeStore.getInstance();
