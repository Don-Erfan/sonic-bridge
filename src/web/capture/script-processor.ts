import type { CaptureBackend, CaptureRequest } from "./backend";

/** Fallback for browsers without AudioWorklet (deprecated API, but universally available). */
export class ScriptProcessorCapture implements CaptureBackend {
  readonly kind = "script-processor";
  readonly #node: ScriptProcessorNode;
  readonly #source: AudioNode;
  readonly #mute: GainNode;

  constructor(request: CaptureRequest) {
    const { context, source, sink } = request;
    this.#source = source;
    this.#node = context.createScriptProcessor(2048, 1, 1);
    this.#mute = context.createGain();
    this.#mute.gain.value = 0;
    this.#node.onaudioprocess = (event) =>
      sink(new Float32Array(event.inputBuffer.getChannelData(0)));
    source.connect(this.#node);
    this.#node.connect(this.#mute).connect(context.destination);
  }

  stop(): void {
    this.#node.onaudioprocess = null;
    this.#source.disconnect(this.#node);
    this.#node.disconnect();
    this.#mute.disconnect();
  }
}
