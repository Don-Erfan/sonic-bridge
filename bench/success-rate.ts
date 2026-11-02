/**
 * Monte-Carlo success-rate benchmark over the simulated acoustic channel.
 *   pnpm bench                 # default 100 trials per scenario
 *   pnpm bench -- --trials 500
 * This measures the DSP engine, not real speakers/microphones — device testing is still required.
 */
import {
  type BandName,
  SonicDecoder,
  SonicEncoder,
  type SpeedName,
  toMessage,
} from "../src/core/index";
import { createRandom, simulateChannel } from "../src/testing/index";

interface Scenario {
  readonly name: string;
  readonly band: BandName;
  readonly speed: SpeedName;
  readonly snrDb: number;
  /** "room": exponentially decaying reflections; "harsh": late echoes as loud as the direct path. */
  readonly channel: "room" | "harsh";
}

const trialsArg = process.argv.indexOf("--trials");
const trials = trialsArg > -1 ? Number(process.argv[trialsArg + 1]) : 100;

const random = createRandom(2026);

const scenarios: Scenario[] = (["audible", "ultrasonic"] as const).flatMap((band) => [
  ...(["fast", "normal"] as const).flatMap((speed) =>
    [12, 3, 0].map(
      (snrDb): Scenario => ({
        name: `${band}/${speed} @ ${snrDb} dB, room`,
        band,
        speed,
        snrDb,
        channel: "room",
      }),
    ),
  ),
  ...(["fast", "normal", "robust"] as const).map(
    (speed): Scenario => ({
      name: `${band}/${speed} @ 12 dB, harsh echo`,
      band,
      speed,
      snrDb: 12,
      channel: "harsh",
    }),
  ),
]);

const echoesFor = (channel: Scenario["channel"]) =>
  channel === "room"
    ? Array.from({ length: 12 }, () => {
        const delay = 0.002 + random() * 0.08;
        return { delay, gain: (random() - 0.5) * 1.2 * Math.exp(-delay / 0.02) };
      })
    : Array.from({ length: 4 }, () => ({
        delay: 0.002 + random() * 0.04,
        gain: 0.1 + random() * 0.4,
      }));

const rows: Record<string, string | number>[] = [];

for (const scenario of scenarios) {
  const txRate = 48_000;
  const rxRate = random() < 0.5 ? 44_100 : 48_000;
  const encoder = new SonicEncoder(txRate, { band: scenario.band, speed: scenario.speed });
  let ok = 0;
  let corrected = 0;
  const started = performance.now();
  for (let t = 0; t < trials; t++) {
    const code = String(Math.floor(random() * 1e6)).padStart(6, "0");
    const signal = encoder.encode(code);
    const received = simulateChannel(signal.samples, {
      fromRate: txRate,
      toRate: rxRate,
      snrDb: scenario.snrDb,
      gain: 0.02 + random() * 0.5,
      delay: random() * 1.5,
      clockDrift: (random() - 0.5) * 2e-4,
      echoes: echoesFor(scenario.channel),
      seed: Math.floor(random() * 2 ** 31),
    });
    const packets = SonicDecoder.decodeAll(received, rxRate, {
      band: scenario.band,
      speed: scenario.speed,
    });
    const message = packets[0] && toMessage(packets[0]);
    if (packets.length === 1 && message?.value === code) {
      ok++;
      corrected += packets[0]!.stats.correctedBytes;
    }
  }
  rows.push({
    scenario: scenario.name,
    airtime: `${encoder.estimateDuration(3).toFixed(2)}s`,
    success: `${((ok / trials) * 100).toFixed(1)}%`,
    "avg corrected bytes": ok ? (corrected / ok).toFixed(2) : "-",
    "decode ms/trial": ((performance.now() - started) / trials).toFixed(1),
  });
}

console.log(
  `\nSonic Bridge — simulated success rate (${trials} trials per scenario, 6-digit OTP)\n`,
);
console.table(rows);
