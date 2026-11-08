import { IMattermostCustomStatus, IMattermostStatusUpdate } from './interface';

/** A non-2xx answer from Mattermost. */
export class MattermostError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = `MattermostError`;
  }
}

/** Abort a Mattermost call that hangs longer than this. */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Minimal Mattermost API v4 client (Adapter over `fetch`) for the status
 * endpoints. **Server-side only**: it is constructed with a privileged
 * token, so it must only ever be instantiated inside a route handler.
 */
export class MattermostClient {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly token: string,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, ``);
  }

  /** `PUT /api/v4/users/{user_id}/status/custom` */
  setCustomStatus(
    userId: string,
    customStatus: IMattermostCustomStatus,
  ): Promise<void> {
    return this.request(`${this.userPath(userId)}/status/custom`, {
      method: `PUT`,
      body: JSON.stringify(customStatus),
    });
  }

  /** `DELETE /api/v4/users/{user_id}/status/custom` */
  clearCustomStatus(userId: string): Promise<void> {
    return this.request(`${this.userPath(userId)}/status/custom`, {
      method: `DELETE`,
    });
  }

  /** `PUT /api/v4/users/{user_id}/status` */
  setStatus(update: IMattermostStatusUpdate): Promise<void> {
    return this.request(`${this.userPath(update.user_id)}/status`, {
      method: `PUT`,
      body: JSON.stringify(update),
    });
  }

  private userPath(userId: string): string {
    return `/api/v4/users/${encodeURIComponent(userId)}`;
  }

  private async request(path: string, init: RequestInit): Promise<void> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': `application/json`,
        'X-Requested-With': `XMLHttpRequest`,
      },
      cache: `no-store`,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response
        .json()
        .then((body: { message?: unknown }) =>
          typeof body.message === `string` ? body.message : ``,
        )
        .catch(() => ``);
      throw new MattermostError(
        response.status,
        detail || `Mattermost answered ${response.status}`,
      );
    }
  }
}
