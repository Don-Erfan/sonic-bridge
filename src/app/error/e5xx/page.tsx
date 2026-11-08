import type { Metadata } from 'next';
import Link from 'next/link';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.errors.serverTitle,
};

/**
 * Target of the interceptor's `ErrorMiddleware`, which redirects here when
 * the API answers with a 5xx status or cannot be reached at all (down,
 * restarting, timing out).
 */
export default function ServerErrorPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-neu px-6 text-center">
      <h1 className="typo-h1 text-fg-primary">{uiText.errors.serverTitle}</h1>
      <p className="typo-b1 text-fg-secondary">{uiText.errors.serverMessage}</p>
      <Link
        href="/"
        className="rounded-16 bg-neu px-6 py-3 typo-s1 text-accent-fg shadow-neu-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:shadow-neu-pressed"
      >
        {uiText.errors.backHome}
      </Link>
    </main>
  );
}
