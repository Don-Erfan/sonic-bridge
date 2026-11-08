import type { Metadata } from 'next';
import { LoginView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.auth.submit,
};

/**
 * Only same-origin paths are accepted as a post-login destination, so the
 * `next` parameter cannot be abused as an open redirect (`//evil.com`,
 * `/\evil.com`, `https://…`).
 */
const toSafeRedirect = (value: string | string[] | undefined): string => {
  const path = Array.isArray(value) ? value[0] : value;
  return path && /^\/(?![/\\])/.test(path) ? path : `/`;
};

/** Sign-in (`/login`). */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return <LoginView redirectTo={toSafeRedirect(next)} />;
}
