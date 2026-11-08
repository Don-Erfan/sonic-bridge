import { PropsWithChildren } from 'react';
import { AppShell } from '@/components';

/** Signed-in pages share the app shell (header, tab bar / side rail). */
export default function MainLayout({ children }: PropsWithChildren) {
  return <AppShell>{children}</AppShell>;
}
