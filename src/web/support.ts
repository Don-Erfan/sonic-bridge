export interface SupportReport {
  /** Can play a transmission through the speakers. */
  readonly transmit: boolean;
  /** Can capture the microphone and decode. */
  readonly receive: boolean;
  readonly secureContext: boolean;
  readonly audioWorklet: boolean;
  /** Human-readable reasons for missing capabilities. */
  readonly issues: readonly string[];
}

type AudioContextConstructor = typeof AudioContext;

export function getAudioContextClass(): AudioContextConstructor | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const g = globalThis as typeof globalThis & { webkitAudioContext?: AudioContextConstructor };
  return g.AudioContext ?? g.webkitAudioContext;
}

/** Feature detection; safe to call during SSR (reports everything as unsupported). */
export function detectSupport(): SupportReport {
  const issues: string[] = [];
  const hasWindow = typeof window !== "undefined";
  const secureContext = hasWindow && window.isSecureContext === true;
  const audio = getAudioContextClass() !== undefined;
  const mic = hasWindow && typeof navigator.mediaDevices?.getUserMedia === "function";
  const audioWorklet = hasWindow && typeof AudioWorkletNode !== "undefined";

  if (!hasWindow) issues.push("Not running in a browser.");
  if (hasWindow && !audio) issues.push("Web Audio API is not available.");
  if (hasWindow && !secureContext) issues.push("Microphone access requires HTTPS (or localhost).");
  if (hasWindow && !mic) issues.push("getUserMedia is not available.");

  return {
    transmit: audio,
    receive: audio && mic && secureContext,
    secureContext,
    audioWorklet,
    issues,
  };
}
