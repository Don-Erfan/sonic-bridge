import { NextRequest, NextResponse } from 'next/server';
import { sessionCookies } from '@/config';
import {
  MattermostClient,
  MattermostError,
  MattermostStatusBuilder,
} from '@/lib/mattermost';
import {
  isAvailability,
  isMoodKey,
  MOOD_NOTE_MAX_LENGTH,
  moodRegistry,
} from '@/lib/mood';
import { countCharacters } from '@/lib/utils';

/**
 * `PUT | DELETE /api/mattermost/status` — mirrors the signed-in user's mood
 * to Mattermost (Protection Proxy).
 *
 * - The Mattermost token (`MATTERMOST_TOKEN`) never leaves the server.
 * - The browser never says *whose* status to change: the user is resolved
 *   from their session by asking the staff API (`GET /profile`) with the
 *   session's own bearer token, and only their linked Mattermost id is used.
 * - Requests must be JSON (forces a CORS preflight cross-site) and carry the
 *   SameSite=Lax session cookie, which browsers do not send on cross-site
 *   PUT/DELETE — together a CSRF guard.
 *
 * Responses use the staff API envelope `{ code, data, detail }`.
 */

interface IEnvelope<T> {
  code: string;
  data: T;
  detail: string;
}

const reply = <T>(status: number, code: string, data: T, detail = ``) =>
  NextResponse.json<IEnvelope<T>>({ code, data, detail }, { status });

const fail = (status: number, code: string, detail: string) =>
  reply(status, code, null, detail);

/** Staff API base URL (same variable the browser client uses). */
const apiBase = (): string =>
  (process.env.NEXT_PUBLIC_BASE_API ?? ``).replace(/\/+$/, ``);

const PROFILE_TIMEOUT_MS = 8_000;

type TResolved =
  | { ok: true; client: MattermostClient; mattermostUserId: string }
  | { ok: false; response: NextResponse };

/** Configuration + session + linked account, or the reason it is missing. */
const resolveContext = async (request: NextRequest): Promise<TResolved> => {
  const mattermostUrl = process.env.MATTERMOST_URL;
  const mattermostToken = process.env.MATTERMOST_TOKEN;
  if (!mattermostUrl || !mattermostToken || !apiBase()) {
    return {
      ok: false,
      response: fail(
        503,
        `mattermost_not_configured`,
        `Mattermost sync is not configured.`,
      ),
    };
  }

  const sessionToken = request.cookies.get(sessionCookies.token)?.value;
  if (!sessionToken) {
    return { ok: false, response: fail(401, `unauthorized`, `Not signed in.`) };
  }

  let profileResponse: Response;
  try {
    profileResponse = await fetch(`${apiBase()}/profile`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        Accept: `application/json`,
      },
      cache: `no-store`,
      signal: AbortSignal.timeout(PROFILE_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      response: fail(
        502,
        `profile_unreachable`,
        `Profile service unreachable.`,
      ),
    };
  }
  if (profileResponse.status === 401 || profileResponse.status === 403) {
    return {
      ok: false,
      response: fail(401, `unauthorized`, `Session expired.`),
    };
  }
  if (!profileResponse.ok) {
    return {
      ok: false,
      response: fail(502, `profile_failed`, `Could not read the profile.`),
    };
  }

  const envelope = (await profileResponse
    .json()
    .catch(() => null)) as IEnvelope<{
    mattermost: { userId: string } | null;
  }> | null;
  const mattermostUserId = envelope?.data?.mattermost?.userId;
  if (!mattermostUserId) {
    return {
      ok: false,
      response: fail(
        409,
        `mattermost_not_linked`,
        `No Mattermost account is linked.`,
      ),
    };
  }

  return {
    ok: true,
    client: new MattermostClient(mattermostUrl, mattermostToken),
    mattermostUserId,
  };
};

const toUpstreamFailure = (error: unknown) =>
  error instanceof MattermostError
    ? fail(502, `mattermost_error`, error.message)
    : fail(502, `mattermost_unreachable`, `Mattermost is unreachable.`);

/** Sets the custom status (emoji, note, expiry) and the presence. */
export async function PUT(request: NextRequest) {
  if (!request.headers.get(`content-type`)?.includes(`application/json`)) {
    return fail(415, `unsupported_media_type`, `Expected application/json.`);
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const moodKey = body?.moodKey;
  const note = typeof body?.note === `string` ? body.note.trim() : null;
  const availability = body?.availability;
  const expiresAtRaw = body?.expiresAt;
  // Unix milliseconds, like every instant in the app; `null` = never expires.
  const expiresAt =
    typeof expiresAtRaw === `number` && Number.isSafeInteger(expiresAtRaw)
      ? new Date(expiresAtRaw)
      : expiresAtRaw === null
        ? null
        : undefined;

  const isValid =
    isMoodKey(moodKey) &&
    note !== null &&
    countCharacters(note) <= MOOD_NOTE_MAX_LENGTH &&
    isAvailability(availability) &&
    expiresAt !== undefined &&
    (expiresAt === null ||
      (!Number.isNaN(expiresAt.getTime()) && expiresAt > new Date()));
  if (!isValid) {
    return fail(422, `invalid_status`, `Invalid status payload.`);
  }

  const context = await resolveContext(request);
  if (!context.ok) return context.response;

  const plan = new MattermostStatusBuilder()
    .forUser(context.mattermostUserId)
    .withEmoji(moodRegistry[moodKey].mattermostEmoji)
    .withText(note)
    .withAvailability(availability)
    .expiringAt(expiresAt)
    .build();

  try {
    await context.client.setCustomStatus(plan.userId, plan.customStatus);
    await context.client.setStatus(plan.status);
  } catch (error) {
    return toUpstreamFailure(error);
  }
  return reply(200, `ok`, { syncedAt: Date.now() });
}

/** Clears the custom status and sets the presence back to online. */
export async function DELETE(request: NextRequest) {
  const context = await resolveContext(request);
  if (!context.ok) return context.response;

  try {
    await context.client.clearCustomStatus(context.mattermostUserId);
    await context.client.setStatus({
      user_id: context.mattermostUserId,
      status: `online`,
    });
  } catch (error) {
    return toUpstreamFailure(error);
  }
  return reply(200, `ok`, { syncedAt: Date.now() });
}
