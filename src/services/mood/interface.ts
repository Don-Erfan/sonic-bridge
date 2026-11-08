import type { TAvailability, TMoodKey } from '@/lib/mood';

/** The signed-in user's mood / status. */
export interface IMood {
  key: TMoodKey;
  note: string;
  availability: TAvailability;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it; `null` = never expires. */
  expiresAt: number | null;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  updatedAt: number;
}

/** Body of `PUT /mood`. */
export interface IUpdateMoodPayload {
  key: TMoodKey;
  note: string;
  availability: TAvailability;
  expiresAt: number | null;
}

/** Mood API contract. Expired moods are returned as `null`. */
export interface IMoodService {
  /** `GET /mood` */
  getMood(): Promise<IMood | null>;
  /** `PUT /mood` */
  updateMood(payload: IUpdateMoodPayload): Promise<IMood>;
  /** `DELETE /mood` */
  clearMood(): Promise<void>;
}
