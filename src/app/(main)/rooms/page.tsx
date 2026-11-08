import type { Metadata } from 'next';
import { RoomsView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.rooms.title,
};

/** Meeting rooms (`/rooms`). */
export default function RoomsPage() {
  return <RoomsView />;
}
