export { crc16 } from "./coding/crc16";
export { ReedSolomon } from "./coding/reed-solomon";
export { type DecoderOptions, SonicDecoder } from "./decoder/decoder";
export type { DecoderEvents } from "./decoder/events";
export {
  messageToText,
  type PacketStats,
  type ReceivedPacket,
  type SonicMessage,
  toMessage,
} from "./decoder/message";
export type { DecoderStateName } from "./decoder/states";
export { type EncodedSignal, type EncoderOptions, SonicEncoder } from "./encoder";
export {
  type ErrorDomainOf,
  invariant,
  SonicError,
  SonicErrorCode,
  type SonicErrorOptions,
} from "./errors";
export { type Listener, TypedEmitter, type Unsubscribe } from "./events";
export { MfskModulation, mfsk } from "./modulation/mfsk";
export type { DemodulatedSymbols, Modulation, ModulationFactory } from "./modulation/modulation";
export {
  ContentType,
  type ContentTypeName,
  type ContentValueMap,
  codecs,
  type EncodedPayload,
  encodePayload,
  type PayloadCodec,
  type PayloadInput,
  type TypedPayload,
} from "./payload/content";
export { decodeBody, decodeHeader, encodeFrame, type FrameHeader } from "./protocol/frame";
export {
  BANDS,
  type BandName,
  type BandProfile,
  type BitsPerSymbol,
  ECC_LEVELS,
  type EccLevel,
  SPEEDS,
  type SpeedName,
  type SpeedProfile,
} from "./protocol/profiles";
export {
  DEFAULT_MAX_PAYLOAD_BYTES,
  MAX_PAYLOAD_BYTES,
  PROTOCOL_VERSION,
  type Protocol,
  type ProtocolOptions,
  resolveProtocol,
} from "./protocol/protocol";
export { preambleFor, SignalBuilder } from "./signal/signal-builder";
export {
  type Brand,
  type Hertz,
  hz,
  type SampleCount,
  type SampleRate,
  type Seconds,
  sampleRate,
  seconds,
} from "./types/brand";
export { err, ok, type Result } from "./types/result";
export { assertNever, type Simplify, type ValueOf, type WithRequired } from "./types/utility";
export { encodeWav } from "./wav";
