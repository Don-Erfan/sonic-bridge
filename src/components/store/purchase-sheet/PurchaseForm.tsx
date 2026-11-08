'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { usePurchase } from '@/hooks';
import { getMaxPurchasableQuantity, purchaseValidator } from '@/lib/coins';
import { formatNumber } from '@/lib/utils';
import { getErrorCode, IOrder, IProduct } from '@/services';
import { Button, CoinAmount, notify, QuantityStepper } from '../../base';
import { ProductVisual } from '../product-visual';
import {
  describePurchaseFailure,
  isPurchaseFailure,
  toPurchaseBase,
  toPurchaseContext,
} from '../purchase-rules';

interface IPurchaseFormProps {
  product: IProduct;
  balance: number;
  /** Called with the placed order, to show its receipt. */
  onPurchased: (order: IOrder) => void;
}

/**
 * Quantity, totals and confirmation. The stepper's maximum is the largest
 * quantity the purchase rules allow, so an invalid order cannot be composed;
 * the server re-validates and its rejection code is mapped to a sentence.
 */
export const PurchaseForm: FC<IPurchaseFormProps> = ({
  product,
  balance,
  onPurchased,
}) => {
  const purchase = usePurchase();
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = getMaxPurchasableQuantity(
    toPurchaseBase(product, balance),
  );
  const context = toPurchaseContext(product, balance, quantity);
  const failure = purchaseValidator.validate(context);
  const total = product.price * quantity;

  const handleConfirm = async () => {
    try {
      const { order } = await purchase.mutateAsync({
        productId: product.id,
        quantity,
      });
      notify.success(uiText.store.purchased);
      onPurchased(order);
    } catch (error) {
      const code = getErrorCode(error);
      if (isPurchaseFailure(code)) {
        notify.danger(uiText.errors.title, {
          description: uiText.store.failures[code],
        });
      } else {
        notify.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <ProductVisual
          imageUrl={product.imageUrl}
          emoji={product.emoji}
          className="size-20 shrink-0 rounded-24 shadow-neu-inset"
        />
        <div className="flex flex-col gap-1.5">
          <p className="typo-b1 text-fg-secondary">{product.description}</p>
          {product.perUserLimit !== null && (
            <p className="typo-c1 text-fg-tertiary">
              {fillTemplate(uiText.store.limit, {
                count: formatNumber(product.perUserLimit),
              })}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="typo-s1 text-fg-secondary">
          {uiText.store.quantity}
        </span>
        <QuantityStepper
          aria-label={uiText.store.quantity}
          value={quantity}
          max={Math.max(1, maxQuantity)}
          onChange={setQuantity}
          isDisabled={maxQuantity === 0 || purchase.isPending}
        />
      </div>

      <dl className="flex flex-col gap-3 rounded-20 px-4 py-3.5 shadow-neu-inset">
        <div className="flex items-center justify-between">
          <dt className="typo-b1 text-fg-secondary">{uiText.store.total}</dt>
          <dd>
            <CoinAmount amount={total} size="md" isCompact={false} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="typo-b1 text-fg-secondary">
            {uiText.store.balanceAfter}
          </dt>
          <dd>
            <CoinAmount
              amount={Math.max(0, balance - total)}
              size="md"
              isCompact={false}
            />
          </dd>
        </div>
      </dl>

      {failure && (
        <p role="alert" className="typo-b2 text-danger-600">
          {describePurchaseFailure(failure, context)}
        </p>
      )}

      <div className="pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="primary"
          size="lg"
          startIcon="bag"
          isFullWidth
          isDisabled={failure !== null}
          isLoading={purchase.isPending}
          onPress={handleConfirm}
        >
          {fillTemplate(uiText.store.confirmPurchase, {
            amount: formatNumber(total),
          })}
        </Button>
      </div>
    </div>
  );
};

PurchaseForm.displayName = `PurchaseForm`;
