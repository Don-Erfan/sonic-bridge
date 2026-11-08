'use client';
import React, { FC, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { uiText } from '@/config';
import { useOrders, useTransactions, useWalletSummary } from '@/hooks';
import {
  EmptyState,
  ErrorState,
  ISegmentedOption,
  SegmentedControl,
  Skeleton,
  Surface,
} from '../../base';
import { PageHeader } from '../../layout';
import { BalanceCard } from '../balance-card';
import { OrderList } from '../order-list';
import { TransactionList } from '../transaction-list';

type TWalletTab = `history` | `orders`;

const TABS: readonly ISegmentedOption<TWalletTab>[] = [
  { value: `history`, label: uiText.wallet.history, icon: `receipt` },
  { value: `orders`, label: uiText.wallet.orders, icon: `bag` },
];

const ListSkeleton = () => (
  <ul aria-busy className="divide-y divide-default-300/60">
    {Array.from({ length: 5 }, (_, index) => (
      <li key={index} className="flex items-center gap-3 px-4 py-3.5">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-12 rounded-full" />
      </li>
    ))}
  </ul>
);

/**
 * Coin wallet (`/wallet`): balance, ledger and store orders.
 * `?tab=orders&order=<id>` (an order notification's link) opens the orders
 * tab with that order's receipt.
 */
export const WalletView: FC = () => {
  const searchParams = useSearchParams();
  const linkedOrderId = searchParams.get(`order`);
  const [tab, setTab] = useState<TWalletTab>(() =>
    searchParams.get(`tab`) === `orders` || linkedOrderId
      ? `orders`
      : `history`,
  );
  const { data: summary } = useWalletSummary();
  const transactions = useTransactions();
  const orders = useOrders();

  const renderList = () => {
    const query = tab === `history` ? transactions : orders;
    if (query.isPending) return <ListSkeleton />;
    if (query.isError) {
      return (
        <ErrorState
          onRetry={() => query.refetch()}
          isRetrying={query.isFetching}
        />
      );
    }
    if (tab === `history`) {
      return transactions.data && transactions.data.length > 0 ? (
        <TransactionList transactions={transactions.data} />
      ) : (
        <EmptyState icon="receipt" title={uiText.wallet.noTransactions} />
      );
    }
    return orders.data && orders.data.length > 0 ? (
      <OrderList orders={orders.data} initialOpenId={linkedOrderId} />
    ) : (
      <EmptyState icon="bag" title={uiText.wallet.noOrders} />
    );
  };

  return (
    <>
      <PageHeader title={uiText.wallet.title} />
      <BalanceCard summary={summary} />
      <SegmentedControl
        aria-label={uiText.wallet.sectionLabel}
        options={TABS}
        value={tab}
        onChange={setTab}
        isFullWidth
        size="sm"
      />
      <Surface
        padding="none"
        aria-label={TABS.find((item) => item.value === tab)?.label}
      >
        {renderList()}
      </Surface>
    </>
  );
};

WalletView.displayName = `WalletView`;

export default WalletView;
