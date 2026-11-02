import { err, ok, type Result } from "../types/result";
import { gf, type Poly } from "./galois";

export interface RsDecoded {
  readonly data: Uint8Array;
  /** Number of byte errors that were corrected. */
  readonly corrected: number;
}

/**
 * Reed–Solomon codec over GF(256) (systematic, first consecutive root α^0).
 * `parity` check bytes correct up to ⌊parity / 2⌋ byte errors per block.
 */
export class ReedSolomon {
  static readonly #generators = new Map<number, Poly>();

  readonly parity: number;
  readonly #generator: Poly;

  constructor(parity: number) {
    if (!Number.isInteger(parity) || parity < 2 || parity > 64 || parity % 2 !== 0) {
      throw new RangeError(`Reed-Solomon parity must be an even integer in [2, 64], got ${parity}`);
    }
    this.parity = parity;
    this.#generator = ReedSolomon.#generatorFor(parity);
  }

  static #generatorFor(parity: number): Poly {
    const cached = ReedSolomon.#generators.get(parity);
    if (cached) return cached;
    let g: Poly = [1];
    for (let i = 0; i < parity; i++) g = gf.polyMul(g, [1, gf.pow(2, i)]);
    ReedSolomon.#generators.set(parity, g);
    return g;
  }

  /** Maximum number of correctable byte errors. */
  get capacity(): number {
    return this.parity / 2;
  }

  encode(data: Uint8Array): Uint8Array {
    if (data.length + this.parity > 255) {
      throw new RangeError(`Reed-Solomon block too long: ${data.length + this.parity} > 255`);
    }
    const out = new Uint8Array(data.length + this.parity);
    out.set(data);
    const g = this.#generator;
    for (let i = 0; i < data.length; i++) {
      const coef = out[i]!;
      if (coef === 0) continue;
      for (let j = 1; j < g.length; j++) out[i + j]! ^= gf.mul(g[j]!, coef);
    }
    out.set(data);
    return out;
  }

  decode(block: Uint8Array): Result<RsDecoded, string> {
    if (block.length > 255 || block.length <= this.parity) return err("invalid block length");
    const msg = Array.from(block);
    const synd = this.#syndromes(msg);
    if (synd.every((s) => s === 0)) {
      return ok({ data: block.slice(0, block.length - this.parity), corrected: 0 });
    }

    const locator = this.#errorLocator(synd);
    if (!locator) return err("too many errors");
    const positions = this.#findErrors(locator.toReversed(), msg.length);
    if (!positions) return err("could not locate errors");

    const fixed = this.#correctErrata(msg, synd, positions);
    if (this.#syndromes(fixed).some((s) => s !== 0)) return err("could not correct block");

    const data = Uint8Array.from(fixed.slice(0, fixed.length - this.parity));
    return ok({ data, corrected: positions.length });
  }

  /** Syndromes, padded with a leading 0 (keeps index arithmetic aligned with the literature). */
  #syndromes(msg: readonly number[]): Poly {
    const synd: Poly = [0];
    for (let i = 0; i < this.parity; i++) synd.push(gf.polyEval(msg, gf.pow(2, i)));
    return synd;
  }

  /** Berlekamp–Massey. Returns `null` when the error count exceeds the code's capacity. */
  #errorLocator(synd: readonly number[]): Poly | null {
    let errLoc: Poly = [1];
    let oldLoc: Poly = [1];
    const shift = synd.length - this.parity;
    for (let i = 0; i < this.parity; i++) {
      const k = i + shift;
      let delta = synd[k]!;
      for (let j = 1; j < errLoc.length; j++) {
        delta ^= gf.mul(errLoc[errLoc.length - 1 - j]!, synd[k - j] ?? 0);
      }
      oldLoc = [...oldLoc, 0];
      if (delta !== 0) {
        if (oldLoc.length > errLoc.length) {
          const newLoc = gf.polyScale(oldLoc, delta);
          oldLoc = gf.polyScale(errLoc, gf.inverse(delta));
          errLoc = newLoc;
        }
        errLoc = gf.polyAdd(errLoc, gf.polyScale(oldLoc, delta));
      }
    }
    while (errLoc.length > 0 && errLoc[0] === 0) errLoc.shift();
    const errors = errLoc.length - 1;
    return errors * 2 > this.parity ? null : errLoc;
  }

  /** Chien search: positions (from the start of the block) whose locator root is zero. */
  #findErrors(locator: readonly number[], length: number): number[] | null {
    const errors = locator.length - 1;
    const positions: number[] = [];
    for (let i = 0; i < length; i++) {
      if (gf.polyEval(locator, gf.pow(2, i)) === 0) positions.push(length - 1 - i);
    }
    return positions.length === errors ? positions : null;
  }

  /** Forney algorithm: computes error magnitudes and applies them. */
  #correctErrata(
    msg: readonly number[],
    synd: readonly number[],
    positions: readonly number[],
  ): Poly {
    const coefPos = positions.map((p) => msg.length - 1 - p);
    let errataLoc: Poly = [1];
    for (const p of coefPos) errataLoc = gf.polyMul(errataLoc, gf.polyAdd([1], [gf.pow(2, p), 0]));

    // Error evaluator Ω(x) = S(x)·Λ(x) mod x^(ν+1)
    const nu = errataLoc.length - 1;
    const product = gf.polyMul(synd.toReversed(), errataLoc);
    const evaluator = product.slice(product.length - (nu + 1)).toReversed();

    const X = coefPos.map((p) => gf.pow(2, -(255 - p)));
    const magnitudes: Poly = new Array(msg.length).fill(0);
    X.forEach((xi, i) => {
      const xiInv = gf.inverse(xi);
      let locPrime = 1;
      X.forEach((xj, j) => {
        if (j !== i) locPrime = gf.mul(locPrime, 1 ^ gf.mul(xiInv, xj));
      });
      const y = gf.mul(xi, gf.polyEval(evaluator.toReversed(), xiInv));
      magnitudes[positions[i]!] = gf.div(y, locPrime);
    });
    return gf.polyAdd(msg, magnitudes);
  }
}
