import type { Metadata } from 'next';
import Link from 'next/link';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.errors.notFoundTitle,
};

/** 404 for unknown routes. */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-neu px-6 text-center">
      <p aria-hidden className="typo-display text-primary-500">
        ۴۰۴
      </p>
      <h1 className="typo-h2 text-fg-primary">{uiText.errors.notFoundTitle}</h1>
      <p className="typo-b1 text-fg-secondary">
        {uiText.errors.notFoundMessage}
      </p>
      <Link
        href="/"
        className="rounded-16 bg-neu px-6 py-3 typo-s1 text-accent-fg shadow-neu-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:shadow-neu-pressed"
      >
        {uiText.errors.backHome}
      </Link>
    </main>
  );
}
