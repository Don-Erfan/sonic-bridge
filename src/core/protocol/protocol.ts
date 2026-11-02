import { invariant } from "../errors";
import {
  type Hertz,
  hz,
  type SampleCount,
  type SampleRate,
  seconds,
  toSamples,
} from "../types/brand";
import type { Simplify } from "../types/utility";
import {
  BANDS,
  type BandName,
  type BandProfile,
  ECC_LEVELS,
  type EccLevel,
  SPEEDS,
  type SpeedName,
  type SpeedProfile,
} from "./profiles";

/** Hard upper bound for a single frame's payload. */
export const MAX_PAYLOAD_BYTES = 128;
export const DEFAULT_MAX_PAYLOAD_BYTES = 32;
export const PROTOCOL_VERSION = 1;
export const HEADER_BYTES = 2;
export const HEADER_PARITY = 4;
export const CRC_BYTES = 2;

/** Options shared by encoder and decoder. Both sides must agree on band and speed. */
export interface ProtocolOptions {
  /** Frequency band preset or a custom profile. Default: `"audible"`. */
  readonly band?: BandName | BandProfile;
  /** Timing preset or a custom profile. Default: `"normal"`. */
  readonly speed?: SpeedName | SpeedProfile;
  /** Error-correction strength used when *sending* (receivers read it from the header). Default: `"medium"`. */
  readonly ecc?: EccLevel;
  /** Largest accepted payload. Default 32, max 128. */
  readonly maxPayloadBytes?: number;
  /** Preamble detection threshold (normalized correlation, 0–1). Default 0.3. */
  readonly syncThreshold?: number;
}

/** All derived numbers needed to (de)modulate at a concrete sample rate. */
export interface Protocol {
  readonly sampleRate: SampleRate;
  readonly band: BandProfile;
  readonly speed: SpeedProfile;
  readonly eccParity: number;
  readonly maxPayloadBytes: number;
  readonly syncThreshold: number;
  readonly frequencies: readonly Hertz[];
  readonly samples: Simplify<{
    readonly leadIn: SampleCount;
    readonly chirp: SampleCount;
    readonly gap: SampleCount;
    readonly symbol: SampleCount;
    readonly guard: SampleCount;
    readonly slot: SampleCount;
    readonly ramp: SampleCount;
    readonly tail: SampleCount;
  }>;
  /** Pass band used by the receiver's input filter. */
  readonly passBand: readonly [low: Hertz, high: Hertz];
}

const isPreset = <K extends string>(presets: Readonly<Record<K, unknown>>, key: string): key is K =>
  Object.hasOwn(presets, key);

function resolveNamed<K extends string, T extends object>(
  value: K | T | undefined,
  presets: Readonly<Record<K, T>>,
  fallback: NoInfer<K>,
  label: string,
): T {
  if (value === undefined) return presets[fallback];
  if (typeof value === "string") {
    invariant(isPreset(presets, value), `Unknown ${label} preset "${value}"`);
    return presets[value];
  }
  return value;
}

export function resolveProtocol(rate: number, options: ProtocolOptions = {}): Protocol {
  invariant(Number.isFinite(rate) && rate >= 8000, `Invalid sample rate: ${rate}`);
  const sampleRate = rate as SampleRate;
  const band = resolveNamed(options.band, BANDS, "audible", "band");
  const speed = resolveNamed(options.speed, SPEEDS, "normal", "speed");
  const ecc = options.ecc ?? "medium";
  invariant(Object.hasOwn(ECC_LEVELS, ecc), `Unknown ECC level "${ecc}"`);

  const maxPayloadBytes = options.maxPayloadBytes ?? DEFAULT_MAX_PAYLOAD_BYTES;
  invariant(
    Number.isInteger(maxPayloadBytes) &&
      maxPayloadBytes > 0 &&
      maxPayloadBytes <= MAX_PAYLOAD_BYTES,
    `maxPayloadBytes must be an integer in [1, ${MAX_PAYLOAD_BYTES}]`,
  );
  const syncThreshold = options.syncThreshold ?? 0.3;
  invariant(syncThreshold > 0 && syncThreshold < 1, "syncThreshold must be in (0, 1)");

  const toneCount = 2 ** band.bitsPerSymbol;
  const frequencies = Array.from({ length: toneCount }, (_, i) =>
    hz(band.baseFrequency + i * band.toneSpacing),
  );
  const highest = Math.max(frequencies.at(-1)!, band.chirp[0], band.chirp[1]);
  invariant(
    highest < sampleRate * 0.45,
    `Band "${band.name}" reaches ${highest} Hz, too high for a ${sampleRate} Hz sample rate`,
  );
  invariant(speed.symbolDuration > 0 && speed.guardDuration >= 0, "Invalid speed profile");
  invariant(
    band.toneSpacing * speed.symbolDuration * 0.75 >= 2,
    `Tone spacing ${band.toneSpacing} Hz is too narrow for ${speed.symbolDuration}s symbols`,
  );

  const low = Math.min(band.baseFrequency, band.chirp[0], band.chirp[1]);
  const symbol = toSamples(speed.symbolDuration, sampleRate);
  const guard = toSamples(speed.guardDuration, sampleRate);

  return {
    sampleRate,
    band,
    speed,
    eccParity: ECC_LEVELS[ecc],
    maxPayloadBytes,
    syncThreshold,
    frequencies,
    samples: {
      leadIn: toSamples(seconds(0.08), sampleRate),
      chirp: toSamples(seconds(0.12), sampleRate),
      gap: toSamples(seconds(0.04), sampleRate),
      symbol,
      guard,
      slot: (symbol + guard) as SampleCount,
      ramp: toSamples(seconds(Math.min(0.005, speed.symbolDuration / 6)), sampleRate),
      tail: toSamples(seconds(0.08), sampleRate),
    },
    passBand: [hz(Math.max(50, low - 300)), hz(Math.min(sampleRate * 0.49, highest + 300))],
  };
}

/** Number of symbols needed to carry `bytes` bytes. */
export const symbolsFor = (protocol: Protocol, bytes: number): number =>
  Math.ceil((bytes * 8) / protocol.band.bitsPerSymbol);
