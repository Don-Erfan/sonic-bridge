import type { Metadata } from 'next';
import { ProfileView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.profile.title,
};

/** Profile and settings (`/profile`). */
export default function ProfilePage() {
  return <ProfileView />;
}
