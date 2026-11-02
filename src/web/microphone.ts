import { SonicError, SonicErrorCode } from "../core";

export interface MicrophoneOptions {
  readonly deviceId?: string;
}

/** Maps `getUserMedia` DOMException names to library error codes. */
const DOM_ERRORS: Readonly<Record<string, SonicErrorCode>> = {
  NotAllowedError: SonicErrorCode.PermissionDenied,
  PermissionDeniedError: SonicErrorCode.PermissionDenied,
  SecurityError: SonicErrorCode.PermissionDenied,
  NotFoundError: SonicErrorCode.DeviceNotFound,
  OverconstrainedError: SonicErrorCode.DeviceNotFound,
  NotReadableError: SonicErrorCode.DeviceBusy,
  AbortError: SonicErrorCode.DeviceBusy,
  TypeError: SonicErrorCode.AudioUnsupported,
};

const MESSAGES: Partial<Record<SonicErrorCode, string>> = {
  [SonicErrorCode.PermissionDenied]: "Microphone permission was denied.",
  [SonicErrorCode.DeviceNotFound]: "No microphone was found.",
  [SonicErrorCode.DeviceBusy]: "The microphone is in use by another application.",
};

export function toMicrophoneError(error: unknown): SonicError {
  if (error instanceof SonicError) return error;
  const name = error instanceof Error || error instanceof DOMException ? error.name : "";
  const code = DOM_ERRORS[name] ?? SonicErrorCode.AudioUnsupported;
  return new SonicError(
    code,
    MESSAGES[code] ?? `Could not open the microphone (${name || "unknown error"}).`,
    {
      cause: error,
    },
  );
}

/**
 * Opens the microphone with all voice processing disabled. Echo cancellation and noise
 * suppression treat data tones as noise and would erase them.
 */
export async function openMicrophone(options: MicrophoneOptions = {}): Promise<MediaStream> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    throw new SonicError(
      SonicErrorCode.InsecureContext,
      "Microphone access requires HTTPS (or localhost).",
    );
  }
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new SonicError(SonicErrorCode.AudioUnsupported, "getUserMedia is not available.");
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
        ...(options.deviceId ? { deviceId: { exact: options.deviceId } } : {}),
      },
      video: false,
    });
  } catch (error) {
    throw toMicrophoneError(error);
  }
}

export function stopStream(stream: MediaStream | null | undefined): void {
  for (const track of stream?.getTracks() ?? []) track.stop();
}
