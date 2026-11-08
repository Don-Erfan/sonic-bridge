'use client';
import React, { FC, useState } from 'react';
import { uiText } from '@/config';
import { useProducts, useWalletSummary } from '@/hooks';
import {
  PRODUCT_CATEGORIES,
  productCategoryIcons,
  TProductCategory,
} from '@/lib/store';
import type { IProduct } from '@/services';
import {
  CoinAmount,
  EmptyState,
  ErrorState,
  ISegmentedOption,
  SegmentedControl,
  Skeleton,
} from '../../base';
import { PageHeader } from '../../layout';
import { ProductCard } from '../product-card';
import { PurchaseSheet } from '../purchase-sheet';

type TCategoryFilter = `all` | TProductCategory;

const FILTERS: readonly ISegmentedOption<TCategoryFilter>[] = [
  { value: `all`, label: uiText.store.all },
  ...PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: uiText.store.categories[category],
    icon: productCategoryIcons[category],
  })),
];

const SKELETON_TILES = 4;

/** Coin store (`/store`): catalogue by category and checkout sheet. */
export const StoreView: FC = () => {
  const {
    data: products,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useProducts();
  const { data: wallet } = useWalletSummary();
  const [category, setCategory] = useState<TCategoryFilter>(`all`);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const visible =
    products?.filter(
      (product) => category === `all` || product.category === category,
    ) ?? [];
  const selected =
    products?.find((product) => product.id === selectedId) ?? null;

  const handleBuy = (product: IProduct) => {
    setSelectedId(product.id);
    setSessionKey((key) => key + 1);
    setSheetOpen(true);
  };

  return (
    <>
      <PageHeader
        title={uiText.store.title}
        subtitle={uiText.store.subtitle}
        action={wallet && <CoinAmount amount={wallet.balance} size="lg" />}
      />

      <div className="-mx-4 scrollbar-none overflow-x-auto px-4 pb-2">
        <SegmentedControl
          aria-label={uiText.store.categoryLabel}
          options={FILTERS}
          value={category}
          onChange={setCategory}
          size="sm"
        />
      </div>

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy>
          {Array.from({ length: SKELETON_TILES }, (_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-24" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : visible.length === 0 ? (
        <EmptyState icon="bag" title={uiText.store.empty} />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                balance={wallet?.balance}
                onBuy={handleBuy}
              />
            </li>
          ))}
        </ul>
      )}

      <PurchaseSheet
        product={selected}
        balance={wallet?.balance ?? 0}
        isOpen={isSheetOpen}
        sessionKey={sessionKey}
        onOpenChange={setSheetOpen}
      />
    </>
  );
};

StoreView.displayName = `StoreView`;

export default StoreView;
