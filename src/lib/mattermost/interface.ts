/**
 * Mattermost API v4 payloads, as defined by the server
 * (`server/public/model/custom_status.go`, `status.go`).
 */

/** `PUT /api/v4/users/{user_id}/status` → `status`. */
export type TMattermostStatus = `online` | `away` | `dnd` | `offline`;

/** Body of `PUT /api/v4/users/{user_id}/status/custom`. */
export interface IMattermostCustomStatus {
  /** Emoji short name without colons, e.g. `tada`. */
  emoji: string;
  /** At most 100 characters (runes); the server truncates beyond that. */
  text: string;
  /**
   * `date_and_time` with an absolute `expires_at`; both omitted for a status
   * that never clears.
   */
  duration?: `date_and_time`;
  /** ISO 8601. */
  expires_at?: string;
}

/** Body of `PUT /api/v4/users/{user_id}/status`. */
export interface IMattermostStatusUpdate {
  user_id: string;
  status: TMattermostStatus;
  /** Unix seconds; only meaningful with `dnd`. */
  dnd_end_time?: number;
}

/** Both calls needed to mirror an Ozone mood into Mattermost. */
export interface IMattermostStatusPlan {
  userId: string;
  customStatus: IMattermostCustomStatus;
  status: IMattermostStatusUpdate;
}

/** Body the app sends to its own `/api/mattermost/status` route. */
export interface IMattermostSyncRequest {
  moodKey: string;
  note: string;
  availability: string;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it, or `null` (never expires). */
  expiresAt: number | null;
}
