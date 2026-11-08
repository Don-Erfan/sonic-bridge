'use client';
import React, { FC } from 'react';
import Link from 'next/link';
import { uiText } from '@/config';
import { useProfile, useUnreadAnnouncements } from '@/hooks';
import { Icon } from '@/icons';
import { Avatar, Skeleton } from '../../base';
import { ThemeToggle } from '../../theme-toggle';
import { Brand } from '../brand';
import { CoinBalance } from '../coin-balance';
import { IAppHeaderProps } from './interface';

/**
 * Sticky top bar: the logo at the start edge (the side rail shows it on
 * desktop), then coin balance, theme toggle, announcements (with a dot when
 * there are unread ones) and the profile avatar. Pads itself below the
 * status bar of an installed PWA.
 *
 * @example
 * <AppHeader />
 */
export const AppHeader: FC<IAppHeaderProps> = ({ 'aria-label': ariaLabel }) => {
  const { data: profile } = useProfile();
  const { hasUnread } = useUnreadAnnouncements();

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
            href="/announcements"
            aria-label={
              hasUnread
                ? uiText.header.announcementsUnread
                : uiText.header.announcements
            }
            className="relative flex size-9 items-center justify-center rounded-full border border-neu-outline bg-neu text-fg-secondary shadow-neu-sm transition-[box-shadow,color] duration-200 outline-none hover:text-accent-fg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neu active:shadow-neu-pressed"
          >
            <Icon name="bell" size={18} />
            {hasUnread && (
              <span
                aria-hidden
                className="absolute end-0.5 top-0.5 size-2.5 rounded-full bg-danger-500 ring-2 ring-neu"
              />
            )}
          </Link>
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
