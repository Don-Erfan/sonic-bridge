'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { LogoMark } from '@/icons';
import { DAILY_CHECK_IN_REWARD } from '@/lib/coins';
import { formatNumber } from '@/lib/utils';
import { CoinAmount, Skeleton } from '../../base';
import { IBalanceCardProps } from './interface';

/**
 * Wallet hero: the balance on the purple→blue action gradient (white text
 * ≥ 4.4:1 across it), the day's earnings and lifetime totals.
 *
 * @example
 * <BalanceCard summary={summary} />
 */
export const BalanceCard: FC<IBalanceCardProps> = ({ summary }) => (
  <section
    aria-labelledby="balance-title"
    className="relative isolate overflow-hidden rounded-28 bg-action-gradient p-5 text-white shadow-[0_18px_36px_-14px_rgb(115_45_246/0.65)]"
  >
    {/* The logo rings, oversized and faint, as a watermark. */}
    <span aria-hidden className="absolute -end-10 -top-10 -z-10 opacity-15">
      <LogoMark size={180} />
    </span>

    <h2 id="balance-title" className="typo-s1 text-white/85">
      {uiText.wallet.balance}
    </h2>
    <div className="mt-2 min-h-12">
      {summary ? (
        <CoinAmount amount={summary.balance} size="xl" isCompact={false} />
      ) : (
        <Skeleton className="h-10 w-40 rounded-full bg-white/25" />
      )}
    </div>

    <dl className="mt-5 grid grid-cols-3 gap-3 rounded-20 bg-white/12 p-3 backdrop-blur-sm">
      {[
        { label: uiText.wallet.earnedToday, value: summary?.earnedToday },
        { label: uiText.wallet.totalEarned, value: summary?.totalEarned },
        { label: uiText.wallet.totalSpent, value: summary?.totalSpent },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="typo-c1 text-white/80">{label}</dt>
          <dd className="typo-s1 tabular-nums">
            {value === undefined ? `—` : formatNumber(value)}
          </dd>
        </div>
      ))}
    </dl>

    <p className="mt-4 typo-b2 text-white/85">
      {fillTemplate(uiText.wallet.howToEarn, {
        amount: formatNumber(DAILY_CHECK_IN_REWARD),
      })}
    </p>
  </section>
);

BalanceCard.displayName = `BalanceCard`;

export default BalanceCard;
