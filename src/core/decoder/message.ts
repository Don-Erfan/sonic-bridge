import { type ContentTypeName, type ContentValueMap, codecs } from "../payload/content";
import type { Simplify } from "../types/utility";

export interface PacketStats {
  /** Byte errors fixed by Reed–Solomon (header + body). */
  readonly correctedBytes: number;
  /** Preamble correlation score, 0–1. */
  readonly syncScore: number;
  /** Mean tone margin in dB — a rough signal-quality indicator. */
  readonly marginDb: number;
  /** Airtime of the frame in seconds. */
  readonly duration: number;
}

export interface ReceivedPacket {
  readonly contentType: ContentTypeName;
  readonly payload: Uint8Array;
  readonly stats: PacketStats;
  /** Absolute sample index where the frame's preamble started. */
  readonly position: number;
}

/**
 * A decoded message as a discriminated union on `type`:
 * narrowing `message.type === "json"` makes `message.value` `unknown`,
 * `"binary"` makes it `Uint8Array`, and so on.
 */
export type SonicMessage = {
  [K in ContentTypeName]: Simplify<{
    readonly type: K;
    readonly value: ContentValueMap[K];
    readonly bytes: Uint8Array;
    readonly stats: PacketStats;
  }>;
}[ContentTypeName];

export function toMessage(packet: ReceivedPacket): SonicMessage {
  const base = { bytes: packet.payload, stats: packet.stats };
  switch (packet.contentType) {
    case "binary":
      return { ...base, type: "binary", value: codecs.binary.decode(packet.payload) };
    case "text":
      return { ...base, type: "text", value: codecs.text.decode(packet.payload) };
    case "digits":
      return { ...base, type: "digits", value: codecs.digits.decode(packet.payload) };
    case "json":
      return { ...base, type: "json", value: codecs.json.decode(packet.payload) };
  }
}

const hex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** Human-readable text for any message (binary becomes hex, JSON is stringified). */
export function messageToText(message: SonicMessage): string {
  switch (message.type) {
    case "text":
    case "digits":
      return message.value;
    case "json":
      return JSON.stringify(message.value);
    case "binary":
      return hex(message.value);
  }
}
