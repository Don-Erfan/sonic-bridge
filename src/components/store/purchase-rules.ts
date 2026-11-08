import { fillTemplate, uiText } from '@/config';
import { IPurchaseContext, TPurchaseFailure } from '@/lib/coins';
import { formatNumber } from '@/lib/utils';
import type { IProduct } from '@/services';

/** Facts about a product and the buyer, before choosing a quantity. */
export const toPurchaseBase = (
  product: IProduct,
  balance: number,
): Omit<IPurchaseContext, `quantity`> => ({
  isActive: product.isActive,
  unitPrice: product.price,
  stock: product.stock,
  perUserLimit: product.perUserLimit,
  alreadyPurchased: product.purchasedByMe,
  balance,
});

/** Purchase context of `quantity` units of a product. */
export const toPurchaseContext = (
  product: IProduct,
  balance: number,
  quantity = 1,
): IPurchaseContext => ({ ...toPurchaseBase(product, balance), quantity });

const FAILURES = Object.keys(uiText.store.failures) as TPurchaseFailure[];

export const isPurchaseFailure = (code: unknown): code is TPurchaseFailure =>
  FAILURES.includes(code as TPurchaseFailure);

/** Sentence explaining why a purchase is not possible. */
export const describePurchaseFailure = (
  failure: TPurchaseFailure,
  context: IPurchaseContext,
): string =>
  failure === `insufficient-balance`
    ? fillTemplate(uiText.store.needMore, {
        amount: formatNumber(
          context.unitPrice * context.quantity - context.balance,
        ),
      })
    : uiText.store.failures[failure];
