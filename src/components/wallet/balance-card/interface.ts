import type { TWalletSummary } from '@/services';

export interface IBalanceCardProps {
  /** `undefined` while loading. */
  summary: TWalletSummary | undefined;
}
