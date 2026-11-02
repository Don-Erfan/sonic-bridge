import { SonicError, SonicErrorCode } from "../errors";
import type { ValueOf } from "../types/utility";

/** Content type identifiers carried in the frame header (2 bits). */
export const ContentType = {
  binary: 0,
  text: 1,
  digits: 2,
  json: 3,
} as const;

export type ContentTypeName = keyof typeof ContentType;
export type ContentTypeId = ValueOf<typeof ContentType>;

/** Maps a content type to the JS value it decodes to. */
export interface ContentValueMap {
  binary: Uint8Array;
  text: string;
  digits: string;
  json: unknown;
}

/** Strategy interface: how a value is turned into bytes and back. */
export interface PayloadCodec<T> {
  encode(value: T): Uint8Array;
  decode(bytes: Uint8Array): T;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

const invalid = (message: string, cause?: unknown): SonicError =>
  new SonicError(SonicErrorCode.PayloadInvalid, message, cause === undefined ? {} : { cause });

/** Packs a decimal string as BCD — two digits per byte, `0xF` pads an odd length. */
const digitsCodec: PayloadCodec<string> = {
  encode(value) {
    if (!/^\d+$/.test(value)) throw invalid("Digits payload must contain only 0-9");
    const out = new Uint8Array(Math.ceil(value.length / 2));
    for (let i = 0; i < value.length; i += 2) {
      const hi = value.charCodeAt(i) - 48;
      const lo = i + 1 < value.length ? value.charCodeAt(i + 1) - 48 : 0xf;
      out[i / 2] = (hi << 4) | lo;
    }
    return out;
  },
  decode(bytes) {
    let s = "";
    for (const [i, byte] of bytes.entries()) {
      const hi = byte >> 4;
      const lo = byte & 0xf;
      if (hi > 9 || (lo > 9 && !(lo === 0xf && i === bytes.length - 1))) {
        throw invalid("Malformed digits payload");
      }
      s += String(hi);
      if (lo !== 0xf) s += String(lo);
    }
    return s;
  },
};

/**
 * Codec registry. A mapped type ties each key to a codec of the right value type,
 * so `codecs.digits` is a `PayloadCodec<string>` and `codecs.binary` a `PayloadCodec<Uint8Array>`.
 */
export const codecs: { readonly [K in ContentTypeName]: PayloadCodec<ContentValueMap[K]> } = {
  binary: { encode: (v) => v.slice(), decode: (b) => b.slice() },
  text: {
    encode: (v) => encoder.encode(v),
    decode: (b) => {
      try {
        return decoder.decode(b);
      } catch (cause) {
        throw invalid("Payload is not valid UTF-8", cause);
      }
    },
  },
  digits: digitsCodec,
  json: {
    encode: (v) => encoder.encode(JSON.stringify(v)),
    decode: (b) => {
      try {
        return JSON.parse(decoder.decode(b)) as unknown;
      } catch (cause) {
        throw invalid("Payload is not valid JSON", cause);
      }
    },
  },
};

/** Explicitly typed payload, e.g. `{ type: "json", value: { id: 7 } }`. */
export type TypedPayload = {
  [K in ContentTypeName]: { readonly type: K; readonly value: ContentValueMap[K] };
}[ContentTypeName];

/** Anything `encode`/`transmit` accept. Strings of digits are packed automatically. */
export type PayloadInput = string | Uint8Array | TypedPayload;

export interface EncodedPayload {
  readonly type: ContentTypeName;
  readonly bytes: Uint8Array;
}

const DIGITS = /^\d{1,64}$/;

/** Normalizes any payload input into bytes plus a content type. */
export function encodePayload(input: PayloadInput): EncodedPayload {
  if (typeof input === "string") {
    const type = DIGITS.test(input) ? "digits" : "text";
    return { type, bytes: codecs[type].encode(input) };
  }
  if (input instanceof Uint8Array) return { type: "binary", bytes: codecs.binary.encode(input) };
  return { type: input.type, bytes: encodeTyped(input) };
}

function encodeTyped(input: TypedPayload): Uint8Array {
  switch (input.type) {
    case "binary":
      return codecs.binary.encode(input.value);
    case "text":
      return codecs.text.encode(input.value);
    case "digits":
      return codecs.digits.encode(input.value);
    case "json":
      return codecs.json.encode(input.value);
  }
}

export const contentTypeName = (id: number): ContentTypeName | undefined =>
  (Object.keys(ContentType) as ContentTypeName[]).find((k) => ContentType[k] === id);
