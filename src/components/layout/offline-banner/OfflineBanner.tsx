'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { useOnlineStatus } from '@/hooks';
import { Icon } from '@/icons';
import { IOfflineBannerProps } from './interface';

/**
 * Inline notice while the device is offline: cached data is still shown,
 * but it may be stale. Announced politely when it appears.
 *
 * @example
 * <OfflineBanner />
 */
export const OfflineBanner: FC<IOfflineBannerProps> = ({
  message = uiText.offline.banner,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <output className="mx-auto block w-full max-w-3xl px-4">
      {!isOnline && (
        <p className="mt-2 flex items-center gap-2 rounded-16 bg-tone-warning px-4 py-2.5 typo-b2 text-tone-warning-fg">
          <Icon name="wifi-off" size={18} />
          {message}
        </p>
      )}
    </output>
  );
};

OfflineBanner.displayName = `OfflineBanner`;

export default OfflineBanner;
