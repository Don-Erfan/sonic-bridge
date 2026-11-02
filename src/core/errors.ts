import type { ValueOf } from "./types/utility";

type ErrorDomain = "payload" | "config" | "audio" | "decode" | "operation";

/**
 * Every error the library raises has a stable, machine-readable code of the form
 * `domain/reason`; a template-literal type enforces that shape at compile time.
 */
export const SonicErrorCode = {
  PayloadEmpty: "payload/empty",
  PayloadTooLarge: "payload/too-large",
  PayloadInvalid: "payload/invalid",
  ConfigInvalid: "config/invalid",
  AudioUnsupported: "audio/unsupported",
  InsecureContext: "audio/insecure-context",
  PermissionDenied: "audio/permission-denied",
  DeviceNotFound: "audio/device-not-found",
  DeviceBusy: "audio/device-busy",
  PlaybackFailed: "audio/playback-failed",
  Corrupted: "decode/corrupted",
  Timeout: "decode/timeout",
  Aborted: "operation/aborted",
  Busy: "operation/busy",
} as const;

export type SonicErrorCode = ValueOf<typeof SonicErrorCode>;

// Compile-time contract: every code must look like `domain/reason` with a known domain.
const _codeShape: Readonly<Record<string, `${ErrorDomain}/${string}`>> = SonicErrorCode;
void _codeShape;

/** Extracts the domain part of an error code: `ErrorDomainOf<"audio/device-busy">` is `"audio"`. */
export type ErrorDomainOf<C extends SonicErrorCode> = C extends `${infer D}/${string}` ? D : never;

export interface SonicErrorOptions {
  readonly cause?: unknown;
  readonly details?: Readonly<Record<string, unknown>>;
}

export class SonicError<C extends SonicErrorCode = SonicErrorCode> extends Error {
  override readonly name = "SonicError";
  readonly code: C;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(code: C, message: string, options: SonicErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.code = code;
    this.details = options.details;
  }

  get domain(): ErrorDomainOf<C> {
    return this.code.split("/")[0] as ErrorDomainOf<C>;
  }

  /** Narrowing type guard, optionally for a specific code. */
  static is<K extends SonicErrorCode>(value: unknown, code?: K): value is SonicError<K> {
    return value instanceof SonicError && (code === undefined || value.code === code);
  }

  /** Wraps any thrown value into a `SonicError`, preserving existing ones. */
  static from(value: unknown, fallback: SonicErrorCode, message?: string): SonicError {
    if (value instanceof SonicError) return value;
    if (isAbortError(value)) {
      return new SonicError(SonicErrorCode.Aborted, "The operation was aborted.", { cause: value });
    }
    const text = message ?? (value instanceof Error ? value.message : String(value));
    return new SonicError(fallback, text, { cause: value });
  }
}

function isAbortError(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    (value as { name: unknown }).name === "AbortError"
  );
}

/** Assertion function: narrows `condition` for the rest of the scope or throws a config error. */
export function invariant(
  condition: unknown,
  message: string,
  code: SonicErrorCode = SonicErrorCode.ConfigInvalid,
): asserts condition {
  if (!condition) throw new SonicError(code, message);
}
