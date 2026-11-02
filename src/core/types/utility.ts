/** Flattens intersections in editor tooltips. */
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

/** Value union of an object type: `ValueOf<{ a: 1; b: 2 }>` is `1 | 2`. */
export type ValueOf<T> = T[keyof T];

/** Makes the listed keys required while leaving the rest untouched. */
export type WithRequired<T, K extends keyof T> = Simplify<T & { [P in K]-?: T[P] }>;

/** Compile-time exhaustiveness guard for `switch` statements over unions. */
export function assertNever(value: never, message = "Unexpected value"): never {
  throw new Error(`${message}: ${String(value)}`);
}
