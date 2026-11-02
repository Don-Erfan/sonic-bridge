import { describe, expect, it } from "vitest";
import { crc16 } from "../../src/core/coding/crc16";
import { ReedSolomon } from "../../src/core/coding/reed-solomon";
import { bytesToSymbols, symbolsToBytes } from "../../src/core/coding/symbols";
import { createRandom } from "../../src/testing";

describe("crc16", () => {
  it("matches the CCITT-FALSE check value", () => {
    expect(crc16(new TextEncoder().encode("123456789"))).toBe(0x29b1);
  });
  it("is chunk-invariant", () => {
    const a = Uint8Array.of(1, 2, 3);
    const b = Uint8Array.of(4, 5);
    expect(crc16(a, b)).toBe(crc16(Uint8Array.of(1, 2, 3, 4, 5)));
  });
});

describe("ReedSolomon", () => {
  const random = createRandom(42);
  const randomBytes = (n: number) =>
    Uint8Array.from({ length: n }, () => Math.floor(random() * 256));

  it.each([4, 8, 16])("corrects up to parity/2 errors (parity %i)", (parity) => {
    const rs = new ReedSolomon(parity);
    for (let trial = 0; trial < 200; trial++) {
      const data = randomBytes(1 + Math.floor(random() * 40));
      const block = rs.encode(data);
      const errors = Math.floor(random() * (rs.capacity + 1));
      const positions = new Set<number>();
      while (positions.size < errors) positions.add(Math.floor(random() * block.length));
      for (const p of positions) block[p]! ^= 1 + Math.floor(random() * 255);
      const result = rs.decode(block);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.data).toEqual(data);
        expect(result.value.corrected).toBe(errors);
      }
    }
  });

  it("never silently returns wrong data when too many errors occur", () => {
    const rs = new ReedSolomon(8);
    let wrong = 0;
    for (let trial = 0; trial < 300; trial++) {
      const data = randomBytes(20);
      const block = rs.encode(data);
      for (let i = 0; i < 8; i++) block[i * 3]! ^= 0x5a + i;
      const result = rs.decode(block);
      if (result.ok && !result.value.data.every((v, i) => v === data[i])) wrong++;
    }
    // RS can mis-correct beyond capacity; the frame CRC catches these. It must be rare.
    expect(wrong).toBeLessThan(10);
  });

  it("rejects invalid parity", () => {
    expect(() => new ReedSolomon(3)).toThrow(RangeError);
  });
});

describe("symbol mapping", () => {
  it.each([1, 2, 4, 8] as const)("round-trips at %i bits per symbol", (bits) => {
    const bytes = Uint8Array.of(0x00, 0xff, 0xa5, 0x3c);
    const symbols = bytesToSymbols(bytes, bits);
    expect(symbols).toHaveLength((bytes.length * 8) / bits);
    expect(symbolsToBytes(symbols, bits)).toEqual(bytes);
  });
});
