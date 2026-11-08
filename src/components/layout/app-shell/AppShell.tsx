import React, { FC, PropsWithChildren } from 'react';
import { uiText } from '@/config';
import { AppHeader } from '../app-header';
import { BottomNav } from '../bottom-nav';
import { OfflineBanner } from '../offline-banner';
import { SideNav } from '../side-nav';
import { IAppShellProps } from './interface';

/**
 * Page frame of the signed-in app, mobile first: sticky header, content
 * column and a bottom tab bar on phones; a side rail replaces the tab bar
 * from `lg` up. Starts with a skip link for keyboard users.
 *
 * @example
 * <AppShell>{children}</AppShell>
 */
export const AppShell: FC<PropsWithChildren<IAppShellProps>> = ({
  children,
}) => (
  <div className="relative min-h-dvh bg-neu text-fg-primary">
    <a
      href="#main"
      className="sr-only z-50 rounded-16 bg-neu px-4 py-2 shadow-neu focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
    >
      {uiText.skipToContent}
    </a>
    <SideNav />
    <div className="lg:ps-64">
      <AppHeader />
      <OfflineBanner />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-3 pb-safe-nav outline-none lg:pb-12"
      >
        {children}
      </main>
    </div>
    <BottomNav />
  </div>
);

AppShell.displayName = `AppShell`;

export default AppShell;
