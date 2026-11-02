import type { BitsPerSymbol } from "../protocol/profiles";

/** Splits bytes into symbols of `bits` bits each, most significant first. */
export function bytesToSymbols(bytes: Uint8Array, bits: BitsPerSymbol): number[] {
  const perByte = 8 / bits;
  const mask = (1 << bits) - 1;
  const out: number[] = [];
  for (const byte of bytes) {
    for (let i = perByte - 1; i >= 0; i--) out.push((byte >> (i * bits)) & mask);
  }
  return out;
}

/** Inverse of {@link bytesToSymbols}. */
export function symbolsToBytes(symbols: readonly number[], bits: BitsPerSymbol): Uint8Array {
  const perByte = 8 / bits;
  const out = new Uint8Array(Math.floor(symbols.length / perByte));
  for (let b = 0; b < out.length; b++) {
    let byte = 0;
    for (let i = 0; i < perByte; i++) byte = (byte << bits) | symbols[b * perByte + i]!;
    out[b] = byte;
  }
  return out;
}
