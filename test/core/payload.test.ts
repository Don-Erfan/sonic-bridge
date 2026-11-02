import { describe, expect, expectTypeOf, it } from "vitest";
import { type SonicMessage, toMessage } from "../../src/core/decoder/message";
import { SonicError } from "../../src/core/errors";
import { codecs, encodePayload } from "../../src/core/payload/content";

describe("payload encoding", () => {
  it("packs digit strings as BCD, preserving leading zeros and odd lengths", () => {
    const { type, bytes } = encodePayload("0482193");
    expect(type).toBe("digits");
    expect(bytes).toHaveLength(4);
    expect(codecs.digits.decode(bytes)).toBe("0482193");
  });

  it("uses UTF-8 text for other strings", () => {
    const { type, bytes } = encodePayload("سلام 👋");
    expect(type).toBe("text");
    expect(codecs.text.decode(bytes)).toBe("سلام 👋");
  });

  it("supports typed JSON payloads", () => {
    const { type, bytes } = encodePayload({ type: "json", value: { id: 7, ok: true } });
    expect(type).toBe("json");
    expect(codecs.json.decode(bytes)).toEqual({ id: 7, ok: true });
  });

  it("raises typed errors for malformed input", () => {
    expect(() => codecs.digits.encode("12a")).toThrow(SonicError);
    try {
      codecs.text.decode(Uint8Array.of(0xff));
    } catch (error) {
      expect(SonicError.is(error, "payload/invalid")).toBe(true);
    }
  });

  it("narrows messages by content type", () => {
    const message: SonicMessage = toMessage({
      contentType: "digits",
      payload: codecs.digits.encode("42"),
      position: 0,
      stats: { correctedBytes: 0, syncScore: 1, marginDb: 20, duration: 1 },
    });
    if (message.type === "digits") expectTypeOf(message.value).toEqualTypeOf<string>();
    if (message.type === "binary") expectTypeOf(message.value).toEqualTypeOf<Uint8Array>();
    expect(message.value).toBe("42");
  });
});
