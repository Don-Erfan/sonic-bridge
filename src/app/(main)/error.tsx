'use client';
import { useEffect } from 'react';
import { ErrorState } from '@/components';
import { uiText } from '@/config';

/**
 * Error boundary of the signed-in pages: keeps the shell (navigation still
 * works) and offers to re-render the failed page.
 */
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState message={uiText.errors.pageCrashed} onRetry={reset} />;
}
