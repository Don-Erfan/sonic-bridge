import type { SyncMatch } from "../dsp/sync-detector";
import type { FrameHeader } from "../protocol/frame";
import type { ReceivedPacket } from "./message";
import type { DecoderStateName } from "./states";

export interface DecoderEvents {
  /** A preamble was detected; a frame may follow. */
  sync: SyncMatch;
  /** A valid header was decoded; the body is now being received. */
  header: FrameHeader & { readonly position: number; readonly remainingSeconds: number };
  /** Body reception progress, in symbols. */
  progress: { readonly received: number; readonly total: number; readonly ratio: number };
  /** A complete, checksum-verified frame. */
  packet: ReceivedPacket;
  /** A frame was dropped. Header rejects are usually false preambles; body rejects are real corruption. */
  reject: { readonly stage: "header" | "body"; readonly reason: string; readonly position: number };
  state: DecoderStateName;
}
