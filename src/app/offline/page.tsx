import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/icons';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.offline.title,
};

/**
 * Offline fallback, precached by the service worker and served for any
 * navigation that fails while the device has no connection. Static: it
 * must render without data.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-neu px-6 text-center">
      <span className="flex size-24 items-center justify-center rounded-full shadow-neu-inset">
        <LogoMark size={52} />
      </span>
      <h1 className="typo-h1 text-fg-primary">{uiText.offline.title}</h1>
      <p className="max-w-xs typo-b1 text-fg-secondary">
        {uiText.offline.message}
      </p>
      <Link
        href="/"
        className="rounded-16 bg-neu px-6 py-3 typo-s1 text-accent-fg shadow-neu-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:shadow-neu-pressed"
      >
        {uiText.retry}
      </Link>
    </main>
  );
}
