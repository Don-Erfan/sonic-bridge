export type SampleSink = (samples: Float32Array) => void;
export type CaptureKind = "worklet" | "script-processor";
export type CapturePreference = CaptureKind | "auto";

/**
 * Adapter interface: turns an `AudioNode` into a stream of `Float32Array` chunks on the main
 * thread, hiding which Web Audio mechanism delivers them.
 */
export interface CaptureBackend {
  readonly kind: CaptureKind;
  stop(): void;
}

export interface CaptureRequest {
  readonly context: AudioContext;
  readonly source: AudioNode;
  readonly sink: SampleSink;
}
