import type { TDeclarableWorkMode } from '@/lib/presence';

/** Coins granted for today's first check-in. */
export interface ICheckInReward {
  amount: number;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  grantedAt: number;
}

/** The signed-in user's attendance for one day. */
export interface IAttendanceDay {
  /**
   * The office day, as the instant it begins (00:00 office time) in Unix milliseconds like every
   * other date in the API, e.g. `1793997000000` (2026-11-06T20:30:00.000Z) for 7 Nov in Tehran.
   */
  dayKey: number;
  /** Set by the face-recognition gate only (Unix ms). */
  checkedInAt: number | null;
  /** Self-declared mode for the day; cleared by a check-in. */
  workMode: TDeclarableWorkMode | null;
  reward: ICheckInReward | null;
}

/**
 * Attendance API contract. Check-ins are created by the gate's
 * face-recognition system on the server — the app can only read them and
 * declare a remote / leave day (rejected with 409 once checked in).
 */
export interface IAttendanceService {
  /** `GET /attendance/today` */
  getToday(): Promise<IAttendanceDay>;
  /** `PUT /attendance/today/work-mode` — `null` clears the declaration. */
  setWorkMode(workMode: TDeclarableWorkMode | null): Promise<IAttendanceDay>;
}
