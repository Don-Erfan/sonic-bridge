import type { ReactNode } from 'react';
import type { TTone } from '@/lib/tone';
import { TIconName } from '@/icons';

export interface IStatTileProps {
  icon: TIconName;
  tone: TTone;
  /** The figure (number, `CoinAmount`, skeleton while loading). */
  value: ReactNode;
  label: string;
  /** Makes the whole tile a link. */
  href?: string;
}
