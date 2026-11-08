'use client';
import React, { FC, ReactNode } from 'react';
import { uiText } from '@/config';
import {
  formatLongDate,
  formatNumber,
  formatReceiptNumber,
  formatTime,
} from '@/lib/utils';
import type { TOrderStatus } from '@/services';
import type { TTone } from '@/lib/tone';
import { Badge, CoinAmount } from '../../base';
import { IOrderReceiptProps } from './interface';

const STATUS_TONE: Record<TOrderStatus, TTone> = {
  pending: `warning`,
  fulfilled: `success`,
  cancelled: `neutral`,
};

const Row: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="typo-b2 text-fg-secondary">{label}</dt>
    <dd className="min-w-0 text-end typo-s2 text-fg-primary">{children}</dd>
  </div>
);

/**
 * The receipt of one order: the receipt number large enough to read out or
 * show across a desk, what was bought, by whom, when, and its status.
 *
 * @example
 * <OrderReceipt order={order} buyerName={profile.fullName} />
 */
export const OrderReceipt: FC<IOrderReceiptProps> = ({ order, buyerName }) => {
  const t = uiText.store.receipt;
  const isCancelled = order.status === `cancelled`;

  return (
    <article
      aria-label={t.title}
      className="flex flex-col gap-4 rounded-24 px-5 py-5 shadow-neu-inset"
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <span aria-hidden className="text-5xl leading-none">
          {order.emoji}
        </span>
        <p className="mt-2 typo-c1 text-fg-tertiary">{t.number}</p>
        <p
          className={`typo-h1 tracking-widest tabular-nums ${
            isCancelled ? `text-fg-tertiary line-through` : `text-fg-primary`
          }`}
          dir="ltr"
        >
          {formatReceiptNumber(order.receiptNumber)}
        </p>
        <Badge tone={STATUS_TONE[order.status]}>
          {uiText.wallet.orderStatus[order.status]}
        </Badge>
      </div>

      <hr className="border-dashed border-default-300/60" />

      <dl className="flex flex-col gap-2.5">
        {buyerName && <Row label={t.buyer}>{buyerName}</Row>}
        <Row label={t.product}>
          <span className="break-words">{order.productName}</span>
        </Row>
        <Row label={t.quantity}>{formatNumber(order.quantity)}</Row>
        <Row label={t.unitPrice}>
          <CoinAmount amount={order.unitPrice} size="sm" isCompact={false} />
        </Row>
        <Row label={t.total}>
          <CoinAmount amount={order.total} size="md" isCompact={false} />
        </Row>
        <Row label={t.date}>
          {formatLongDate(order.createdAt)} · {formatTime(order.createdAt)}
        </Row>
      </dl>

      <output className="block rounded-16 px-3 py-2.5 text-center typo-b2 text-fg-secondary shadow-neu-inset-sm">
        {t.hint[order.status]}
      </output>
    </article>
  );
};

OrderReceipt.displayName = `OrderReceipt`;

export default OrderReceipt;
