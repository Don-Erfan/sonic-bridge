import type { Metadata } from 'next';
import { AnnouncementsView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.announcements.title,
};

/** Announcements to all staff (`/announcements`). */
export default function AnnouncementsPage() {
  return <AnnouncementsView />;
}
