# sonic-bridge

**Send short data between devices over sound.** No internet, no server, no Bluetooth, no shared Wi‑Fi:
one device plays a short burst of tones, the other decodes it from its microphone.

```tsx
import { useSonicReceiver, useSonicTransmitter } from "sonic-bridge/react";

function SendCode() {
  const { transmit, status } = useSonicTransmitter();
  return (
    <button onClick={() => transmit("482193")}>
      {status === "transmitting" ? "Sending…" : "Send via sound"}
    </button>
  );
}

function ReceiveCode() {
  const { listen, data, status } = useSonicReceiver();
  return (
    <>
      <button onClick={listen}>Start listening</button>
      <p>{status}</p>
      <p>{data}</p>
    </>
  );
}
```

Typical uses: OTP hand-off from phone to laptop, device pairing, kiosk ↔ phone hand-off, session IDs — any
**short** payload between devices in the same room.

## Install

```bash
npm install sonic-bridge
```

One package, three entry points — import only what you use:

| Import                 | What it is                                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sonic-bridge`         | Framework-agnostic: `SonicTransmitter` / `SonicReceiver` (Web Audio, microphone, AudioWorklet) and the engine (`SonicEncoder` / `SonicDecoder`). No dependencies. |
| `sonic-bridge/react`   | React hooks: `useSonicTransmitter`, `useSonicReceiver`, optional `SonicBridgeProvider`. React ≥ 18 is an optional peer dependency.                                |
| `sonic-bridge/testing` | Deterministic acoustic-channel simulator for your own tests.                                                                                                      |

The package ships no UI — you render your own buttons and states; the hooks expose everything needed to drive them.
ESM + CommonJS, full type definitions, tree-shakable, SSR-safe.

## Usage

### React

```tsx
import { SonicBridgeProvider } from "sonic-bridge/react";

<SonicBridgeProvider band="audible" speed="normal">
  {" "}
  {/* optional: shared AudioContext + defaults */}
  <App />
</SonicBridgeProvider>;
```

```ts
const tx = useSonicTransmitter({ ecc: "high", onError: console.error });
tx.transmit("482193"); // digits → packed 2 per byte
tx.transmit("hello"); // UTF-8 text
tx.transmit({ type: "json", value: { session: "a1" } }); // JSON
tx.transmit(new Uint8Array([1, 2, 3])); // raw bytes
// tx.status: "idle" | "preparing" | "transmitting" | "done" | "error";  tx.progress: 0–1

const rx = useSonicReceiver({ timeout: 30_000, onMessage: (m) => console.log(m) });
// rx.status: "idle" | "requesting-permission" | "listening" | "receiving" | "success" | "error"
// rx.data (string by default), rx.message (typed union), rx.level, rx.progress, rx.error

const typed = useSonicReceiver({
  parse: (m) => (m.type === "json" ? (m.value as { session: string }) : null),
});
typed.data; // { session: string } | null — inferred from `parse`
```

`transmit` and `listen` never reject (errors go to `error`/`status`); use `transmitAsync` / `listenAsync` to get
rejections. Call both from a click/tap handler — browsers only start audio and the microphone after a user gesture.

### Any framework / vanilla

```ts
import { SonicReceiver, SonicTransmitter } from "sonic-bridge";

const message = await new SonicReceiver().listen({ timeout: 30_000 });
if (message.type === "digits") fillOtp(message.value);

await new SonicTransmitter({ speed: "fast" }).transmit("482193");
```

Both classes expose `subscribe` / `getSnapshot` (works with Vue, Svelte, Solid, Angular signals or any store), `stop` /
`cancel`, an `AbortSignal` option, and `Symbol.dispose` (`using tx = new SonicTransmitter()`).

### Engine only (no audio I/O)

```ts
import { SonicDecoder, SonicEncoder, toMessage } from "sonic-bridge";

const { samples, duration } = new SonicEncoder(48_000).encode("482193");
const decoder = new SonicDecoder(44_100);
decoder.on("packet", (p) => console.log(toMessage(p).value));
decoder.push(microphoneChunk); // any chunk size, any time
```

## Options

| Option            | Values                                                                               | Default     | Notes                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `band`            | `"audible"` (1.5–3.5 kHz), `"ultrasonic"` (17.4–19.1 kHz), or a custom `BandProfile` | `"audible"` | Must match on both sides. Ultrasonic is quieter to humans but many phone speakers/mics roll off above 17 kHz — test your devices. |
| `speed`           | `"fast"` · `"normal"` · `"robust"`                                                   | `"normal"`  | Must match on both sides. 6‑digit OTP airtime ≈ 1.8 s / 2.5 s / 4.1 s.                                                            |
| `ecc`             | `"low"` (4) · `"medium"` (8) · `"high"` (16) parity bytes                            | `"medium"`  | Sender only; carried in the header. Corrects parity/2 corrupted bytes.                                                            |
| `maxPayloadBytes` | 1–128                                                                                | 32          | Larger payloads throw `payload/too-large`.                                                                                        |
| `volume`          | 0–1                                                                                  | 0.8         | Transmitter peak amplitude.                                                                                                       |
| `timeout`         | ms, `0` = never                                                                      | 60 000      | Receiver; never cuts off a frame that is arriving.                                                                                |
| `continuous`      | boolean                                                                              | `false`     | Receiver keeps listening after a message.                                                                                         |
| `destination`     | `(ctx) => AudioNode`                                                                 | speakers    | Transmitter output node (e.g. a `MediaStreamAudioDestinationNode`).                                                               |
| `stream`          | `MediaStream`                                                                        | microphone  | Receiver input (custom device, recording, loopback tests).                                                                        |

## Errors

Every failure is a `SonicError` with a typed `code`:

`payload/empty` · `payload/too-large` · `payload/invalid` · `config/invalid` · `audio/unsupported` ·
`audio/insecure-context` · `audio/permission-denied` · `audio/device-not-found` · `audio/device-busy` ·
`audio/playback-failed` · `decode/corrupted` · `decode/timeout` · `operation/aborted` · `operation/busy`

```ts
if (SonicError.is(error, "audio/permission-denied")) showPermissionHelp();
```

## How it works

```
 ┌── src/react   → sonic-bridge/react ──┐   hooks over useSyncExternalStore
 ├── src/web     → sonic-bridge ────────┤   AudioContext · getUserMedia · AudioWorklet
 └── src/core    → sonic-bridge ────────┘   pure TypeScript, no DOM

 encode:  payload → frame (header + body, CRC‑16, Reed–Solomon) → 4‑bit symbols → 16‑FSK tones
 air:     [lead‑in][chirp 120 ms][gap][header 12 symbols][body N symbols][tail]
 decode:  band‑pass → FFT matched filter finds the chirp → Goertzel per symbol → RS → CRC → message
```

**Wire format** — each block is protected by its own Reed–Solomon code:

| Block  | Bytes          | Content                                                   |
| ------ | -------------- | --------------------------------------------------------- |
| Header | 2 + 4 parity   | `version:2 · contentType:2 · parity/2:4`, `payloadLength` |
| Body   | n + 2 + parity | payload, CRC‑16/CCITT over header+payload                 |

**Modulation** — 16 tones (4 bits/symbol), 120 Hz apart (audible) or 100 Hz (ultrasonic). Each tone has
raised‑cosine ramps (no clicks) and a silent guard interval that absorbs room echo; the decoder ignores the first
20 % of each tone for the same reason. Synchronization uses normalized cross‑correlation against a linear chirp,
computed with an FFT (overlap‑save), so it tolerates arbitrary chunking, 44.1/48 kHz mismatches and clock drift.

### Design patterns

| Pattern ([refactoring.guru](https://refactoring.guru/design-patterns)) | Where                                                                                                                      |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Facade**                                                             | `SonicEncoder`, `SonicDecoder`, `SonicTransmitter`, `SonicReceiver` hide framing, DSP and the audio graph behind one call. |
| **Strategy**                                                           | `Modulation` (MFSK is one implementation, swappable via `modulation`), `PayloadCodec`s per content type.                   |
| **State**                                                              | The decoder is a state machine: `SearchingState → HeaderState → BodyState`, each a class.                                  |
| **Template Method**                                                    | `DecoderState.readBlock` — shared demodulation step used by the concrete states.                                           |
| **Builder**                                                            | `SignalBuilder().silence().preamble().symbols().build()` assembles the waveform.                                           |
| **Observer**                                                           | `TypedEmitter` (type-safe events) and `Store` (`subscribe`/`getSnapshot` for React).                                       |
| **Adapter**                                                            | `CaptureBackend` adapts AudioWorklet and ScriptProcessor to one sample-stream interface.                                   |
| **Factory Method**                                                     | `createCapture` picks a backend with fallback; `ModulationFactory`.                                                        |

### TypeScript

Branded units (`Hertz`, `Seconds`, `SampleRate`), discriminated unions for every state and message,
template-literal error codes (`` `${domain}/${reason}` ``) with `infer` to extract the domain, mapped types for the
codec registry and event maps, function overloads (`listen`; `useSonicReceiver` infers `data` from `parse`),
`const` type parameters, `NoInfer`, assertion functions and type guards, `#private` fields, `Disposable`,
`Result<T, E>`, and `strict` + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess` + `isolatedDeclarations`.

## Limits — read before shipping

| Topic         | Reality                                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payload size  | Short payloads only (default ≤ 32 B, max 128 B). ~6–12 bytes/s. Not for files.                                                                            |
| Range         | Designed for ~0.2–1.5 m. Volume, speaker quality and room noise matter.                                                                                   |
| Inaudible     | Not guaranteed. The ultrasonic band is device-dependent; keep `audible` as the fallback.                                                                  |
| Browser       | Receiving needs HTTPS (or localhost) and microphone permission. Audio starts only after a user gesture. iOS Safari may still apply some voice processing. |
| Same settings | Sender and receiver must use the same `band` and `speed`.                                                                                                 |
| CSP           | Capture loads an AudioWorklet from a `blob:` URL; if your CSP forbids it, the library falls back to ScriptProcessor.                                      |

### Security

Sound is a **broadcast** channel: anyone in the room can record it. The CRC protects against corruption,
**not** tampering. For OTPs and pairing, use short-lived, single-use codes bound to the session that requested them,
and encrypt/authenticate sensitive payloads before transmitting.

## Reliability

`pnpm bench` runs a Monte-Carlo benchmark through the channel simulator (`sonic-bridge/testing`): random 6-digit
codes, white noise, reverberation, attenuation, 44.1/48 kHz mismatch and ±100 ppm clock drift. In the "room" model
every profile decodes 100 % of trials down to 0 dB SNR; with deliberately harsh, equally loud echoes `fast` drops to
~93–97 % while `normal`/`robust` stay at 100 %.

**This is a simulation.** Real speaker/microphone pairs must still be measured on your target devices. The v1
engineering target is ≥ 95 % at 1 m in a quiet room on a defined device set.

## Development

```bash
pnpm install
pnpm test         # unit + end-to-end tests (Node + jsdom)
pnpm typecheck
pnpm lint
pnpm bench        # simulated success rate
pnpm build        # dist/: ESM + CJS + .d.ts for every entry point
```

```
src/core     engine: DSP, coding, framing, decoder state machine
src/web      Web Audio adapter
src/react    hooks
src/testing  channel simulator
test/        tests per layer        bench/  benchmark
```

Stack: TypeScript 7 · tsdown · Vitest · Biome · Changesets.

### Releasing

```bash
pnpm changeset            # describe the change
pnpm changeset version    # bump the version
pnpm release              # lint + typecheck + test + build, then publish to npm
```

## License

MIT
