import { bytesToSymbols } from "./coding/symbols";
import { mfsk } from "./modulation/mfsk";
import type { ModulationFactory } from "./modulation/modulation";
import { type ContentTypeName, encodePayload, type PayloadInput } from "./payload/content";
import { encodeFrame, HEADER_BLOCK_BYTES } from "./protocol/frame";
import {
  CRC_BYTES,
  type Protocol,
  type ProtocolOptions,
  resolveProtocol,
  symbolsFor,
} from "./protocol/protocol";
import { SignalBuilder } from "./signal/signal-builder";
import { type Seconds, seconds } from "./types/brand";

export interface EncoderOptions extends ProtocolOptions {
  /** Peak output amplitude, 0–1. Default 0.8. */
  readonly volume?: number;
  /** Swap the modulation scheme (Strategy). Default: MFSK. */
  readonly modulation?: ModulationFactory;
}

export interface EncodedSignal {
  readonly samples: Float32Array;
  readonly sampleRate: number;
  readonly duration: Seconds;
  readonly contentType: ContentTypeName;
  readonly payloadBytes: number;
  readonly symbolCount: number;
}

/**
 * Facade over framing, error correction, modulation and waveform assembly:
 * `new SonicEncoder(48000).encode("482193")` returns ready-to-play samples.
 */
export class SonicEncoder {
  readonly protocol: Protocol;
  readonly #volume: number;
  readonly #factory: ModulationFactory;

  constructor(sampleRate: number, options: EncoderOptions = {}) {
    this.protocol = resolveProtocol(sampleRate, options);
    this.#volume = options.volume ?? 0.8;
    this.#factory = options.modulation ?? mfsk;
  }

  encode(input: PayloadInput): EncodedSignal {
    const { type, bytes } = encodePayload(input);
    const frame = encodeFrame(this.protocol, bytes, type);
    const bits = this.protocol.band.bitsPerSymbol;
    const headerSymbols = bytesToSymbols(frame.header, bits);
    const bodySymbols = bytesToSymbols(frame.body, bits);
    const { leadIn, gap, tail } = this.protocol.samples;

    const samples = new SignalBuilder(this.#factory(this.protocol))
      .silence(leadIn)
      .preamble()
      .silence(gap)
      .symbols(headerSymbols)
      .symbols(bodySymbols)
      .silence(tail)
      .build(this.#volume);

    return {
      samples,
      sampleRate: this.protocol.sampleRate,
      duration: seconds(samples.length / this.protocol.sampleRate),
      contentType: type,
      payloadBytes: bytes.length,
      symbolCount: headerSymbols.length + bodySymbols.length,
    };
  }

  /** Airtime for a payload of `payloadBytes` encoded bytes, without encoding it. */
  estimateDuration(payloadBytes: number): Seconds {
    const p = this.protocol;
    const symbols =
      symbolsFor(p, HEADER_BLOCK_BYTES) + symbolsFor(p, payloadBytes + CRC_BYTES + p.eccParity);
    const total =
      p.samples.leadIn +
      p.samples.chirp +
      p.samples.gap +
      symbols * p.samples.slot +
      p.samples.tail;
    return seconds(total / p.sampleRate);
  }
}
