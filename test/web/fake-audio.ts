/** Just enough of the Web Audio API to drive the transmitter and receiver in Node/jsdom. */
class FakeNode {
  connect<T>(node: T): T {
    return node;
  }
  disconnect(): void {}
}

export class FakeScriptProcessor extends FakeNode {
  onaudioprocess: ((event: { inputBuffer: { getChannelData(): Float32Array } }) => void) | null =
    null;

  feed(samples: Float32Array, chunk = 2048): void {
    for (let i = 0; i < samples.length; i += chunk) {
      const slice = samples.slice(i, i + chunk);
      this.onaudioprocess?.({ inputBuffer: { getChannelData: () => slice } });
    }
  }
}

export class FakeAudioContext {
  readonly sampleRate: number;
  state: "suspended" | "running" | "closed" = "suspended";
  currentTime = 0;
  readonly destination = new FakeNode();
  readonly processors: FakeScriptProcessor[] = [];
  readonly played: Float32Array[] = [];

  constructor(sampleRate = 48_000) {
    this.sampleRate = sampleRate;
  }

  async resume(): Promise<void> {
    this.state = "running";
  }

  async close(): Promise<void> {
    this.state = "closed";
  }

  createBuffer(_channels: number, length: number, rate: number) {
    const data = new Float32Array(length);
    return { duration: length / rate, getChannelData: () => data };
  }

  createBufferSource() {
    const played = this.played;
    const source = {
      buffer: null as null | { duration: number; getChannelData(): Float32Array },
      onended: null as null | (() => void),
      connect: <T>(node: T) => node,
      disconnect() {},
      start() {
        played.push(source.buffer!.getChannelData());
        setTimeout(() => source.onended?.(), source.buffer!.duration * 1000);
      },
      stop() {},
    };
    return source;
  }

  createGain() {
    return { gain: { value: 1 }, connect: <T>(node: T) => node, disconnect() {} };
  }

  createMediaStreamSource() {
    return new FakeNode();
  }

  createScriptProcessor(): FakeScriptProcessor {
    const processor = new FakeScriptProcessor();
    this.processors.push(processor);
    return processor;
  }
}

export const fakeStream = (): MediaStream => ({ getTracks: () => [] }) as unknown as MediaStream;
export const asContext = (fake: FakeAudioContext): AudioContext => fake as unknown as AudioContext;
