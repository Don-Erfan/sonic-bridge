import { SonicError, SonicErrorCode } from "../core";

export const abortError = (): SonicError =>
  new SonicError(SonicErrorCode.Aborted, "The operation was aborted.");

/** Combines an optional external signal with an internal controller. */
export function linkSignal(controller: AbortController, external?: AbortSignal): () => void {
  if (!external) return () => {};
  if (external.aborted) {
    controller.abort(external.reason);
    return () => {};
  }
  const onAbort = (): void => controller.abort(external.reason);
  external.addEventListener("abort", onAbort, { once: true });
  return () => external.removeEventListener("abort", onAbort);
}
