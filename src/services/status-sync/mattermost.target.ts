import { uiText } from '@/config';
import type { IMattermostSyncRequest } from '@/lib/mattermost';
import { getErrorCode, getErrorMessage } from '../common';
import { AbstractAPI } from '../interceptor';
import type { IMood } from '../mood/interface';
import { internalApiClient } from './internal-client';
import { ISyncReport, IStatusSyncTarget } from './interface';

export const MATTERMOST_TARGET_ID = `mattermost`;

/** Route-handler codes meaning "Mattermost does not apply here". */
const NOT_APPLICABLE_CODES: ReadonlySet<string> = new Set([
  `mattermost_not_configured`,
  `mattermost_not_linked`,
]);

/**
 * Mirrors the mood to Mattermost through `/api/mattermost/status` — a route
 * handler that holds the Mattermost token server-side and resolves *who* the
 * user is from their session (the browser never names a Mattermost user).
 */
export class MattermostSyncTarget
  extends AbstractAPI
  implements IStatusSyncTarget
{
  public readonly id = MATTERMOST_TARGET_ID;

  constructor() {
    super(`mattermost`, internalApiClient);
  }

  async sync(mood: IMood | null): Promise<ISyncReport[]> {
    try {
      if (mood) {
        await this.put<unknown, IMattermostSyncRequest>(`status`, {
          moodKey: mood.key,
          note: mood.note,
          availability: mood.availability,
          expiresAt: mood.expiresAt,
        });
      } else {
        await this.delete(`status`);
      }
      return [{ targetId: this.id, ok: true }];
    } catch (error) {
      // Not an outage: this deployment has no Mattermost, or the user has no
      // linked account. There is nothing to sync, so nothing to report.
      if (NOT_APPLICABLE_CODES.has(getErrorCode(error) ?? ``)) return [];
      return [
        {
          targetId: this.id,
          ok: false,
          message: getErrorMessage(error, uiText.mood.syncFailed),
        },
      ];
    }
  }
}
