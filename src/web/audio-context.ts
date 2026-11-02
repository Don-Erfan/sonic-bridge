import { SonicError, SonicErrorCode } from "../core";
import { getAudioContextClass } from "./support";

export type AudioSessionType = "playback" | "play-and-record" | "auto";

interface NavigatorWithAudioSession {
  audioSession?: { type: string };
}

/**
 * Owns one lazily created `AudioContext`. Create it (and call `resume`) from inside a user
 * gesture — browsers block audio otherwise. Share one manager between a transmitter and a
 * receiver to use a single context.
 */
export class AudioContextManager {
  #context: AudioContext | null;
  readonly #owned: boolean;

  constructor(context?: AudioContext) {
    this.#context = context ?? null;
    this.#owned = context === undefined;
  }

  get current(): AudioContext | null {
    return this.#context;
  }

  /** Returns the context, creating it on first use. */
  get(): AudioContext {
    if (this.#context && this.#context.state !== "closed") return this.#context;
    const Ctor = getAudioContextClass();
    if (!Ctor)
      throw new SonicError(SonicErrorCode.AudioUnsupported, "Web Audio API is not available.");
    this.#context = new Ctor({ latencyHint: "interactive" });
    return this.#context;
  }

  /** Ensures the context is running. Kick this off synchronously inside a click handler. */
  async resume(session: AudioSessionType = "auto"): Promise<AudioContext> {
    setAudioSession(session);
    const context = this.get();
    if (context.state !== "running") await context.resume();
    return context;
  }

  /** Closes the context if this manager created it. A later `get()` creates a fresh one. */
  async close(): Promise<void> {
    const context = this.#context;
    this.#context = null;
    if (context && this.#owned && context.state !== "closed") await context.close();
  }
}

/** iOS Safari: without this, the ringer switch silences Web Audio and capture may duck output. */
function setAudioSession(type: AudioSessionType): void {
  if (typeof navigator === "undefined") return;
  const session = (navigator as Navigator & NavigatorWithAudioSession).audioSession;
  if (!session || type === "auto") return;
  try {
    session.type = type;
  } catch {
    // Unsupported value — ignore.
  }
}
