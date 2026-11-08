import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storeKeys, walletKeys } from '@/lib/query';
import { IPurchasePayload, storeService } from '@/services';

/** Store catalogue (stock changes as colleagues buy). */
export const useProducts = () =>
  useQuery({
    queryKey: storeKeys.products(),
    queryFn: () => storeService.getProducts(),
    refetchOnWindowFocus: true,
  });

/** The user's orders, newest first. */
export const useOrders = () =>
  useQuery({
    queryKey: storeKeys.orders(),
    queryFn: () => storeService.getOrders(),
  });

/**
 * Buys a product. Not optimistic on purpose: money-like operations show the
 * server's verdict, never a guess. Stock, orders and the wallet are
 * refreshed afterwards — also on failure, since a 409 means our copy of
 * stock or balance was stale.
 */
export const usePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IPurchasePayload) => storeService.purchase(payload),
    // Not awaited: the caller closes its sheet at once instead of showing
    // the refreshed balance inside the closing sheet.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};
