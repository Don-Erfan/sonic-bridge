'use client';
import React, { FC } from 'react';
import Link from 'next/link';
import { uiText } from '@/config';
import { useWalletSummary } from '@/hooks';
import { formatNumber } from '@/lib/utils';
import { CoinAmount, Skeleton } from '../../base';
import { ICoinBalanceProps } from './interface';

/**
 * Header chip with the live coin balance, linking to the wallet.
 *
 * @example
 * <CoinBalance />
 */
export const CoinBalance: FC<ICoinBalanceProps> = ({ href = `/wallet` }) => {
  const { data } = useWalletSummary();

  return (
    <Link
      href={href}
      aria-label={
        data
          ? `${uiText.header.balance}: ${formatNumber(data.balance)} ${uiText.coins}`
          : uiText.header.balance
      }
      className="inline-flex h-10 items-center rounded-full border border-neu-outline bg-neu px-3 shadow-neu-sm transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:shadow-neu-pressed"
    >
      {data ? (
        <CoinAmount amount={data.balance} size="sm" />
      ) : (
        <Skeleton className="h-4 w-14 rounded-full" />
      )}
    </Link>
  );
};

CoinBalance.displayName = `CoinBalance`;

export default CoinBalance;
