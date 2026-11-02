const hannCache = new Map<number, Float32Array>();

/** Hann window of length `n` (cached). */
export function hann(n: number): Float32Array {
  let w = hannCache.get(n);
  if (!w) {
    w = new Float32Array(n);
    for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    hannCache.set(n, w);
  }
  return w;
}

/** Raised-cosine fade gain for sample `i` of a segment of `length` with `ramp` samples per edge. */
export function fadeGain(i: number, length: number, ramp: number): number {
  if (ramp <= 0) return 1;
  if (i < ramp) return 0.5 - 0.5 * Math.cos((Math.PI * i) / ramp);
  const fromEnd = length - 1 - i;
  if (fromEnd < ramp) return 0.5 - 0.5 * Math.cos((Math.PI * fromEnd) / ramp);
  return 1;
}
