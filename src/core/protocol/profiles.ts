import { type Hertz, hz, type Seconds, seconds } from "../types/brand";

/** Bits carried by one MFSK symbol; the tone count is `2 ** bitsPerSymbol`. */
export type BitsPerSymbol = 1 | 2 | 4 | 8;

export interface BandProfile {
  readonly name: string;
  /** Frequency of tone 0. */
  readonly baseFrequency: Hertz;
  /** Distance between adjacent tones. */
  readonly toneSpacing: Hertz;
  readonly bitsPerSymbol: BitsPerSymbol;
  /** Preamble sweep range. */
  readonly chirp: readonly [start: Hertz, end: Hertz];
}

export interface SpeedProfile {
  readonly name: string;
  /** Duration of each tone. */
  readonly symbolDuration: Seconds;
  /** Silence after each tone — absorbs room reverberation. */
  readonly guardDuration: Seconds;
}

export type BandName = "audible" | "ultrasonic";
export type SpeedName = "fast" | "normal" | "robust";

/** Built-in band presets. `Record<BandName, …>` makes the preset list exhaustive. */
export const BANDS: Readonly<Record<BandName, BandProfile>> = {
  /** Clearly audible "chirp-and-beeps" band; works on virtually every speaker and microphone. */
  audible: {
    name: "audible",
    baseFrequency: hz(1600),
    toneSpacing: hz(120),
    bitsPerSymbol: 4,
    chirp: [hz(1500), hz(3500)],
  },
  /** Near-ultrasonic band; nearly inaudible for most adults, but hardware support varies. */
  ultrasonic: {
    name: "ultrasonic",
    baseFrequency: hz(17_500),
    toneSpacing: hz(100),
    bitsPerSymbol: 4,
    chirp: [hz(17_400), hz(19_100)],
  },
};

export const SPEEDS: Readonly<Record<SpeedName, SpeedProfile>> = {
  fast: { name: "fast", symbolDuration: seconds(0.03), guardDuration: seconds(0.008) },
  normal: { name: "normal", symbolDuration: seconds(0.045), guardDuration: seconds(0.012) },
  robust: { name: "robust", symbolDuration: seconds(0.08), guardDuration: seconds(0.02) },
};

/** Reed–Solomon parity bytes per error-correction level. */
export const ECC_LEVELS = {
  low: 4,
  medium: 8,
  high: 16,
} as const;

export type EccLevel = keyof typeof ECC_LEVELS;
