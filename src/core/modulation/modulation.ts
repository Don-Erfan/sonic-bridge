import type { Protocol } from "../protocol/protocol";

export interface DemodulatedSymbols {
  readonly symbols: number[];
  /** Mean ratio (dB) between the strongest and the runner-up tone; higher is cleaner. */
  readonly marginDb: number;
}

/**
 * Strategy interface for turning symbols into a waveform and back. The rest of the
 * engine (framing, sync, state machine) is independent of the concrete scheme.
 */
export interface Modulation {
  readonly name: string;
  readonly protocol: Protocol;
  /** Renders `symbols` as consecutive slots (tone + guard). */
  modulate(symbols: readonly number[]): Float32Array;
  /** Demodulates `count` slots starting at `offset` within `samples`. */
  demodulate(samples: Float32Array, offset: number, count: number): DemodulatedSymbols;
}

export type ModulationFactory = (protocol: Protocol) => Modulation;
