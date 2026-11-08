import type { Metadata } from 'next';
import { WalletView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.wallet.title,
};

/** Coin wallet (`/wallet`). */
export default function WalletPage() {
  return <WalletView />;
}
