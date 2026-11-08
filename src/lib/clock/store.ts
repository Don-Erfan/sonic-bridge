import { IClockStore } from './interface';

/** How often subscribed components see a new "now". */
export const CLOCK_TICK_MS = 30_000;

/**
 * Shared wall clock — a Singleton that ticks only while something listens
 * (Observer, shaped for `useSyncExternalStore`).
 *
 * Time-dependent UI (room availability, "happening now", greetings) reads
 * "now" from here instead of calling `Date.now()` during render: render stays
 * pure (the React Compiler may memoise it), every component agrees on the
 * same instant, and one interval serves the whole app. It also re-ticks when
 * the page becomes visible again — an installed PWA resumed after hours must
 * not show stale room states.
 */
class ClockStore implements IClockStore {
  private static instance: ClockStore | undefined;

  private readonly listeners = new Set<() => void>();

  private now = Date.now();

  private timer: ReturnType<typeof setInterval> | undefined;

  private constructor() {}

  public static getInstance(): ClockStore {
    ClockStore.instance ??= new ClockStore();
    return ClockStore.instance;
  }

  public subscribe = (listener: () => void): (() => void) => {
    if (this.listeners.size === 0) this.start();
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  };

  public getSnapshot = (): number => this.now;

  /** `0` on the server: time-dependent UI renders only with client data. */
  public getServerSnapshot = (): number => 0;

  public refresh = (): void => {
    if (this.listeners.size > 0) this.tick();
  };

  private tick = (): void => {
    this.now = Date.now();
    this.listeners.forEach((listener) => listener());
  };

  private onVisibilityChange = (): void => {
    if (document.visibilityState === `visible`) this.tick();
  };

  private start(): void {
    // Fresh value before the first subscriber reads it; React re-checks the
    // snapshot right after subscribing, so no notification is needed here.
    this.now = Date.now();
    this.timer = setInterval(this.tick, CLOCK_TICK_MS);
    document.addEventListener(`visibilitychange`, this.onVisibilityChange);
  }

  private stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
    document.removeEventListener(`visibilitychange`, this.onVisibilityChange);
  }
}

export const clockStore: IClockStore = ClockStore.getInstance();
