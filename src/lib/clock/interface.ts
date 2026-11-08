/** Observer contract of the shared clock, shaped for `useSyncExternalStore`. */
export interface IClockStore {
  subscribe(listener: () => void): () => void;
  /** Epoch milliseconds of the last tick. */
  getSnapshot(): number;
  getServerSnapshot(): number;
  /** Ticks now (e.g. after the server changed something "as of now"). */
  refresh(): void;
}
