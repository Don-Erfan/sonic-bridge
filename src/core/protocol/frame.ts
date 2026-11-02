import { crc16 } from "../coding/crc16";
import { ReedSolomon } from "../coding/reed-solomon";
import { SonicError, SonicErrorCode } from "../errors";
import { ContentType, type ContentTypeName, contentTypeName } from "../payload/content";
import { err, ok, type Result } from "../types/result";
import {
  CRC_BYTES,
  HEADER_BYTES,
  HEADER_PARITY,
  MAX_PAYLOAD_BYTES,
  PROTOCOL_VERSION,
  type Protocol,
} from "./protocol";

/**
 * Wire format (each block is Reed–Solomon protected on its own):
 *
 *   header: [ver:2 | type:2 | parity/2:4] [length] + 4 RS parity bytes
 *   body:   [payload … ] [CRC-16 over header+payload] + N RS parity bytes
 *
 * The header is short and fixed-size so the receiver can learn the body length and
 * ECC strength before the body arrives.
 */
export interface FrameHeader {
  readonly version: number;
  readonly contentType: ContentTypeName;
  readonly payloadLength: number;
  readonly bodyParity: number;
}

export interface EncodedFrame {
  readonly header: Uint8Array;
  readonly body: Uint8Array;
}

export interface DecodedBody {
  readonly payload: Uint8Array;
  readonly corrected: number;
}

export const HEADER_BLOCK_BYTES: number = HEADER_BYTES + HEADER_PARITY;

export const bodyBlockBytes = (header: FrameHeader): number =>
  header.payloadLength + CRC_BYTES + header.bodyParity;

const headerRs = new ReedSolomon(HEADER_PARITY);
const bodyRs = new Map<number, ReedSolomon>();
const rsFor = (parity: number): ReedSolomon => {
  let rs = bodyRs.get(parity);
  if (!rs) {
    rs = new ReedSolomon(parity);
    bodyRs.set(parity, rs);
  }
  return rs;
};

const packHeader = (h: FrameHeader): Uint8Array =>
  Uint8Array.of(
    ((h.version & 0b11) << 6) | (ContentType[h.contentType] << 4) | ((h.bodyParity / 2) & 0xf),
    h.payloadLength,
  );

export function encodeFrame(
  protocol: Protocol,
  payload: Uint8Array,
  contentType: ContentTypeName,
): EncodedFrame {
  if (payload.length === 0) {
    throw new SonicError(SonicErrorCode.PayloadEmpty, "Payload must not be empty");
  }
  if (payload.length > protocol.maxPayloadBytes) {
    throw new SonicError(
      SonicErrorCode.PayloadTooLarge,
      `Payload is ${payload.length} bytes; the limit is ${protocol.maxPayloadBytes}`,
      { details: { size: payload.length, limit: protocol.maxPayloadBytes } },
    );
  }
  const header: FrameHeader = {
    version: PROTOCOL_VERSION,
    contentType,
    payloadLength: payload.length,
    bodyParity: protocol.eccParity,
  };
  const rawHeader = packHeader(header);
  const crc = crc16(rawHeader, payload);
  const body = new Uint8Array(payload.length + CRC_BYTES);
  body.set(payload);
  body[payload.length] = crc >> 8;
  body[payload.length + 1] = crc & 0xff;
  return {
    header: headerRs.encode(rawHeader),
    body: rsFor(header.bodyParity).encode(body),
  };
}

export function decodeHeader(protocol: Protocol, block: Uint8Array): Result<FrameHeader, string> {
  const decoded = headerRs.decode(block);
  if (!decoded.ok) return decoded;
  const [b0 = 0, length = 0] = decoded.value.data;
  const version = b0 >> 6;
  const contentType = contentTypeName((b0 >> 4) & 0b11);
  const bodyParity = (b0 & 0xf) * 2;
  if (version !== PROTOCOL_VERSION) return err(`unsupported protocol version ${version}`);
  if (!contentType) return err("unknown content type");
  if (bodyParity < 2) return err("invalid parity");
  if (length === 0 || length > Math.min(protocol.maxPayloadBytes, MAX_PAYLOAD_BYTES)) {
    return err(`payload length ${length} outside the accepted range`);
  }
  return ok({ version, contentType, payloadLength: length, bodyParity });
}

export function decodeBody(header: FrameHeader, block: Uint8Array): Result<DecodedBody, string> {
  const decoded = rsFor(header.bodyParity).decode(block);
  if (!decoded.ok) return decoded;
  const { data, corrected } = decoded.value;
  const payload = data.slice(0, header.payloadLength);
  const expected = (data[header.payloadLength]! << 8) | data[header.payloadLength + 1]!;
  if (crc16(packHeader(header), payload) !== expected) return err("checksum mismatch");
  return ok({ payload, corrected });
}
