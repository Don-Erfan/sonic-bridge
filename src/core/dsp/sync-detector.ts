import { FFT, nextPowerOfTwo } from "./fft";
import type { SampleBuffer } from "./sample-buffer";

export interface SyncMatch {
  /** Absolute sample index where the preamble begins. */
  readonly position: number;
  /** Normalized cross-correlation in [0, 1]. */
  readonly score: number;
}

/**
 * Streaming matched filter: finds a known preamble in a sample stream using FFT-based
 * normalized cross-correlation (overlap-save). Independent of what follows the preamble.
 */
export class SyncDetector {
  readonly #template: Float32Array;
  readonly #templateEnergy: number;
  readonly #fft: FFT;
  readonly #templateRe: Float64Array;
  readonly #templateIm: Float64Array;
  readonly #hop: number;
  readonly #peakRadius: number;
  readonly #threshold: number;
  #position = 0;

  constructor(template: Float32Array, threshold: number) {
    this.#template = template;
    this.#threshold = threshold;
    const length = template.length;
    this.#fft = new FFT(nextPowerOfTwo(length * 2));
    this.#hop = this.#fft.size - length + 1;
    this.#peakRadius = Math.max(16, Math.floor(length / 16));
    this.#templateRe = new Float64Array(this.#fft.size);
    this.#templateIm = new Float64Array(this.#fft.size);
    let energy = 0;
    for (let i = 0; i < length; i++) {
      this.#templateRe[i] = template[i]!;
      energy += template[i]! ** 2;
    }
    this.#templateEnergy = energy;
    this.#fft.forward(this.#templateRe, this.#templateIm);
  }

  /** Absolute index from which the next search continues. */
  get position(): number {
    return this.#position;
  }

  /** Resumes searching at `position` (e.g. after a frame has been consumed). */
  seek(position: number): void {
    this.#position = position;
  }

  /** Scans all complete blocks currently in the buffer; returns the first match, if any. */
  scan(buffer: SampleBuffer): SyncMatch | null {
    const n = this.#fft.size;
    const length = this.#template.length;
    if (this.#position < buffer.start) this.#position = buffer.start;

    while (buffer.has(this.#position, this.#position + n)) {
      const segment = buffer.view(this.#position, this.#position + n);
      const ncc = this.#correlate(segment);
      const hit = ncc.findIndex((v) => v >= this.#threshold);
      if (hit === -1) {
        this.#position += this.#hop;
        continue;
      }
      if (hit + this.#peakRadius >= this.#hop) {
        // The peak may straddle the block edge: realign the next block to start at the crossing.
        this.#position += Math.max(1, hit);
        continue;
      }
      let best = hit;
      for (let i = hit + 1; i <= hit + this.#peakRadius; i++) if (ncc[i]! > ncc[best]!) best = i;
      const match = { position: this.#position + best, score: ncc[best]! };
      this.#position = match.position + length;
      return match;
    }
    return null;
  }

  #correlate(segment: Float32Array): Float64Array {
    const n = this.#fft.size;
    const length = this.#template.length;
    const re = new Float64Array(n);
    const im = new Float64Array(n);
    re.set(segment);
    this.#fft.forward(re, im);
    // Multiply by the conjugate of the template spectrum → cross-correlation.
    for (let i = 0; i < n; i++) {
      const ar = re[i]!;
      const ai = im[i]!;
      const br = this.#templateRe[i]!;
      const bi = -this.#templateIm[i]!;
      re[i] = ar * br - ai * bi;
      im[i] = ar * bi + ai * br;
    }
    this.#fft.inverse(re, im);

    // Sliding window energy via prefix sums for normalization.
    const prefix = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i]! + segment[i]! ** 2;

    // Near-silent windows would turn FFT round-off into huge scores: ignore anything below an
    // absolute floor (RMS 1e-5, quieter than any real microphone) or far below the segment's loudest window.
    let loudest = 0;
    for (let k = 0; k < this.#hop; k++)
      loudest = Math.max(loudest, prefix[k + length]! - prefix[k]!);
    const floor = Math.max(length * 1e-10, loudest * 1e-6);

    const ncc = new Float64Array(this.#hop);
    for (let k = 0; k < this.#hop; k++) {
      const energy = prefix[k + length]! - prefix[k]!;
      if (energy < floor) continue;
      ncc[k] = Math.min(1, Math.max(0, re[k]! / Math.sqrt(this.#templateEnergy * energy)));
    }
    return ncc;
  }
}
