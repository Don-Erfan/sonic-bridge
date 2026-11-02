export type Listener<T> = (payload: T) => void;
export type Unsubscribe = () => void;

/**
 * Observer pattern with a type-safe event map. `Events` maps event names to payload types,
 * so `on("packet", p => …)` infers `p` from the map.
 */
export class TypedEmitter<Events extends { [K in keyof Events]: unknown }> {
  readonly #listeners = new Map<keyof Events, Set<Listener<never>>>();

  on<K extends keyof Events>(type: K, listener: Listener<Events[K]>): Unsubscribe {
    let set = this.#listeners.get(type);
    if (!set) {
      set = new Set();
      this.#listeners.set(type, set);
    }
    set.add(listener);
    return () => this.off(type, listener);
  }

  once<K extends keyof Events>(type: K, listener: Listener<Events[K]>): Unsubscribe {
    const off = this.on(type, (payload) => {
      off();
      listener(payload);
    });
    return off;
  }

  off<K extends keyof Events>(type: K, listener: Listener<Events[K]>): void {
    this.#listeners.get(type)?.delete(listener);
  }

  removeAllListeners(): void {
    this.#listeners.clear();
  }

  protected emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const set = this.#listeners.get(type) as Set<Listener<Events[K]>> | undefined;
    if (!set) return;
    for (const listener of [...set]) listener(payload);
  }
}
