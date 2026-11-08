'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useAttendanceToday, useSetWorkMode } from '@/hooks';
import { Icon } from '@/icons';
import { DAILY_CHECK_IN_REWARD } from '@/lib/coins';
import type { TDeclarableWorkMode } from '@/lib/presence';
import { formatNumber, formatTime } from '@/lib/utils';
import {
  Badge,
  Button,
  CoinAmount,
  ErrorState,
  notify,
  Skeleton,
  Surface,
} from '../../base';
import { ICheckInCardProps } from './interface';

const DECLARED_TEXT: Record<TDeclarableWorkMode, string> = {
  remote: uiText.checkIn.remote,
  'on-leave': uiText.checkIn.onLeave,
};

const DECLARED_ICON = { remote: `laptop`, 'on-leave': `calendar-off` } as const;

/**
 * Today's attendance: recognised at the gate (with the coin reward), a
 * declared remote / leave day, or still waiting — with the actions that make
 * sense in each state.
 *
 * @example
 * <CheckInCard />
 */
export const CheckInCard: FC<ICheckInCardProps> = ({ headingLevel = 2 }) => {
  const {
    data: today,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useAttendanceToday();
  const setWorkMode = useSetWorkMode();
  const Heading = `h${headingLevel}` as const;
  const rewardAmount = formatNumber(DAILY_CHECK_IN_REWARD);

  const handleWorkMode = async (workMode: TDeclarableWorkMode | null) => {
    try {
      await setWorkMode.mutateAsync(workMode);
      notify.success(uiText.checkIn.workModeSaved);
    } catch (error) {
      notify.error(error);
    }
  };

  const renderBody = () => {
    if (isPending) {
      return (
        <div className="flex items-center gap-4" aria-busy>
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
          </div>
        </div>
      );
    }

    if (isError || !today) {
      return <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />;
    }

    if (today.checkedInAt) {
      return (
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full text-teal-600 shadow-neu-inset">
            <Icon name="check-circle" size={32} />
          </span>
          <div className="flex flex-col gap-2">
            <p className="typo-b1 text-fg-primary">
              {fillTemplate(uiText.checkIn.checkedIn, {
                time: formatTime(today.checkedInAt),
              })}
            </p>
            {today.reward && (
              <span className="inline-flex w-fit items-center rounded-full bg-tone-success px-3 py-1 text-tone-success-fg motion-safe:animate-pop">
                <CoinAmount
                  amount={today.reward.amount}
                  size="sm"
                  isSigned
                  isCompact={false}
                />
              </span>
            )}
          </div>
        </div>
      );
    }

    if (today.workMode) {
      return (
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full text-secondary-500 shadow-neu-inset">
            <Icon name={DECLARED_ICON[today.workMode]} size={30} />
          </span>
          <div className="flex flex-1 flex-col items-start gap-2">
            <p className="typo-b1 text-fg-primary">
              {DECLARED_TEXT[today.workMode]}
            </p>
            <Button
              variant="ghost"
              size="sm"
              isLoading={setWorkMode.isPending}
              onPress={() => handleWorkMode(null)}
            >
              {uiText.checkIn.undoDeclaration}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="relative flex size-16 shrink-0 items-center justify-center rounded-full text-primary-500 shadow-neu-inset">
            <span
              aria-hidden
              className="absolute inset-1 animate-ping rounded-full border-2 border-primary-300 opacity-40 motion-reduce:animate-none"
            />
            <Icon name="scan-face" size={30} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="typo-s1 text-fg-primary">{uiText.checkIn.waiting}</p>
            <p className="typo-b2 text-fg-tertiary">
              {fillTemplate(uiText.checkIn.waitingHint, {
                amount: rewardAmount,
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            startIcon="laptop"
            isDisabled={setWorkMode.isPending}
            onPress={() => handleWorkMode(`remote`)}
          >
            {uiText.checkIn.declareRemote}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            startIcon="calendar-off"
            isDisabled={setWorkMode.isPending}
            onPress={() => handleWorkMode(`on-leave`)}
          >
            {uiText.checkIn.declareLeave}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Surface as="section" padding="lg" aria-labelledby="check-in-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Heading id="check-in-title" className="typo-h3 text-fg-primary">
          {uiText.checkIn.title}
        </Heading>
        {today?.checkedInAt && (
          <Badge tone="success" hasDot>
            {uiText.presence[`in-office`]}
          </Badge>
        )}
      </div>
      {renderBody()}
    </Surface>
  );
};

CheckInCard.displayName = `CheckInCard`;

export default CheckInCard;
