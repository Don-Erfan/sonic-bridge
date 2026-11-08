import type { TTone } from '../tone';

/**
 * Where a colleague is today.
 *
 * - `in-office` is set **only** by the face-recognition gate — it cannot be
 *   self-declared, which keeps the daily coin reward honest.
 * - `remote` / `on-leave` are declared by the person for the current day.
 * - `out` is everyone else (not checked in, nothing declared).
 */
export type TPresenceStatus = `in-office` | `remote` | `on-leave` | `out`;

/** Work mode a person may declare themselves (never `in-office`). */
export type TDeclarableWorkMode = Extract<
  TPresenceStatus,
  `remote` | `on-leave`
>;

/** Intrinsic description of a presence status (Flyweight registry). */
export interface IPresenceDefinition {
  status: TPresenceStatus;
  tone: TTone;
  /** Sort rank in the team list: lower comes first. */
  rank: number;
}

/** Team-list filters (Strategy keys). */
export type TPresenceFilter = `all` | `in-office` | `not-in-office`;

/** Minimal shape the presence helpers need. */
export interface IPresenceSubject {
  presence: TPresenceStatus;
  fullName: string;
  jobTitle: string;
  team: string;
}
