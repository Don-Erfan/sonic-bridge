import type { CaptureBackend, CapturePreference, CaptureRequest } from "./backend";
import { ScriptProcessorCapture } from "./script-processor";
import { WorkletCapture } from "./worklet";

export type {
  CaptureBackend,
  CaptureKind,
  CapturePreference,
  CaptureRequest,
  SampleSink,
} from "./backend";

/** Factory: picks the best available backend, falling back from AudioWorklet to ScriptProcessor. */
export async function createCapture(
  request: CaptureRequest,
  preference: CapturePreference = "auto",
): Promise<CaptureBackend> {
  const workletAvailable =
    typeof AudioWorkletNode !== "undefined" && "audioWorklet" in request.context;
  if (preference === "worklet" || (preference === "auto" && workletAvailable)) {
    try {
      return await WorkletCapture.create(request);
    } catch (error) {
      // e.g. a CSP that forbids blob: worklets — fall back unless explicitly requested.
      if (preference === "worklet") throw error;
    }
  }
  return new ScriptProcessorCapture(request);
}
