import type { Metadata } from 'next';
import { EventsView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.events.title,
};

/** Company events (`/events`). */
export default function EventsPage() {
  return <EventsView />;
}
