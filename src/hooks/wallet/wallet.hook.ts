import { useQuery } from '@tanstack/react-query';
import { walletKeys } from '@/lib/query';
import { walletService } from '@/services';

/** Balance and totals. */
export const useWalletSummary = () =>
  useQuery({
    queryKey: walletKeys.summary(),
    queryFn: () => walletService.getSummary(),
    refetchOnWindowFocus: true,
  });

/** Ledger, newest first. */
export const useTransactions = () =>
  useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: () => walletService.getTransactions(),
  });
