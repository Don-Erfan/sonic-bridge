import type { TMoodKey } from '@/lib/mood';
import type { TPresenceStatus } from '@/lib/presence';

/** A colleague's current mood, as shown next to their name. */
export interface IStaffMood {
  key: TMoodKey;
  note: string;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it; `null` = no expiry. */
  expiresAt: number | null;
}

/** One row of the team list. */
export interface IStaffMember {
  id: string;
  fullName: string;
  jobTitle: string;
  team: string;
  avatarUrl: string | null;
  presence: TPresenceStatus;
  /** When the face-recognition gate recognised them today (Unix ms). */
  checkedInAt: number | null;
  mood: IStaffMood | null;
}

/** Staff API contract (`GET /staff`) — includes the signed-in user. */
export interface IStaffService {
  getStaff(): Promise<IStaffMember[]>;
}
