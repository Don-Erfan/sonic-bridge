'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useNow } from '@/hooks';
import { formatDateTime, formatNumber, formatReceiptNumber } from '@/lib/utils';
import type { TOrderStatus } from '@/services';
import { Icon } from '@/icons';
import { Badge, CoinAmount } from '../../base';
import { ReceiptSheet } from '../../store/order-receipt';
import { IOrderListProps } from './interface';

const STATUS_TONE: Record<TOrderStatus, `warning` | `success` | `neutral`> = {
  pending: `warning`,
  fulfilled: `success`,
  cancelled: `neutral`,
};

/**
 * Store orders with their delivery status. Tapping one opens its receipt,
 * to show when collecting it.
 *
 * @example
 * <OrderList orders={orders} />
 */
export const OrderList: FC<IOrderListProps> = ({ orders }) => {
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);
  const [isOpen, setOpen] = useState(false);
  // Looked up in the live list, so a status change (handed over) shows.
  const opened = orders.find((order) => order.id === openId) ?? null;

  return (
    <>
      <ul className="divide-y divide-default-300/60">
        {orders.map((order) => (
          <li key={order.id}>
            <button
              type="button"
              aria-label={fillTemplate(uiText.store.receipt.view, {
                product: order.productName,
              })}
              onClick={() => {
                setOpenId(order.id);
                setOpen(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            >
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-16 text-2xl shadow-neu-inset-sm"
              >
                {order.emoji}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate typo-s1 text-fg-primary">
                  {order.productName}
                  {order.quantity > 1 && ` × ${formatNumber(order.quantity)}`}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={STATUS_TONE[order.status]}>
                    {uiText.wallet.orderStatus[order.status]}
                  </Badge>
                  <span className="typo-c1 text-fg-tertiary">
                    {formatDateTime(order.createdAt, now)}
                  </span>
                  <span className="typo-c1 text-fg-tertiary">
                    {fillTemplate(uiText.admin.orders.receipt, {
                      number: formatReceiptNumber(order.receiptNumber),
                    })}
                  </span>
                </div>
              </div>
              <CoinAmount amount={order.total} size="sm" />
              <Icon
                name="chevron-right"
                size={18}
                className="shrink-0 text-fg-tertiary rtl:-scale-x-100"
              />
            </button>
          </li>
        ))}
      </ul>
      <ReceiptSheet order={opened} isOpen={isOpen} onOpenChange={setOpen} />
    </>
  );
};

OrderList.displayName = `OrderList`;

export default OrderList;
