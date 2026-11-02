import { linearChirp } from "../dsp/chirp";
import type { Modulation } from "../modulation/modulation";
import type { Protocol } from "../protocol/protocol";

/**
 * Builder pattern: assembles a transmission waveform step by step
 * (`silence → preamble → symbols → …`) and produces the final buffer once.
 */
export class SignalBuilder {
  readonly #protocol: Protocol;
  readonly #modulation: Modulation;
  readonly #parts: Float32Array[] = [];

  constructor(modulation: Modulation) {
    this.#modulation = modulation;
    this.#protocol = modulation.protocol;
  }

  silence(samples: number): this {
    this.#parts.push(new Float32Array(samples));
    return this;
  }

  preamble(): this {
    this.#parts.push(preambleFor(this.#protocol));
    return this;
  }

  symbols(symbols: readonly number[]): this {
    this.#parts.push(this.#modulation.modulate(symbols));
    return this;
  }

  /** Concatenates all parts and scales the result to `volume` peak amplitude. */
  build(volume = 0.8): Float32Array {
    const total = this.#parts.reduce((n, p) => n + p.length, 0);
    const out = new Float32Array(total);
    let offset = 0;
    let peak = 0;
    for (const part of this.#parts) {
      out.set(part, offset);
      offset += part.length;
      for (const v of part) peak = Math.max(peak, Math.abs(v));
    }
    const gain = peak > 0 ? Math.min(1, Math.max(0, volume)) / peak : 0;
    for (let i = 0; i < out.length; i++) out[i]! *= gain;
    return out;
  }
}

const preambleCache = new WeakMap<Protocol, Float32Array>();

/** The sync chirp for a protocol; identical on sender and receiver. */
export function preambleFor(protocol: Protocol): Float32Array {
  let chirp = preambleCache.get(protocol);
  if (!chirp) {
    const [start, end] = protocol.band.chirp;
    chirp = linearChirp(start, end, protocol.samples.chirp, protocol.sampleRate);
    preambleCache.set(protocol, chirp);
  }
  return chirp;
}
