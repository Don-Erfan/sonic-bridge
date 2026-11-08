import type { SonicMessage } from '@don-erfan/sonic-bridge/react';
import { ISonicTestSettings } from '../interface';

export interface ISonicReceiverCardProps {
  settings: ISonicTestSettings;
  /** Every verified message (the receiver stays on in continuous mode). */
  onReceived: (message: SonicMessage, text: string) => void;
  /** A frame whose header was valid but whose body failed verification. */
  onCorrupted: () => void;
}
