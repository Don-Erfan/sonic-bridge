import {
  IBeforeInstallPromptEvent,
  IInstallPromptStore,
  IInstallSnapshot,
  TInstallOutcome,
} from './interface';

const STANDALONE_QUERY = `(display-mode: standalone)`;

const isIos = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  // iPadOS 13+ reports itself as macOS; touch support gives it away.
  (navigator.userAgent.includes(`Macintosh`) && navigator.maxTouchPoints > 1);

const isStandalone = (): boolean =>
  window.matchMedia(STANDALONE_QUERY).matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/**
 * PWA install state — a Singleton that captures Chromium's
 * `beforeinstallprompt` as early as possible (the event can fire before
 * React hydrates, so the listener is attached when this module first loads
 * in the browser) and publishes the install capability (Observer).
 */
class InstallPromptStore implements IInstallPromptStore {
  private static instance: InstallPromptStore | undefined;

  private readonly listeners = new Set<() => void>();

  private readonly serverSnapshot: IInstallSnapshot = {
    isInstalled: false,
    platform: `unsupported`,
  };

  private deferred: IBeforeInstallPromptEvent | null = null;

  private snapshot: IInstallSnapshot = this.serverSnapshot;

  private constructor() {
    if (typeof window === `undefined`) return;

    this.snapshot = this.compute();
    window.addEventListener(`beforeinstallprompt`, (event) => {
      // Keep the browser's mini-infobar from showing; the app offers its own
      // install button at a moment the user chooses.
      event.preventDefault();
      this.deferred = event as IBeforeInstallPromptEvent;
      this.refresh();
    });
    window.addEventListener(`appinstalled`, () => {
      this.deferred = null;
      this.refresh(true);
    });
    window
      .matchMedia(STANDALONE_QUERY)
      .addEventListener(`change`, () => this.refresh());
  }

  public static getInstance(): InstallPromptStore {
    InstallPromptStore.instance ??= new InstallPromptStore();
    return InstallPromptStore.instance;
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): IInstallSnapshot => this.snapshot;

  public getServerSnapshot = (): IInstallSnapshot => this.serverSnapshot;

  public prompt = async (): Promise<TInstallOutcome> => {
    const event = this.deferred;
    if (!event) return `unavailable`;
    // A deferred prompt can be shown only once.
    this.deferred = null;
    await event.prompt();
    const { outcome } = await event.userChoice;
    this.refresh(outcome === `accepted`);
    return outcome;
  };

  private compute(forceInstalled = false): IInstallSnapshot {
    const isInstalled = forceInstalled || isStandalone();
    const platform = this.deferred ? `prompt` : isIos() ? `ios` : `unsupported`;
    return { isInstalled, platform };
  }

  private refresh(forceInstalled = false): void {
    const next = this.compute(forceInstalled);
    if (
      next.isInstalled === this.snapshot.isInstalled &&
      next.platform === this.snapshot.platform
    ) {
      return;
    }
    this.snapshot = next;
    this.listeners.forEach((listener) => listener());
  }
}

export const installPromptStore: IInstallPromptStore =
  InstallPromptStore.getInstance();
