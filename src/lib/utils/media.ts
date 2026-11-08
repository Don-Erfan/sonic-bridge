import { env } from '@/config/env';

/** Image types the API accepts for avatars and product pictures. */
export const ACCEPTED_IMAGE_TYPES = [
  `image/jpeg`,
  `image/png`,
  `image/webp`,
] as const;

/** The API's upload limit (5 MiB). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Why a picked file cannot be uploaded, or `null` when it can. */
export type TImageProblem = `type` | `size` | null;

/**
 * Client-side pre-check of an image before upload, so the user hears at once
 * instead of after a round trip. The API checks again (by content, not by
 * the declared type), so this is a courtesy, not the guard.
 */
export const checkImageFile = (file: File): TImageProblem => {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type))
    return `type`;
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return `size`;
  return null;
};

/**
 * Absolute URL of an image the API stored (`/api/v1/media/…`). The API
 * returns paths relative to its own origin, which differs from the app's,
 * so they are resolved against `NEXT_PUBLIC_BASE_API`. Absolute URLs pass
 * through; `null`/empty stay `null`.
 */
export const resolveMediaUrl = (
  url: string | null | undefined,
): string | null => {
  if (!url) return null;
  if (!url.startsWith(`/`) || url.startsWith(`//`)) return url;
  try {
    return new URL(url, env.baseApi).toString();
  } catch {
    return url;
  }
};
