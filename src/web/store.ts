/**
 * Minimal observable state container (Observer pattern). Its `subscribe`/`getSnapshot`
 * pair matches React's `useSyncExternalStore` contract, but it has no React dependency.
 */
export class Store<S> {
  #state: S;
  readonly #listeners = new Set<() => void>();

  constructor(initial: S) {
    this.#state = initial;
  }

  readonly getSnapshot = (): S => this.#state;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  set(next: S | ((previous: S) => S)): void {
    const value = typeof next === "function" ? (next as (previous: S) => S)(this.#state) : next;
    if (Object.is(value, this.#state)) return;
    this.#state = value;
    for (const listener of [...this.#listeners]) listener();
  }
}
