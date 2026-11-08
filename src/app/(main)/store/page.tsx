import type { Metadata } from 'next';
import { StoreView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.store.title,
};

/** Coin store (`/store`). */
export default function StorePage() {
  return <StoreView />;
}
