import type { IMood } from '../mood';

/** Outcome of pushing a status to one external tool. */
export interface ISyncReport {
  targetId: string;
  ok: boolean;
  /** Human-readable reason when `ok` is false. */
  message?: string;
}

/**
 * Something the user's mood is mirrored to (Mattermost today). Leaves and
 * groups share this interface (Composite), so callers sync "everything"
 * without knowing how many tools are configured. Implementations never
 * reject: failures come back as reports, so one broken integration cannot
 * hide the others' results.
 */
export interface IStatusSyncTarget {
  readonly id: string;
  /** Mirrors `mood`; `null` clears the status. */
  sync(mood: IMood | null): Promise<ISyncReport[]>;
}
