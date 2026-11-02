/**
 * Arithmetic in GF(2^8) with the primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D).
 * Polynomials are arrays of coefficients, highest degree first.
 */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]!;
}

export type Poly = number[];

export const gf = {
  mul(a: number, b: number): number {
    return a === 0 || b === 0 ? 0 : EXP[LOG[a]! + LOG[b]!]!;
  },
  div(a: number, b: number): number {
    if (b === 0) throw new RangeError("GF(256) division by zero");
    return a === 0 ? 0 : EXP[(LOG[a]! + 255 - LOG[b]!) % 255]!;
  },
  pow(a: number, power: number): number {
    return EXP[(((LOG[a]! * power) % 255) + 255) % 255]!;
  },
  inverse(a: number): number {
    return EXP[255 - LOG[a]!]!;
  },
  polyScale(p: readonly number[], x: number): Poly {
    return p.map((c) => gf.mul(c, x));
  },
  polyAdd(p: readonly number[], q: readonly number[]): Poly {
    const r: Poly = new Array(Math.max(p.length, q.length)).fill(0);
    for (let i = 0; i < p.length; i++) r[i + r.length - p.length] = p[i]!;
    for (let i = 0; i < q.length; i++) r[i + r.length - q.length]! ^= q[i]!;
    return r;
  },
  polyMul(p: readonly number[], q: readonly number[]): Poly {
    const r: Poly = new Array(p.length + q.length - 1).fill(0);
    for (let j = 0; j < q.length; j++) {
      for (let i = 0; i < p.length; i++) r[i + j]! ^= gf.mul(p[i]!, q[j]!);
    }
    return r;
  },
  polyEval(p: readonly number[], x: number): number {
    let y = p[0] ?? 0;
    for (let i = 1; i < p.length; i++) y = gf.mul(y, x) ^ p[i]!;
    return y;
  },
} as const;
