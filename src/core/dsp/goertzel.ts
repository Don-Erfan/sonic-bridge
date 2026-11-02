import { hann } from "./window";

/**
 * Goertzel algorithm: power of a single frequency over a window of samples.
 * Cheaper than a full FFT when only a handful of tones are of interest.
 */
export function goertzelPower(
  samples: Float32Array,
  start: number,
  length: number,
  frequency: number,
  sampleRate: number,
): number {
  const window = hann(length);
  const coeff = 2 * Math.cos((2 * Math.PI * frequency) / sampleRate);
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < length; i++) {
    const s0 = (samples[start + i] ?? 0) * window[i]! + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  return s1 * s1 + s2 * s2 - coeff * s1 * s2;
}
