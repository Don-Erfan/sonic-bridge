import { describe, expect, it } from "vitest";
import { FFT } from "../../src/core/dsp/fft";
import { goertzelPower } from "../../src/core/dsp/goertzel";
import { SampleBuffer } from "../../src/core/dsp/sample-buffer";

describe("FFT", () => {
  it("matches a naive DFT and inverts", () => {
    const n = 64;
    const fft = new FFT(n);
    const input = Float64Array.from(
      { length: n },
      (_, i) => Math.sin(i * 0.3) + 0.5 * Math.cos(i * 1.7),
    );
    const re = input.slice();
    const im = new Float64Array(n);
    fft.forward(re, im);
    for (const k of [0, 3, 17, 40]) {
      let dr = 0;
      let di = 0;
      for (let t = 0; t < n; t++) {
        dr += input[t]! * Math.cos((-2 * Math.PI * k * t) / n);
        di += input[t]! * Math.sin((-2 * Math.PI * k * t) / n);
      }
      expect(re[k]).toBeCloseTo(dr, 8);
      expect(im[k]).toBeCloseTo(di, 8);
    }
    fft.inverse(re, im);
    for (const [i, v] of input.entries()) expect(re[i]).toBeCloseTo(v, 10);
  });
});

describe("goertzel", () => {
  it("picks the strongest of neighboring tones", () => {
    const rate = 48_000;
    const samples = Float32Array.from({ length: 2048 }, (_, i) =>
      Math.sin((2 * Math.PI * 2000 * i) / rate),
    );
    const on = goertzelPower(samples, 0, 2048, 2000, rate);
    const off = goertzelPower(samples, 0, 2048, 2120, rate);
    expect(on / off).toBeGreaterThan(100);
  });
});

describe("SampleBuffer", () => {
  it("addresses samples absolutely across discards", () => {
    const buffer = new SampleBuffer();
    buffer.append(Float32Array.of(0, 1, 2, 3));
    buffer.append(Float32Array.of(4, 5));
    buffer.discardBefore(3);
    expect(buffer.start).toBe(3);
    expect(Array.from(buffer.view(3, 6))).toEqual([3, 4, 5]);
    expect(buffer.has(2, 4)).toBe(false);
  });
});
