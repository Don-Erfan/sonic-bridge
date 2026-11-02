import {
  type ContentTypeName,
  type EncodedSignal,
  type EncoderOptions,
  type PayloadInput,
  SonicEncoder,
  SonicError,
  SonicErrorCode,
} from "../core";
import { abortError, linkSignal } from "./abort";
import { AudioContextManager } from "./audio-context";
import { Store } from "./store";

export type TransmitterState =
  | { readonly status: "idle" }
  | { readonly status: "preparing" }
  | {
      readonly status: "transmitting";
      readonly progress: number;
      readonly duration: number;
      readonly contentType: ContentTypeName;
    }
  | { readonly status: "done"; readonly duration: number }
  | { readonly status: "error"; readonly error: SonicError };

export type TransmitterStatus = TransmitterState["status"];

export interface TransmitterOptions extends EncoderOptions {
  /** Share an `AudioContextManager` (e.g. with a receiver). */
  readonly audio?: AudioContextManager;
  /**
   * Where the signal goes. Defaults to the speakers (`context.destination`). Pass e.g. a
   * `MediaStreamAudioDestinationNode` to route it into a virtual cable for testing.
   */
  readonly destination?: (context: AudioContext) => AudioNode;
}

export interface TransmitOptions {
  readonly signal?: AbortSignal;
}

const IDLE: TransmitterState = { status: "idle" };

/**
 * Facade: one call — `transmit("482193")` — encodes, resumes audio, plays and reports progress.
 * State is observable through `subscribe`/`getSnapshot` (React-friendly, framework-agnostic).
 */
export class SonicTransmitter implements Disposable {
  readonly #store = new Store<TransmitterState>(IDLE);
  readonly #audio: AudioContextManager;
  readonly #options: TransmitterOptions;
  #encoder: SonicEncoder | null = null;
  #controller: AbortController | null = null;

  readonly subscribe: (listener: () => void) => () => void = this.#store.subscribe;
  readonly getSnapshot: () => TransmitterState = this.#store.getSnapshot;

  constructor(options: TransmitterOptions = {}) {
    this.#options = options;
    this.#audio = options.audio ?? new AudioContextManager();
  }

  get state(): TransmitterState {
    return this.#store.getSnapshot();
  }

  get busy(): boolean {
    const { status } = this.state;
    return status === "preparing" || status === "transmitting";
  }

  /** Airtime in seconds for a payload, without playing it. */
  estimate(payload: PayloadInput): number {
    return this.#encoderFor(this.#audio.get().sampleRate).encode(payload).duration;
  }

  /** Encodes `payload` and plays it. Call from a user gesture (click/tap). */
  async transmit(payload: PayloadInput, options: TransmitOptions = {}): Promise<EncodedSignal> {
    if (this.busy)
      throw new SonicError(SonicErrorCode.Busy, "A transmission is already in progress.");
    const controller = new AbortController();
    this.#controller = controller;
    const unlink = linkSignal(controller, options.signal);
    this.#store.set({ status: "preparing" });

    let timer: ReturnType<typeof setInterval> | undefined;
    let source: AudioBufferSourceNode | undefined;
    try {
      // Synchronous until here so the AudioContext is created/resumed inside the gesture.
      const context = this.#audio.get();
      const resumed = this.#audio.resume("playback");
      const signal = this.#encoderFor(context.sampleRate).encode(payload);
      await resumed;
      if (controller.signal.aborted) throw abortError();

      const buffer = context.createBuffer(1, signal.samples.length, context.sampleRate);
      buffer.getChannelData(0).set(signal.samples);
      source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.#options.destination?.(context) ?? context.destination);

      const startAt = context.currentTime + 0.05;
      const ended = new Promise<void>((resolve, reject) => {
        source!.onended = () => resolve();
        controller.signal.addEventListener("abort", () => reject(abortError()), { once: true });
      });
      source.start(startAt);

      const report = (): void => {
        const progress = Math.min(
          1,
          Math.max(0, (context.currentTime - startAt) / signal.duration),
        );
        this.#store.set({
          status: "transmitting",
          progress,
          duration: signal.duration,
          contentType: signal.contentType,
        });
      };
      report();
      timer = setInterval(report, 100);

      await ended;
      this.#store.set({ status: "done", duration: signal.duration });
      return signal;
    } catch (error) {
      const sonic = SonicError.from(error, SonicErrorCode.PlaybackFailed);
      this.#store.set({ status: "error", error: sonic });
      throw sonic;
    } finally {
      clearInterval(timer);
      if (source) {
        source.onended = null;
        try {
          source.stop();
        } catch {
          // already stopped
        }
        source.disconnect();
      }
      unlink();
      if (this.#controller === controller) this.#controller = null;
    }
  }

  /** Stops the current transmission (its promise rejects with `operation/aborted`). */
  cancel(): void {
    this.#controller?.abort();
  }

  /** Back to `idle` (clears `done`/`error`). */
  reset(): void {
    if (!this.busy) this.#store.set(IDLE);
  }

  /** Releases audio resources. The instance stays usable; resources are re-acquired lazily. */
  async release(): Promise<void> {
    this.cancel();
    if (!this.#options.audio) await this.#audio.close();
  }

  [Symbol.dispose](): void {
    void this.release();
  }

  #encoderFor(sampleRate: number): SonicEncoder {
    if (!this.#encoder || this.#encoder.protocol.sampleRate !== sampleRate) {
      this.#encoder = new SonicEncoder(sampleRate, this.#options);
    }
    return this.#encoder;
  }
}
