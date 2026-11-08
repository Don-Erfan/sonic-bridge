import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WalletView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.wallet.title,
};

/** Coin wallet (`/wallet`). Suspense: the view reads the URL's query. */
export default function WalletPage() {
  return (
    <Suspense>
      <WalletView />
    </Suspense>
  );
}
