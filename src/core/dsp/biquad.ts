export type BiquadKind = "lowpass" | "highpass";

/** Second-order IIR section (RBJ cookbook), Direct Form I. Stateful across `process` calls. */
export class Biquad {
  readonly #b0: number;
  readonly #b1: number;
  readonly #b2: number;
  readonly #a1: number;
  readonly #a2: number;
  #x1 = 0;
  #x2 = 0;
  #y1 = 0;
  #y2 = 0;

  constructor(kind: BiquadKind, cutoff: number, sampleRate: number, q: number = Math.SQRT1_2) {
    const w0 = (2 * Math.PI * Math.min(cutoff, sampleRate * 0.49)) / sampleRate;
    const cos = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * q);
    const a0 = 1 + alpha;
    const [b0, b1, b2] =
      kind === "lowpass"
        ? [(1 - cos) / 2, 1 - cos, (1 - cos) / 2]
        : [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
    this.#b0 = b0 / a0;
    this.#b1 = b1 / a0;
    this.#b2 = b2 / a0;
    this.#a1 = (-2 * cos) / a0;
    this.#a2 = (1 - alpha) / a0;
  }

  process(
    input: Float32Array,
    output: Float32Array = new Float32Array(input.length),
  ): Float32Array {
    let { x1, x2, y1, y2 } = { x1: this.#x1, x2: this.#x2, y1: this.#y1, y2: this.#y2 };
    for (let i = 0; i < input.length; i++) {
      const x = input[i]!;
      const y = this.#b0 * x + this.#b1 * x1 + this.#b2 * x2 - this.#a1 * y1 - this.#a2 * y2;
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y;
      output[i] = y;
    }
    this.#x1 = x1;
    this.#x2 = x2;
    this.#y1 = y1;
    this.#y2 = y2;
    return output;
  }

  reset(): void {
    this.#x1 = this.#x2 = this.#y1 = this.#y2 = 0;
  }
}

/** Fourth-order band-pass built from cascaded high-pass and low-pass sections. */
export class BandPassFilter {
  readonly #stages: readonly Biquad[];

  constructor(low: number, high: number, sampleRate: number) {
    this.#stages = [
      new Biquad("highpass", low, sampleRate),
      new Biquad("highpass", low, sampleRate),
      new Biquad("lowpass", high, sampleRate),
      new Biquad("lowpass", high, sampleRate),
    ];
  }

  process(input: Float32Array): Float32Array {
    const out = new Float32Array(input.length);
    let src = input;
    for (const stage of this.#stages) {
      stage.process(src, out);
      src = out;
    }
    return out;
  }

  reset(): void {
    for (const stage of this.#stages) stage.reset();
  }
}
