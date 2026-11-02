// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { SonicEncoder } from "../../src/core";
import {
  SonicBridgeProvider,
  type SonicMessage,
  useSonicReceiver,
  useSonicTransmitter,
} from "../../src/react";
import { asContext, FakeAudioContext, fakeStream } from "../web/fake-audio";

const wrapperFor =
  (fake: FakeAudioContext) =>
  ({ children }: { children: ReactNode }) => (
    <SonicBridgeProvider context={asContext(fake)} speed="normal">
      {children}
    </SonicBridgeProvider>
  );

describe("useSonicTransmitter", () => {
  it("exposes status transitions and never rejects from transmit()", async () => {
    const fake = new FakeAudioContext();
    const { result } = renderHook(() => useSonicTransmitter({ volume: 0.5 }), {
      wrapper: wrapperFor(fake),
    });
    expect(result.current.status).toBe("idle");

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.transmit("x".repeat(500));
    });
    expect(outcome).toBeUndefined();
    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("payload/too-large");

    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
  });
});

describe("useSonicReceiver", () => {
  it("receives data end-to-end through the provider", async () => {
    const fake = new FakeAudioContext();
    const { result } = renderHook(
      () => useSonicReceiver({ stream: fakeStream(), capture: "script-processor" }),
      {
        wrapper: wrapperFor(fake),
      },
    );
    expectTypeOf(result.current.data).toEqualTypeOf<string | null>();

    await act(async () => {
      void result.current.listen();
    });
    await waitFor(() => expect(result.current.status).toBe("listening"));

    const signal = new SonicEncoder(fake.sampleRate).encode("hello").samples;
    act(() => {
      fake.processors[0]!.feed(signal);
      fake.processors[0]!.feed(new Float32Array(fake.sampleRate));
    });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toBe("hello");
    expect(result.current.message?.type).toBe("text");
  });

  it("types `data` from the parse option", () => {
    const fake = new FakeAudioContext();
    const { result } = renderHook(
      () => useSonicReceiver({ parse: (m: SonicMessage) => m.bytes.length }),
      { wrapper: wrapperFor(fake) },
    );
    expectTypeOf(result.current.data).toEqualTypeOf<number | null>();
  });
});
