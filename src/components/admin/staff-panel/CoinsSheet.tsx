'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useAdjustCoins, useAdminStaffTransactions } from '@/hooks';
import { formatNumber } from '@/lib/utils';
import type { IAdminStaff } from '@/services';
import {
  Button,
  CoinAmount,
  ErrorState,
  ISegmentedOption,
  notify,
  SegmentedControl,
  Sheet,
  Skeleton,
  TextField,
} from '../../base';
import { TransactionList } from '../../wallet';
import { parseInteger, toOptionalText } from '../admin-shared';

type TDirection = `give` | `take`;

const DIRECTIONS: readonly ISegmentedOption<TDirection>[] = [
  { value: `give`, label: uiText.admin.staff.give, icon: `plus` },
  { value: `take`, label: uiText.admin.staff.take, icon: `minus` },
];

/** How many recent transactions the sheet lists. */
const HISTORY_SIZE = 10;

export interface ICoinsSheetProps {
  member: IAdminStaff | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Changes on every opening, so the form starts empty again. */
  sessionKey: number;
}

const CoinsForm: FC<{ member: IAdminStaff }> = ({ member }) => {
  const t = uiText.admin.staff;
  const [direction, setDirection] = useState<TDirection>(`give`);
  const [amountText, setAmountText] = useState(``);
  const [reason, setReason] = useState(``);
  const [isSubmitted, setSubmitted] = useState(false);
  // Shown at once from the server's answer, before the list refetches.
  const [balance, setBalance] = useState(member.balance);
  const adjust = useAdjustCoins();
  const history = useAdminStaffTransactions(member.id);

  const amount = parseInteger(amountText);
  const isAmountValid = amount !== null && amount > 0;
  const label = fillTemplate(direction === `give` ? t.applyGive : t.applyTake, {
    amount: formatNumber(isAmountValid ? amount : 0),
  });

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isAmountValid) return;
    try {
      const result = await adjust.mutateAsync({
        id: member.id,
        payload: {
          amount: direction === `give` ? amount : -amount,
          description: toOptionalText(reason),
        },
      });
      setBalance(result.balance);
      setAmountText(``);
      setReason(``);
      setSubmitted(false);
      notify.success(
        fillTemplate(t.coinsApplied, { amount: formatNumber(result.balance) }),
      );
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between gap-4 rounded-20 px-4 py-3 shadow-neu-inset">
        <span className="typo-s1 text-fg-secondary">{t.currentBalance}</span>
        <CoinAmount amount={balance} size="lg" />
      </div>

      <SegmentedControl
        aria-label={t.coins}
        options={DIRECTIONS}
        value={direction}
        onChange={setDirection}
        isFullWidth
      />
      <TextField
        label={t.amount}
        inputMode="numeric"
        value={amountText}
        onChange={setAmountText}
        isRequired
        isInvalid={isSubmitted && !isAmountValid}
        errorMessage={uiText.admin.invalidNumber}
      />
      <TextField
        label={t.reason}
        placeholder={t.reasonPlaceholder}
        value={reason}
        onChange={setReason}
        maxLength={256}
      />
      <Button
        variant={direction === `give` ? `primary` : `danger`}
        size="lg"
        isFullWidth
        startIcon="coin"
        isLoading={adjust.isPending}
        onPress={handleSubmit}
      >
        {label}
      </Button>

      <section aria-labelledby="coins-history" className="flex flex-col gap-2">
        <h3 id="coins-history" className="typo-s1 text-fg-secondary">
          {t.history}
        </h3>
        {history.isPending ? (
          <Skeleton className="h-24 w-full rounded-20" />
        ) : history.isError ? (
          <ErrorState
            onRetry={() => history.refetch()}
            isRetrying={history.isFetching}
          />
        ) : history.data.length === 0 ? (
          <p className="typo-b2 text-fg-tertiary">{t.noHistory}</p>
        ) : (
          <TransactionList transactions={history.data.slice(0, HISTORY_SIZE)} />
        )}
      </section>
    </div>
  );
};

/** Give coins to, or take coins from, one person (with a reason). */
export const CoinsSheet: FC<ICoinsSheetProps> = ({
  member,
  isOpen,
  onOpenChange,
  sessionKey,
}) => (
  <Sheet
    title={
      member
        ? fillTemplate(uiText.admin.staff.coinsTitle, { name: member.fullName })
        : uiText.admin.staff.coins
    }
    isOpen={isOpen && member !== null}
    onOpenChange={onOpenChange}
  >
    {member && <CoinsForm key={sessionKey} member={member} />}
  </Sheet>
);

CoinsSheet.displayName = `CoinsSheet`;
