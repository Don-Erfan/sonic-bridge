'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { useProfile } from '@/hooks';
import { Button, Sheet } from '../../base';
import { IReceiptSheetProps } from './interface';
import { OrderReceipt } from './OrderReceipt';

/**
 * Bottom sheet with an order's receipt, to show when collecting it.
 *
 * @example
 * <ReceiptSheet order={order} isOpen={isOpen} onOpenChange={setOpen} />
 */
export const ReceiptSheet: FC<IReceiptSheetProps> = ({
  order,
  isOpen,
  onOpenChange,
}) => {
  const { data: profile } = useProfile();

  return (
    <Sheet
      title={uiText.store.receipt.title}
      isOpen={isOpen && order !== null}
      onOpenChange={onOpenChange}
    >
      {order && (
        <div className="flex flex-col gap-5 pb-[env(safe-area-inset-bottom)]">
          <OrderReceipt order={order} buyerName={profile?.fullName} />
          <Button
            variant="secondary"
            size="lg"
            isFullWidth
            onPress={() => onOpenChange(false)}
          >
            {uiText.store.receipt.close}
          </Button>
        </div>
      )}
    </Sheet>
  );
};

ReceiptSheet.displayName = `ReceiptSheet`;

export default ReceiptSheet;
