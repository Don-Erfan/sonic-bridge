import type { Metadata } from 'next';
import { TeamView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.team.title,
};

/** Team presence (`/team`). */
export default function TeamPage() {
  return <TeamView />;
}
