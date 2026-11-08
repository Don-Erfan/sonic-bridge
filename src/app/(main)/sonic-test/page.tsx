import type { Metadata } from 'next';
import { SonicTestView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.sonicTest.title,
};

/** Data-over-sound test bench (`/sonic-test`). */
export default function SonicTestPage() {
  return <SonicTestView />;
}
