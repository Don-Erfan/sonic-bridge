'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useProfile } from '@/hooks';
import type { IOrder } from '@/services';
import { Button, Sheet } from '../../base';
import { OrderReceipt } from '../order-receipt';
import { IPurchaseSheetProps } from './interface';
import { PurchaseForm } from './PurchaseForm';

/**
 * Bottom sheet to buy a product with coins. After a successful purchase it
 * shows the order's receipt, which the buyer shows to collect the product.
 *
 * @example
 * <PurchaseSheet product={product} balance={balance} isOpen={isOpen} sessionKey={key} onOpenChange={setOpen} />
 */
export const PurchaseSheet: FC<IPurchaseSheetProps> = ({
  product,
  balance,
  isOpen,
  sessionKey,
  onOpenChange,
}) => {
  const { data: profile } = useProfile();
  // Tagged with the session it belongs to: kept while the sheet animates
  // closed, ignored once the sheet is opened again.
  const [receipt, setReceipt] = useState<{
    sessionKey: number;
    order: IOrder;
  } | null>(null);
  const order = receipt?.sessionKey === sessionKey ? receipt.order : null;

  return (
    <Sheet
      title={
        order
          ? uiText.store.receipt.title
          : product
            ? fillTemplate(uiText.store.purchaseTitle, { name: product.name })
            : ``
      }
      isOpen={isOpen && product !== null}
      onOpenChange={onOpenChange}
    >
      {order ? (
        <div className="flex flex-col gap-5 pb-[env(safe-area-inset-bottom)]">
          <OrderReceipt order={order} buyerName={profile?.fullName} />
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            onPress={() => onOpenChange(false)}
          >
            {uiText.store.receipt.close}
          </Button>
        </div>
      ) : (
        product && (
          <PurchaseForm
            key={sessionKey}
            product={product}
            balance={balance}
            onPurchased={(placed) => setReceipt({ sessionKey, order: placed })}
          />
        )
      )}
    </Sheet>
  );
};

PurchaseSheet.displayName = `PurchaseSheet`;

export default PurchaseSheet;
