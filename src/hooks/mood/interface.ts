import type { IMood, ISyncReport, IUpdateMoodPayload } from '@/services';

/** What the mood sheet submits. */
export interface IMoodSubmission extends IUpdateMoodPayload {
  /** Mirror the status to Mattermost (and any other sync target). */
  shouldSync: boolean;
}

/** Saved mood plus one report per external tool it was mirrored to. */
export interface IMoodSaveResult {
  mood: IMood | null;
  reports: ISyncReport[];
}
