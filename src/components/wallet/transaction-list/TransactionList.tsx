'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import { uiText } from '@/config';
import { useNow } from '@/hooks';
import { Icon, TIconName } from '@/icons';
import type { TTransactionType } from '@/lib/coins';
import { formatDateTime } from '@/lib/utils';
import { CoinAmount } from '../../base';
import { ITransactionListProps } from './interface';

const TYPE_ICON: Record<TTransactionType, TIconName> = {
  'check-in-reward': `scan-face`,
  purchase: `bag`,
  refund: `refresh`,
  adjustment: `gift`,
};

/**
 * Ledger rows: what happened, when, and the signed amount (credits in
 * green, debits in red — and always with a sign, never colour alone).
 *
 * @example
 * <TransactionList transactions={transactions} />
 */
export const TransactionList: FC<ITransactionListProps> = ({
  transactions,
}) => {
  const now = useNow();

  return (
    <ul className="divide-y divide-default-300/60">
      {transactions.map((transaction) => (
        <li
          key={transaction.id}
          className="flex items-center gap-3 px-4 py-3.5"
        >
          <span
            aria-hidden
            className={clsx(
              `flex size-10 shrink-0 items-center justify-center rounded-full shadow-neu-inset-sm`,
              transaction.amount >= 0 ? `text-teal-600` : `text-danger-500`,
            )}
          >
            <Icon name={TYPE_ICON[transaction.type]} size={18} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate typo-s1 text-fg-primary">
              {transaction.description ?? uiText.wallet.types[transaction.type]}
            </p>
            <p className="typo-c1 text-fg-tertiary">
              {transaction.description &&
                `${uiText.wallet.types[transaction.type]} · `}
              {formatDateTime(transaction.createdAt, now)}
            </p>
          </div>
          <CoinAmount amount={transaction.amount} size="sm" isSigned />
        </li>
      ))}
    </ul>
  );
};

TransactionList.displayName = `TransactionList`;

export default TransactionList;
