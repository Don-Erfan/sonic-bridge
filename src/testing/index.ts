/**
 * Deterministic acoustic-channel simulator for tests and benchmarks.
 * Exposed as `@don-erfan/sonic-bridge/testing`.
 */
export interface Echo {
  readonly delay: number; // seconds
  readonly gain: number;
}

export interface ChannelOptions {
  /** Sample rate of the input signal. */
  readonly fromRate: number;
  /** Sample rate of the receiving device. Defaults to `fromRate`. */
  readonly toRate?: number;
  /** Signal-to-noise ratio in dB (white noise, relative to signal RMS). `Infinity` = no noise. */
  readonly snrDb?: number;
  /** Silence before the signal arrives, in seconds. */
  readonly delay?: number;
  /** Overall attenuation factor. */
  readonly gain?: number;
  /** Reflections (room reverb approximation). */
  readonly echoes?: readonly Echo[];
  /** Relative clock error between devices, e.g. `50e-6` for 50 ppm. */
  readonly clockDrift?: number;
  readonly seed?: number;
}

/** Small, fast, seedable PRNG (mulberry32). */
export function createRandom(seed = 1): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateChannel(input: Float32Array, options: ChannelOptions): Float32Array {
  const {
    fromRate,
    toRate = fromRate,
    snrDb = Number.POSITIVE_INFINITY,
    delay = 0.2,
    gain = 1,
  } = options;
  const random = createRandom(options.seed ?? 1);

  // Echoes at the source rate.
  let signal = Float32Array.from(input, (v) => v * gain);
  const echoes = options.echoes ?? [];
  if (echoes.length > 0) {
    const maxDelay = Math.max(...echoes.map((e) => Math.round(e.delay * fromRate)));
    const out = new Float32Array(signal.length + maxDelay);
    out.set(signal);
    for (const echo of echoes) {
      const d = Math.round(echo.delay * fromRate);
      for (let i = 0; i < signal.length; i++) out[i + d]! += signal[i]! * echo.gain;
    }
    signal = out;
  }

  // Resample (linear interpolation) including clock drift.
  const ratio = (fromRate / toRate) * (1 + (options.clockDrift ?? 0));
  const length = Math.floor(signal.length / ratio);
  const resampled = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const x = i * ratio;
    const i0 = Math.floor(x);
    const frac = x - i0;
    resampled[i] = (signal[i0] ?? 0) * (1 - frac) + (signal[i0 + 1] ?? 0) * frac;
  }

  const lead = Math.round(delay * toRate);
  const out = new Float32Array(lead + resampled.length + Math.round(0.3 * toRate));
  out.set(resampled, lead);

  if (Number.isFinite(snrDb)) {
    let power = 0;
    let active = 0;
    for (const v of resampled) {
      if (v !== 0) {
        power += v * v;
        active++;
      }
    }
    const signalRms = Math.sqrt(power / Math.max(1, active));
    const noiseRms = signalRms / 10 ** (snrDb / 20);
    for (let i = 0; i < out.length; i++) out[i]! += gaussian(random) * noiseRms;
  }
  return out;
}

function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

/** Splits samples into chunks of varying size, like an audio callback would deliver them. */
export function* chunked(
  samples: Float32Array,
  sizes: readonly number[] = [128],
): Generator<Float32Array> {
  let offset = 0;
  let i = 0;
  while (offset < samples.length) {
    const size = sizes[i++ % sizes.length]!;
    yield samples.subarray(offset, offset + size);
    offset += size;
  }
}
