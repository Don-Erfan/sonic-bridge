import { symbolsToBytes } from "../coding/symbols";
import type { SampleBuffer } from "../dsp/sample-buffer";
import type { SyncDetector, SyncMatch } from "../dsp/sync-detector";
import type { Modulation } from "../modulation/modulation";
import {
  bodyBlockBytes,
  decodeBody,
  decodeHeader,
  type FrameHeader,
  HEADER_BLOCK_BYTES,
} from "../protocol/frame";
import { type Protocol, symbolsFor } from "../protocol/protocol";
import type { DecoderEvents } from "./events";

export type DecoderStateName = "searching" | "header" | "body";

/** What a state may touch on the decoder (keeps the public class surface small). */
export interface DecoderContext {
  readonly protocol: Protocol;
  readonly buffer: SampleBuffer;
  readonly sync: SyncDetector;
  readonly modulation: Modulation;
  transition(state: DecoderState): void;
  emit<K extends keyof DecoderEvents>(type: K, payload: DecoderEvents[K]): void;
}

/**
 * State pattern: each phase of frame reception is its own class. `step` consumes what it can
 * from the buffer and returns `true` when the decoder should immediately run the next step.
 */
export abstract class DecoderState {
  abstract readonly name: DecoderStateName;
  abstract step(ctx: DecoderContext): boolean;

  /** Template-method helper shared by the states that read symbols. */
  protected readBlock(
    ctx: DecoderContext,
    start: number,
    bytes: number,
  ): { block: Uint8Array; marginDb: number } | null {
    const count = symbolsFor(ctx.protocol, bytes);
    const end = start + count * ctx.protocol.samples.slot;
    if (!ctx.buffer.has(start, end)) return null;
    const view = ctx.buffer.view(start, end);
    const { symbols, marginDb } = ctx.modulation.demodulate(view, 0, count);
    return { block: symbolsToBytes(symbols, ctx.protocol.band.bitsPerSymbol), marginDb };
  }
}

export class SearchingState extends DecoderState {
  readonly name = "searching";

  step(ctx: DecoderContext): boolean {
    const match = ctx.sync.scan(ctx.buffer);
    if (!match) {
      ctx.buffer.discardBefore(ctx.sync.position);
      return false;
    }
    ctx.emit("sync", match);
    ctx.transition(new HeaderState(match));
    return true;
  }
}

export class HeaderState extends DecoderState {
  readonly name = "header";
  readonly #match: SyncMatch;

  constructor(match: SyncMatch) {
    super();
    this.#match = match;
  }

  step(ctx: DecoderContext): boolean {
    const { chirp, gap, slot } = ctx.protocol.samples;
    const start = this.#match.position + chirp + gap;
    const read = this.readBlock(ctx, start, HEADER_BLOCK_BYTES);
    if (!read) return false;

    const decoded = decodeHeader(ctx.protocol, read.block);
    if (!decoded.ok) {
      ctx.emit("reject", {
        stage: "header",
        reason: decoded.error,
        position: this.#match.position,
      });
      // Likely a false preamble: resume just after it so an overlapping real one is not missed.
      ctx.sync.seek(this.#match.position + Math.floor(chirp / 8));
      ctx.transition(new SearchingState());
      return true;
    }

    const header = decoded.value;
    const bodyStart = start + symbolsFor(ctx.protocol, HEADER_BLOCK_BYTES) * slot;
    const bodySymbols = symbolsFor(ctx.protocol, bodyBlockBytes(header));
    ctx.emit("header", {
      ...header,
      position: this.#match.position,
      remainingSeconds: (bodySymbols * slot) / ctx.protocol.sampleRate,
    });
    ctx.transition(
      new BodyState(
        this.#match,
        header,
        bodyStart,
        read.block.length - HEADER_BLOCK_BYTES,
        read.marginDb,
      ),
    );
    return true;
  }
}

export class BodyState extends DecoderState {
  readonly name = "body";
  readonly #match: SyncMatch;
  readonly #header: FrameHeader;
  readonly #start: number;
  readonly #headerCorrected: number;
  readonly #headerMargin: number;
  #lastReported = -1;

  constructor(
    match: SyncMatch,
    header: FrameHeader,
    start: number,
    headerCorrected: number,
    headerMargin: number,
  ) {
    super();
    this.#match = match;
    this.#header = header;
    this.#start = start;
    this.#headerCorrected = Math.max(0, headerCorrected);
    this.#headerMargin = headerMargin;
  }

  step(ctx: DecoderContext): boolean {
    const bytes = bodyBlockBytes(this.#header);
    const total = symbolsFor(ctx.protocol, bytes);
    const slot = ctx.protocol.samples.slot;
    const end = this.#start + total * slot;
    const read = this.readBlock(ctx, this.#start, bytes);

    if (!read) {
      const received = Math.max(
        0,
        Math.min(total, Math.floor((ctx.buffer.end - this.#start) / slot)),
      );
      if (received !== this.#lastReported) {
        this.#lastReported = received;
        ctx.emit("progress", { received, total, ratio: received / total });
      }
      return false;
    }

    ctx.emit("progress", { received: total, total, ratio: 1 });
    const decoded = decodeBody(this.#header, read.block);
    if (decoded.ok) {
      ctx.emit("packet", {
        contentType: this.#header.contentType,
        payload: decoded.value.payload,
        position: this.#match.position,
        stats: {
          correctedBytes: decoded.value.corrected + this.#headerCorrected,
          syncScore: this.#match.score,
          marginDb: (read.marginDb + this.#headerMargin) / 2,
          duration: (end - this.#match.position) / ctx.protocol.sampleRate,
        },
      });
    } else {
      ctx.emit("reject", { stage: "body", reason: decoded.error, position: this.#match.position });
    }
    ctx.sync.seek(end);
    ctx.transition(new SearchingState());
    return true;
  }
}
