/** A discriminated union for operations that can fail without throwing. */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <const T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <const E>(error: E): Result<never, E> => ({ ok: false, error });
