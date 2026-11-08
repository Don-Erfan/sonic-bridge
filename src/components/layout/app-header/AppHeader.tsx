'use client';
import React, { FC } from 'react';
import Link from 'next/link';
import { uiText } from '@/config';
import { useProfile } from '@/hooks';
import { Avatar, Skeleton } from '../../base';
import { ThemeToggle } from '../../theme-toggle';
import { Brand } from '../brand';
import { CoinBalance } from '../coin-balance';
import { IAppHeaderProps } from './interface';

/**
 * Sticky top bar: the logo at the start edge (the side rail shows it on
 * desktop), then coin balance, theme toggle and the profile avatar. Pads
 * itself below the status bar of an installed PWA.
 *
 * @example
 * <AppHeader />
 */
export const AppHeader: FC<IAppHeaderProps> = ({ 'aria-label': ariaLabel }) => {
  const { data: profile } = useProfile();

  return (
    <header
      aria-label={ariaLabel}
      className="sticky top-0 z-30 bg-neu/85 pt-[env(safe-area-inset-top)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4">
        <div className="lg:invisible">
          <Brand size={30} />
        </div>
        <div className="flex items-center gap-2.5">
          <CoinBalance />
          <ThemeToggle />
          <Link
            href="/profile"
            aria-label={uiText.header.openProfile}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {profile ? (
              <Avatar
                name={profile.fullName}
                src={profile.avatarUrl}
                size="sm"
              />
            ) : (
              <Skeleton className="size-9 rounded-full" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

AppHeader.displayName = `AppHeader`;

export default AppHeader;
