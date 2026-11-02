import type { CaptureBackend, CaptureRequest } from "./backend";

const PROCESSOR_NAME = "sonic-bridge-capture";

/** Inlined so the package works with every bundler; loaded through a Blob URL. */
const PROCESSOR_SOURCE = `
class SonicBridgeCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.size = 2048;
    this.buffer = new Float32Array(this.size);
    this.filled = 0;
    this.active = true;
    this.port.onmessage = (event) => { if (event.data === "stop") this.active = false; };
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      for (let i = 0; i < channel.length; i++) {
        this.buffer[this.filled++] = channel[i];
        if (this.filled === this.size) {
          this.port.postMessage(this.buffer, [this.buffer.buffer]);
          this.buffer = new Float32Array(this.size);
          this.filled = 0;
        }
      }
    }
    return this.active;
  }
}
registerProcessor("${PROCESSOR_NAME}", SonicBridgeCapture);
`;

const loaded = new WeakMap<BaseAudioContext, Promise<void>>();

function loadModule(context: BaseAudioContext): Promise<void> {
  let promise = loaded.get(context);
  if (!promise) {
    const url = URL.createObjectURL(
      new Blob([PROCESSOR_SOURCE], { type: "application/javascript" }),
    );
    promise = context.audioWorklet.addModule(url).finally(() => URL.revokeObjectURL(url));
    loaded.set(context, promise);
    promise.catch(() => loaded.delete(context));
  }
  return promise;
}

export class WorkletCapture implements CaptureBackend {
  readonly kind = "worklet";
  readonly #node: AudioWorkletNode;
  readonly #mute: GainNode;
  readonly #source: AudioNode;

  private constructor(request: CaptureRequest, node: AudioWorkletNode) {
    this.#node = node;
    this.#source = request.source;
    // Route through a muted gain to the destination so the graph keeps pulling the node.
    this.#mute = request.context.createGain();
    this.#mute.gain.value = 0;
    node.port.onmessage = (event: MessageEvent<Float32Array>) => request.sink(event.data);
    request.source.connect(node);
    node.connect(this.#mute).connect(request.context.destination);
  }

  static async create(request: CaptureRequest): Promise<WorkletCapture> {
    await loadModule(request.context);
    const node = new AudioWorkletNode(request.context, PROCESSOR_NAME, {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 1,
      channelCountMode: "explicit",
    });
    return new WorkletCapture(request, node);
  }

  stop(): void {
    this.#node.port.postMessage("stop");
    this.#node.port.onmessage = null;
    this.#source.disconnect(this.#node);
    this.#node.disconnect();
    this.#mute.disconnect();
  }
}
