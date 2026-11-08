import type { ReactNode } from 'react';
import type { TTone } from '@/lib/tone';
import { TIconName } from '@/icons';

export interface IBadgeProps {
  children: ReactNode;
  tone?: TTone;
  /** Leading glyph. Mutually exclusive with `hasDot`. */
  icon?: TIconName;
  /** Leading status dot (presence, live). */
  hasDot?: boolean;
  /** Pulses the dot — for live states ("happening now"). */
  isPulsing?: boolean;
  size?: `sm` | `md`;
}
