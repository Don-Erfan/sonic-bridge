import type { EncodedSignal } from '@don-erfan/sonic-bridge';
import { ISonicTestSettings } from '../interface';

export interface ISonicSenderCardProps {
  settings: ISonicTestSettings;
  /** Called after each transmission finished playing. */
  onSent: (signal: EncodedSignal) => void;
}
