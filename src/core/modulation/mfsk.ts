import { goertzelPower } from "../dsp/goertzel";
import { fadeGain } from "../dsp/window";
import type { Protocol } from "../protocol/protocol";
import type { DemodulatedSymbols, Modulation } from "./modulation";

/**
 * M-ary frequency-shift keying: each symbol is one of `2^bits` tones. Tones are faded in/out
 * with raised-cosine ramps (no clicks) and followed by a silent guard interval.
 */
export class MfskModulation implements Modulation {
  readonly name = "mfsk";
  readonly protocol: Protocol;

  constructor(protocol: Protocol) {
    this.protocol = protocol;
  }

  modulate(symbols: readonly number[]): Float32Array {
    const { symbol, slot, ramp } = this.protocol.samples;
    const { frequencies, sampleRate } = this.protocol;
    const out = new Float32Array(symbols.length * slot);
    symbols.forEach((value, index) => {
      const frequency = frequencies[value];
      if (frequency === undefined) throw new RangeError(`Symbol ${value} out of range`);
      const omega = (2 * Math.PI * frequency) / sampleRate;
      const base = index * slot;
      for (let i = 0; i < symbol; i++) {
        out[base + i] = fadeGain(i, symbol, ramp) * Math.sin(omega * i);
      }
    });
    return out;
  }

  demodulate(samples: Float32Array, offset: number, count: number): DemodulatedSymbols {
    const { symbol, slot, ramp } = this.protocol.samples;
    const { frequencies, sampleRate } = this.protocol;
    // Skip the first part of the tone, where the previous symbol's echo still lingers.
    const skip = Math.floor(symbol * 0.2);
    const length = symbol - skip - Math.floor(ramp / 2);
    const symbols: number[] = [];
    let marginSum = 0;

    for (let s = 0; s < count; s++) {
      const start = offset + s * slot + skip;
      let best = 0;
      let bestPower = -1;
      let second = 0;
      frequencies.forEach((frequency, tone) => {
        const power = goertzelPower(samples, start, length, frequency, sampleRate);
        if (power > bestPower) {
          second = bestPower;
          bestPower = power;
          best = tone;
        } else if (power > second) {
          second = power;
        }
      });
      symbols.push(best);
      marginSum += 10 * Math.log10((bestPower + 1e-12) / (Math.max(second, 0) + 1e-12));
    }
    return { symbols, marginDb: count === 0 ? 0 : marginSum / count };
  }
}

export const mfsk = (protocol: Protocol): Modulation => new MfskModulation(protocol);
