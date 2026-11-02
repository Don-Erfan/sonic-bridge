/**
 * Append-only sample store addressed by *absolute* sample index (samples since the stream began).
 * Old samples can be discarded; storage is compacted lazily.
 */
export class SampleBuffer {
  #data = new Float32Array(1 << 16);
  #offset = 0; // absolute index of #data[0]
  #length = 0;

  /** Absolute index of the first retained sample. */
  get start(): number {
    return this.#offset;
  }

  /** Absolute index one past the last sample. */
  get end(): number {
    return this.#offset + this.#length;
  }

  append(chunk: Float32Array): void {
    if (this.#length + chunk.length > this.#data.length) {
      const next = new Float32Array(Math.max(this.#data.length * 2, this.#length + chunk.length));
      next.set(this.#data.subarray(0, this.#length));
      this.#data = next;
    }
    this.#data.set(chunk, this.#length);
    this.#length += chunk.length;
  }

  /** A zero-copy view of `[from, to)`; the range must be retained. */
  view(from: number, to: number): Float32Array {
    if (from < this.start || to > this.end || from > to) {
      throw new RangeError(`Range [${from}, ${to}) outside buffer [${this.start}, ${this.end})`);
    }
    return this.#data.subarray(from - this.#offset, to - this.#offset);
  }

  has(from: number, to: number): boolean {
    return from >= this.start && to <= this.end;
  }

  discardBefore(absolute: number): void {
    const drop = Math.min(Math.max(0, absolute - this.#offset), this.#length);
    if (drop === 0) return;
    this.#data.copyWithin(0, drop, this.#length);
    this.#offset += drop;
    this.#length -= drop;
  }

  clear(): void {
    this.#offset = this.end;
    this.#length = 0;
  }
}
