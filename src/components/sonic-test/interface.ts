import type {
  BandName,
  SonicMessage,
  SpeedName,
} from '@don-erfan/sonic-bridge/react';

/** `air` = speaker → microphone between devices; `loopback` = in-browser. */
export type TSonicTestMode = `air` | `loopback`;

export interface ISonicTestSettings {
  band: BandName;
  speed: SpeedName;
  mode: TSonicTestMode;
}

export interface ISonicReceivedEntry {
  id: number;
  receivedAt: Date;
  message: SonicMessage;
  text: string;
}
