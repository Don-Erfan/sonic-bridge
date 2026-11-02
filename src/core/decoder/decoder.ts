import { BandPassFilter } from "../dsp/biquad";
import { SampleBuffer } from "../dsp/sample-buffer";
import { SyncDetector } from "../dsp/sync-detector";
import { TypedEmitter } from "../events";
import { mfsk } from "../modulation/mfsk";
import type { Modulation, ModulationFactory } from "../modulation/modulation";
import { type Protocol, type ProtocolOptions, resolveProtocol } from "../protocol/protocol";
import { preambleFor } from "../signal/signal-builder";
import type { DecoderEvents } from "./events";
import type { ReceivedPacket } from "./message";
import {
  type DecoderContext,
  type DecoderState,
  type DecoderStateName,
  SearchingState,
} from "./states";

export interface DecoderOptions extends ProtocolOptions {
  readonly modulation?: ModulationFactory;
  /** Apply a band-pass input filter. Default `true`. */
  readonly filter?: boolean;
}

/**
 * Streaming receiver. Push raw microphone samples in any chunk size; listen for `packet`.
 * Internally a State machine (searching → header → body) driven by incoming audio.
 */
export class SonicDecoder extends TypedEmitter<DecoderEvents> {
  readonly protocol: Protocol;
  readonly #buffer = new SampleBuffer();
  readonly #sync: SyncDetector;
  readonly #modulation: Modulation;
  readonly #filter: BandPassFilter | null;
  readonly #context: DecoderContext;
  #state: DecoderState = new SearchingState();

  constructor(sampleRate: number, options: DecoderOptions = {}) {
    super();
    this.protocol = resolveProtocol(sampleRate, options);
    this.#modulation = (options.modulation ?? mfsk)(this.protocol);
    this.#sync = new SyncDetector(preambleFor(this.protocol), this.protocol.syncThreshold);
    const [low, high] = this.protocol.passBand;
    this.#filter = options.filter === false ? null : new BandPassFilter(low, high, sampleRate);

    this.#context = {
      protocol: this.protocol,
      buffer: this.#buffer,
      sync: this.#sync,
      modulation: this.#modulation,
      transition: (state) => {
        this.#state = state;
        this.emit("state", state.name);
      },
      emit: (type, payload) => this.emit(type, payload),
    };
  }

  get state(): DecoderStateName {
    return this.#state.name;
  }

  /** Feeds samples into the decoder. Events fire synchronously during this call. */
  push(chunk: Float32Array): void {
    this.#buffer.append(this.#filter ? this.#filter.process(chunk) : chunk);
    let guard = 64;
    while (guard-- > 0 && this.#state.step(this.#context)) {
      // keep stepping while states make progress
    }
  }

  /** Pads with silence so frames at the very end of a finite recording are processed. */
  flush(): void {
    const pad = new Float32Array(this.protocol.samples.chirp * 4 + this.protocol.sampleRate);
    this.push(pad);
  }

  reset(): void {
    this.#buffer.clear();
    this.#sync.seek(this.#buffer.end);
    this.#filter?.reset();
    this.#context.transition(new SearchingState());
  }

  /** Convenience: decodes every frame in a complete recording. */
  static decodeAll(
    samples: Float32Array,
    sampleRate: number,
    options: DecoderOptions = {},
  ): ReceivedPacket[] {
    const decoder = new SonicDecoder(sampleRate, options);
    const packets: ReceivedPacket[] = [];
    decoder.on("packet", (p) => packets.push(p));
    decoder.push(samples);
    decoder.flush();
    return packets;
  }
}
