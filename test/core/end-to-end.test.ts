import { describe, expect, it } from "vitest";
import { SonicDecoder } from "../../src/core/decoder/decoder";
import { type SonicMessage, toMessage } from "../../src/core/decoder/message";
import { SonicEncoder } from "../../src/core/encoder";
import { SonicError } from "../../src/core/errors";
import type { PayloadInput } from "../../src/core/payload/content";
import type { ProtocolOptions } from "../../src/core/protocol/protocol";
import { type ChannelOptions, chunked, simulateChannel } from "../../src/testing";

function transmit(
  payload: PayloadInput,
  channel: Omit<ChannelOptions, "fromRate">,
  options: ProtocolOptions = {},
  txRate = 48_000,
): SonicMessage[] {
  const encoded = new SonicEncoder(txRate, options).encode(payload);
  const rxRate = channel.toRate ?? txRate;
  const received = simulateChannel(encoded.samples, { fromRate: txRate, ...channel });
  const decoder = new SonicDecoder(rxRate, options);
  const messages: SonicMessage[] = [];
  decoder.on("packet", (p) => messages.push(toMessage(p)));
  for (const chunk of chunked(received, [128, 441, 1024, 77])) decoder.push(chunk);
  decoder.flush();
  return messages;
}

describe("end-to-end over a simulated acoustic channel", () => {
  it("delivers an OTP over a clean channel", () => {
    const [message] = transmit("482193", { snrDb: 40 });
    expect(message?.type).toBe("digits");
    expect(message?.value).toBe("482193");
  });

  it("survives noise, echoes, attenuation and a 44.1 kHz receiver", () => {
    const messages = transmit("hello sonic bridge", {
      snrDb: 6,
      gain: 0.05,
      toRate: 44_100,
      clockDrift: 80e-6,
      delay: 0.73,
      echoes: [
        { delay: 0.004, gain: 0.5 },
        { delay: 0.011, gain: 0.3 },
        { delay: 0.023, gain: 0.15 },
      ],
      seed: 7,
    });
    expect(messages.map((m) => m.value)).toEqual(["hello sonic bridge"]);
  });

  it.each([
    ["audible", "fast"],
    ["audible", "robust"],
    ["ultrasonic", "normal"],
  ] as const)("works with band=%s speed=%s", (band, speed) => {
    const messages = transmit(
      { type: "json", value: { session: "a1b2c3" } },
      { snrDb: 10, seed: 3 },
      { band, speed },
    );
    expect(messages[0]?.value).toEqual({ session: "a1b2c3" });
  });

  it("decodes back-to-back frames", () => {
    const encoder = new SonicEncoder(48_000);
    const a = encoder.encode("first");
    const b = encoder.encode("second");
    const joined = new Float32Array(a.samples.length + b.samples.length);
    joined.set(a.samples);
    joined.set(b.samples, a.samples.length);
    const packets = SonicDecoder.decodeAll(
      simulateChannel(joined, { fromRate: 48_000, snrDb: 20 }),
      48_000,
    );
    expect(packets.map((p) => toMessage(p).value)).toEqual(["first", "second"]);
  });

  it("does not emit packets from pure noise", () => {
    const noise = simulateChannel(new Float32Array(48_000 * 5).fill(0.001), {
      fromRate: 48_000,
      snrDb: 0,
    });
    expect(SonicDecoder.decodeAll(noise, 48_000)).toEqual([]);
  });

  it("reports progress and header before the packet", () => {
    const encoded = new SonicEncoder(48_000).encode("progress!");
    const decoder = new SonicDecoder(48_000);
    const events: string[] = [];
    decoder.on("sync", () => events.push("sync"));
    decoder.on("header", (h) => events.push(`header:${h.payloadLength}`));
    decoder.on("progress", () => events.at(-1) !== "progress" && events.push("progress"));
    decoder.on("packet", () => events.push("packet"));
    for (const chunk of chunked(
      simulateChannel(encoded.samples, { fromRate: 48_000, snrDb: 30 }),
      [256],
    )) {
      decoder.push(chunk);
    }
    decoder.flush();
    expect(events).toEqual(["sync", "header:9", "progress", "packet"]);
  });

  it("enforces payload limits with typed errors", () => {
    const encoder = new SonicEncoder(48_000, { maxPayloadBytes: 8 });
    expect(() => encoder.encode("this is too long")).toThrowError(
      expect.objectContaining({ code: "payload/too-large" }) as unknown as Error,
    );
    expect(() => encoder.encode("")).toThrow(SonicError);
  });

  it("estimates airtime accurately", () => {
    const encoder = new SonicEncoder(48_000);
    const signal = encoder.encode("482193");
    expect(encoder.estimateDuration(signal.payloadBytes)).toBeCloseTo(signal.duration, 2);
    expect(signal.duration).toBeLessThan(3);
  });

  it("rejects bands above Nyquist", () => {
    expect(() => new SonicEncoder(22_050, { band: "ultrasonic" })).toThrowError(/too high/);
  });
});
