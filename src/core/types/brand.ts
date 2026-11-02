declare const brand: unique symbol;

/**
 * Nominal ("branded") type: structurally a `T`, but not assignable from a plain `T`.
 * Prevents mixing up e.g. a frequency with a duration — both are `number` at runtime.
 */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

/** Frequency in Hertz. */
export type Hertz = Brand<number, "Hertz">;
/** Duration in seconds. */
export type Seconds = Brand<number, "Seconds">;
/** Audio sample rate in samples per second. */
export type SampleRate = Brand<number, "SampleRate">;
/** A count of audio samples (an integer). */
export type SampleCount = Brand<number, "SampleCount">;

export const hz = (value: number): Hertz => value as Hertz;
export const seconds = (value: number): Seconds => value as Seconds;
export const sampleRate = (value: number): SampleRate => value as SampleRate;

/** Converts a duration to a whole number of samples at the given rate. */
export const toSamples = (duration: Seconds, rate: SampleRate): SampleCount =>
  Math.round(duration * rate) as SampleCount;
