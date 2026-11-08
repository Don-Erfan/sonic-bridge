'use client';
import { FC } from 'react';
import { usePushSync } from '@/hooks';

/**
 * Keeps this browser's push subscription in step with who is signed in and
 * refreshes order / wallet data when a notification arrives (see
 * `usePushSync`). Renders nothing; mounted once by `AppShell`.
 */
export const PushSync: FC = () => {
  usePushSync();
  return null;
};

PushSync.displayName = `PushSync`;

export default PushSync;
