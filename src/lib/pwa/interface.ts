/** How the app can be installed on this device. */
export type TInstallPlatform =
  /** Chromium: a deferred `beforeinstallprompt` is ready to show. */
  | `prompt`
  /** iOS / iPadOS Safari: manual "Add to Home Screen" only. */
  | `ios`
  /** Anything else: install from the browser menu, if at all. */
  | `unsupported`;

export interface IInstallSnapshot {
  /** Running as an installed app (standalone display mode). */
  isInstalled: boolean;
  platform: TInstallPlatform;
}

export type TInstallOutcome = `accepted` | `dismissed` | `unavailable`;

/** Observer contract of the install store, shaped for `useSyncExternalStore`. */
export interface IInstallPromptStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): IInstallSnapshot;
  getServerSnapshot(): IInstallSnapshot;
  /** Shows the browser's install dialog (Chromium only). */
  prompt(): Promise<TInstallOutcome>;
}

/**
 * Chromium's `beforeinstallprompt` event — not part of the standard DOM
 * typings, so it is declared here.
 */
export interface IBeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: `accepted` | `dismissed` }>;
}
