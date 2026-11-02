import {
  type DecoderOptions,
  SonicDecoder,
  SonicError,
  SonicErrorCode,
  type SonicMessage,
  TypedEmitter,
  toMessage,
} from "../core";
import { abortError, linkSignal } from "./abort";
import { AudioContextManager } from "./audio-context";
import { type CaptureBackend, type CapturePreference, createCapture } from "./capture";
import { openMicrophone, stopStream } from "./microphone";
import { Store } from "./store";

interface ActiveFields {
  /** Input level, 0–1 (log-scaled RMS). */
  readonly level: number;
  /** Most recent message (continuous mode). */
  readonly lastMessage?: SonicMessage;
  /** Last non-fatal problem, e.g. a corrupted frame — the receiver keeps listening. */
  readonly issue?: SonicError;
}

export type ReceiverState =
  | { readonly status: "idle" }
  | { readonly status: "requesting-permission" }
  | ({ readonly status: "listening" } & ActiveFields)
  | ({
      readonly status: "receiving";
      readonly progress: number;
      readonly expectedBytes: number;
    } & ActiveFields)
  | { readonly status: "success"; readonly message: SonicMessage }
  | { readonly status: "error"; readonly error: SonicError };

export type ReceiverStatus = ReceiverState["status"];

export interface ReceiverEvents {
  message: SonicMessage;
  error: SonicError;
  /** A frame whose header was valid but whose body failed verification. */
  corrupted: SonicError;
}

export interface ReceiverOptions extends DecoderOptions {
  readonly audio?: AudioContextManager;
  /** Capture mechanism. Default `"auto"` (AudioWorklet, falling back to ScriptProcessor). */
  readonly capture?: CapturePreference;
  readonly deviceId?: string;
}

export interface ListenOptions {
  /** Give up after this many ms without a message (0 = never). Default 60 000. */
  readonly timeout?: number;
  /** Keep listening after a message instead of stopping. Default `false`. */
  readonly continuous?: boolean;
  /** Use this stream instead of opening the microphone (testing, custom devices). */
  readonly stream?: MediaStream;
  readonly signal?: AbortSignal;
}

interface Session {
  readonly controller: AbortController;
  readonly stream: MediaStream;
  readonly ownsStream: boolean;
  readonly capture: CaptureBackend;
  readonly decoder: SonicDecoder;
  readonly source: MediaStreamAudioSourceNode;
  timer?: ReturnType<typeof setTimeout>;
}

const IDLE: ReceiverState = { status: "idle" };
const LEVEL_INTERVAL_MS = 80;
const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * Facade over microphone permission, the capture graph and the streaming decoder.
 * `await receiver.listen()` resolves with the first verified message.
 */
export class SonicReceiver extends TypedEmitter<ReceiverEvents> implements Disposable {
  readonly #store = new Store<ReceiverState>(IDLE);
  readonly #audio: AudioContextManager;
  readonly #options: ReceiverOptions;
  #session: Session | null = null;
  #pending: { resolve: (m: SonicMessage) => void; reject: (e: SonicError) => void } | null = null;

  readonly subscribe: (listener: () => void) => () => void = this.#store.subscribe;
  readonly getSnapshot: () => ReceiverState = this.#store.getSnapshot;

  constructor(options: ReceiverOptions = {}) {
    super();
    this.#options = options;
    this.#audio = options.audio ?? new AudioContextManager();
  }

  get state(): ReceiverState {
    return this.#store.getSnapshot();
  }

  get active(): boolean {
    return this.#session !== null || this.state.status === "requesting-permission";
  }

  /** Resolves with the first message (or rejects on timeout, error or `stop()`). */
  listen(options?: ListenOptions & { readonly continuous?: false }): Promise<SonicMessage>;
  /** Continuous mode: resolves once the microphone is live; messages arrive via `on("message")`. */
  listen(options: ListenOptions & { readonly continuous: true }): Promise<undefined>;
  async listen(options: ListenOptions = {}): Promise<SonicMessage | undefined> {
    if (this.active)
      throw new SonicError(SonicErrorCode.Busy, "The receiver is already listening.");
    const controller = new AbortController();
    const unlink = linkSignal(controller, options.signal);
    controller.signal.addEventListener("abort", () => this.#fail(abortError()), { once: true });

    const resumed = this.#audio.resume("play-and-record"); // inside the gesture
    this.#store.set({ status: "requesting-permission" });
    let stream: MediaStream | undefined;
    try {
      stream =
        options.stream ??
        (await openMicrophone(this.#options.deviceId ? { deviceId: this.#options.deviceId } : {}));
      const context = await resumed;
      if (controller.signal.aborted) throw abortError();
      await this.#start(context, stream, options, controller);
    } catch (error) {
      if (!options.stream) stopStream(stream);
      unlink();
      const sonic = SonicError.from(error, SonicErrorCode.AudioUnsupported);
      if (!SonicError.is(sonic, SonicErrorCode.Aborted)) this.#fail(sonic);
      throw sonic;
    }
    controller.signal.addEventListener("abort", unlink, { once: true });

    if (options.continuous) return undefined;
    return new Promise<SonicMessage>((resolve, reject) => {
      this.#pending = { resolve, reject };
    });
  }

  /** Stops listening and releases the microphone. A pending `listen()` rejects with `operation/aborted`. */
  stop(): void {
    const pending = this.#pending;
    this.#pending = null;
    this.#teardown();
    if (this.state.status !== "success" && this.state.status !== "error") this.#store.set(IDLE);
    pending?.reject(abortError());
  }

  reset(): void {
    if (!this.active) this.#store.set(IDLE);
  }

  async release(): Promise<void> {
    this.stop();
    if (!this.#options.audio) await this.#audio.close();
  }

  [Symbol.dispose](): void {
    void this.release();
  }

  async #start(
    context: AudioContext,
    stream: MediaStream,
    options: ListenOptions,
    controller: AbortController,
  ): Promise<void> {
    const decoder = new SonicDecoder(context.sampleRate, this.#options);
    const source = context.createMediaStreamSource(stream);
    let level = 0;
    let lastLevelAt = 0;

    const capture = await createCapture(
      {
        context,
        source,
        sink: (samples) => {
          level = Math.max(level * 0.7, rmsLevel(samples));
          decoder.push(samples);
          const now = performance.now();
          if (now - lastLevelAt >= LEVEL_INTERVAL_MS) {
            lastLevelAt = now;
            this.#store.set((s) =>
              s.status === "listening" || s.status === "receiving" ? { ...s, level } : s,
            );
          }
        },
      },
      this.#options.capture,
    );

    const session: Session = {
      controller,
      stream,
      ownsStream: !options.stream,
      capture,
      decoder,
      source,
    };
    this.#session = session;
    this.#store.set({ status: "listening", level: 0 });

    decoder.on("header", (header) => {
      this.#store.set((s) =>
        s.status === "listening" || s.status === "receiving"
          ? { ...s, status: "receiving", progress: 0, expectedBytes: header.payloadLength }
          : s,
      );
    });
    decoder.on("progress", ({ ratio }) => {
      this.#store.set((s) => (s.status === "receiving" ? { ...s, progress: ratio } : s));
    });
    decoder.on("reject", (reject) => {
      if (reject.stage !== "body") return; // header rejects are almost always false preambles
      const issue = new SonicError(
        SonicErrorCode.Corrupted,
        `Received a corrupted frame (${reject.reason}).`,
      );
      this.emit("corrupted", issue);
      this.#store.set((s) =>
        s.status === "receiving" || s.status === "listening"
          ? { status: "listening", level: s.level, issue }
          : s,
      );
    });
    decoder.on("packet", (packet) => {
      let message: SonicMessage;
      try {
        message = toMessage(packet);
      } catch (error) {
        this.emit("corrupted", SonicError.from(error, SonicErrorCode.Corrupted));
        return;
      }
      this.emit("message", message);
      if (options.continuous) {
        this.#store.set({ status: "listening", level, lastMessage: message });
        this.#armTimeout(session, options.timeout);
        return;
      }
      const pending = this.#pending;
      this.#pending = null;
      this.#teardown();
      this.#store.set({ status: "success", message });
      pending?.resolve(message);
    });

    this.#armTimeout(session, options.timeout);
  }

  #armTimeout(session: Session, timeout = DEFAULT_TIMEOUT_MS): void {
    clearTimeout(session.timer);
    if (timeout <= 0) return;
    session.timer = setTimeout(() => {
      if (this.#session !== session) return;
      // Never cut off a frame that is being received right now.
      if (session.decoder.state !== "searching") return this.#armTimeout(session, 1000);
      this.#fail(new SonicError(SonicErrorCode.Timeout, "No message was received in time."));
    }, timeout);
  }

  #fail(error: SonicError): void {
    const pending = this.#pending;
    this.#pending = null;
    this.#teardown();
    if (SonicError.is(error, SonicErrorCode.Aborted)) {
      this.#store.set(IDLE);
    } else {
      this.#store.set({ status: "error", error });
      this.emit("error", error);
    }
    pending?.reject(error);
  }

  #teardown(): void {
    const session = this.#session;
    if (!session) return;
    this.#session = null;
    clearTimeout(session.timer);
    session.capture.stop();
    session.source.disconnect();
    session.decoder.removeAllListeners();
    if (session.ownsStream) stopStream(session.stream);
  }
}

/** RMS mapped from −60…0 dBFS onto 0…1. */
function rmsLevel(samples: Float32Array): number {
  let sum = 0;
  for (const v of samples) sum += v * v;
  const db = 10 * Math.log10(sum / Math.max(1, samples.length) + 1e-12);
  return Math.min(1, Math.max(0, (db + 60) / 60));
}
