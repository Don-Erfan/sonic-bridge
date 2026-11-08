import type { TPresenceStatus } from '@/lib/presence';

export interface IAvatarProps {
  /** Full name; its initials are the fallback. */
  name: string;
  src?: string | null;
  size?: TAvatarSize;
  /** Adds a presence dot (decorative — state it in text nearby too). */
  presence?: TPresenceStatus;
  /** Mood emoji pinned to the corner. */
  emoji?: string;
}

export type TAvatarSize = `sm` | `md` | `lg` | `xl`;
