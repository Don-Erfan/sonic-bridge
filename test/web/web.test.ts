import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AudioContextManager,
  SonicError,
  SonicReceiver,
  SonicTransmitter,
  Store,
  toMicrophoneError,
} from "../../src";
import { SonicEncoder } from "../../src/core";
import { simulateChannel } from "../../src/testing";
import { asContext, FakeAudioContext, fakeStream } from "./fake-audio";

afterEach(() => vi.useRealTimers());

describe("Store", () => {
  it("notifies subscribers only on change", () => {
    const store = new Store(1);
    const listener = vi.fn();
    const off = store.subscribe(listener);
    store.set(1);
    store.set((n) => n + 1);
    off();
    store.set(5);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toBe(5);
  });
});

describe("toMicrophoneError", () => {
  it.each([
    ["NotAllowedError", "audio/permission-denied"],
    ["NotFoundError", "audio/device-not-found"],
    ["NotReadableError", "audio/device-busy"],
    ["Weird", "audio/unsupported"],
  ])("maps %s to %s", (name, code) => {
    const error = Object.assign(new Error("x"), { name });
    expect(toMicrophoneError(error).code).toBe(code);
  });
});

describe("SonicTransmitter", () => {
  it("goes preparing → transmitting → done and plays the encoded signal", async () => {
    vi.useFakeTimers();
    const fake = new FakeAudioContext();
    const tx = new SonicTransmitter({ audio: new AudioContextManager(asContext(fake)) });
    const statuses: string[] = [];
    tx.subscribe(() => statuses.push(tx.state.status));

    const promise = tx.transmit("482193");
    await vi.runAllTimersAsync();
    const signal = await promise;

    expect(statuses[0]).toBe("preparing");
    expect(statuses).toContain("transmitting");
    expect(tx.state.status).toBe("done");
    expect(fake.played[0]).toHaveLength(signal.samples.length);
    expect(fake.state).toBe("running");
  });

  it("rejects concurrent transmissions and supports cancel", async () => {
    vi.useFakeTimers();
    const tx = new SonicTransmitter({
      audio: new AudioContextManager(asContext(new FakeAudioContext())),
    });
    const first = tx.transmit("1");
    await expect(tx.transmit("2")).rejects.toMatchObject({ code: "operation/busy" });
    await vi.advanceTimersByTimeAsync(10);
    tx.cancel();
    await expect(first).rejects.toMatchObject({ code: "operation/aborted" });
    expect(tx.state.status).toBe("error");
  });

  it("surfaces payload errors in state", async () => {
    const tx = new SonicTransmitter({
      audio: new AudioContextManager(asContext(new FakeAudioContext())),
    });
    await expect(tx.transmit("x".repeat(100))).rejects.toBeInstanceOf(SonicError);
    expect(tx.state).toMatchObject({ status: "error", error: { code: "payload/too-large" } });
  });
});

describe("SonicReceiver", () => {
  const setup = (rate = 44_100) => {
    const fake = new FakeAudioContext(rate);
    const rx = new SonicReceiver({
      audio: new AudioContextManager(asContext(fake)),
      capture: "script-processor",
    });
    const signal = simulateChannel(new SonicEncoder(48_000).encode("482193").samples, {
      fromRate: 48_000,
      toRate: rate,
      snrDb: 15,
      gain: 0.1,
    });
    return { fake, rx, signal };
  };

  it("resolves listen() with the decoded message and walks the state machine", async () => {
    const { fake, rx, signal } = setup();
    const statuses = new Set<string>();
    rx.subscribe(() => statuses.add(rx.state.status));

    const pending = rx.listen({ stream: fakeStream() });
    await vi.waitFor(() => expect(fake.processors).toHaveLength(1));
    fake.processors[0]!.feed(signal);
    fake.processors[0]!.feed(new Float32Array(fake.sampleRate));

    const message = await pending;
    expect(message).toMatchObject({ type: "digits", value: "482193" });
    expect([...statuses]).toEqual(["requesting-permission", "listening", "receiving", "success"]);
    expect(rx.active).toBe(false);
  });

  it("continuous mode emits every message and keeps listening", async () => {
    const { fake, rx, signal } = setup(48_000);
    const received: string[] = [];
    rx.on("message", (m) => received.push(String(m.value)));
    await rx.listen({ stream: fakeStream(), continuous: true });
    const processor = fake.processors[0]!;
    processor.feed(signal);
    processor.feed(signal);
    processor.feed(new Float32Array(fake.sampleRate));
    expect(received).toEqual(["482193", "482193"]);
    expect(rx.state).toMatchObject({ status: "listening", lastMessage: { value: "482193" } });
    rx.stop();
    expect(rx.state.status).toBe("idle");
  });

  it("times out with a typed error", async () => {
    vi.useFakeTimers();
    const { rx } = setup();
    const pending = rx.listen({ stream: fakeStream(), timeout: 5000 });
    const assertion = expect(pending).rejects.toMatchObject({ code: "decode/timeout" });
    await vi.advanceTimersByTimeAsync(5001);
    await assertion;
    expect(rx.state.status).toBe("error");
  });

  it("stop() aborts a pending listen", async () => {
    const { rx } = setup();
    const pending = rx.listen({ stream: fakeStream() });
    await vi.waitFor(() => expect(rx.state.status).toBe("listening"));
    rx.stop();
    await expect(pending).rejects.toMatchObject({ code: "operation/aborted" });
    expect(rx.state.status).toBe("idle");
  });
});
