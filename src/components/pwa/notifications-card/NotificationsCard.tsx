'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import {
  PushPermissionError,
  TPushStatus,
  usePushNotifications,
} from '@/hooks';
import { Icon } from '@/icons';
import { formatNumber } from '@/lib/utils';
import { Button, notify, Skeleton, Surface } from '../../base';
import { INotificationsCardProps } from './interface';

const text = uiText.push;

/** Why notifications cannot be turned on, per status. */
const BLOCKED_HINT: Partial<Record<TPushStatus, string>> = {
  'install-required': text.installRequired,
  insecure: text.insecure,
  unsupported: text.unsupported,
  unavailable: text.unavailable,
  denied: text.denied,
};

/**
 * Push notification opt-in for this device (order handed over / cancelled,
 * also while the app is closed), or why it is not possible here.
 *
 * @example
 * <NotificationsCard />
 */
export const NotificationsCard: FC<INotificationsCardProps> = ({
  headingLevel = 2,
}) => {
  const { status, enable, disable, sendTest, isPending } =
    usePushNotifications();
  const Heading = `h${headingLevel}` as const;
  const hint = BLOCKED_HINT[status];

  const handleEnable = () => {
    enable()
      .then(() => notify.success(text.enabled))
      .catch((error: unknown) => {
        if (error instanceof PushPermissionError) {
          // `denied` shows its own hint in the card.
          if (error.permission === `default`) notify.info(text.dismissed);
          return;
        }
        notify.error(error, text.enableFailed);
      });
  };

  const handleTest = () => {
    sendTest.mutate(undefined, {
      onSuccess: ({ delivered, failed }) => {
        if (delivered > 0) {
          notify.success(
            fillTemplate(text.testSent, { count: formatNumber(delivered) }),
          );
        } else if (failed > 0) {
          notify.warning(text.testFailed);
        } else {
          notify.warning(text.testNoDevice);
        }
      },
      onError: (error) => notify.error(error),
    });
  };

  const handleDisable = () => {
    disable()
      .then(() => notify.success(text.disabled))
      .catch((error: unknown) => notify.error(error));
  };

  const body =
    status === `loading` ? (
      <Skeleton className="h-10 w-44 rounded-full" />
    ) : hint ? (
      <p className="flex items-start gap-2 typo-b2 text-fg-secondary">
        <Icon
          name="info"
          size={18}
          className="mt-0.5 shrink-0 text-secondary-500"
        />
        {hint}
      </p>
    ) : status === `on` ? (
      <div className="flex flex-col gap-3">
        <output className="flex items-center gap-2 typo-b1 text-tone-success-fg">
          <Icon name="check-circle" size={18} />
          {text.on}
        </output>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            startIcon="bell"
            isLoading={sendTest.isPending}
            isDisabled={isPending}
            onPress={handleTest}
          >
            {text.test}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            startIcon="bell-off"
            isLoading={isPending}
            isDisabled={sendTest.isPending}
            onPress={handleDisable}
          >
            {text.disable}
          </Button>
        </div>
        <p className="typo-c1 text-fg-tertiary">{text.testHint}</p>
      </div>
    ) : (
      <span>
        <Button
          variant="primary"
          startIcon="bell"
          isLoading={isPending}
          onPress={handleEnable}
        >
          {text.enable}
        </Button>
      </span>
    );

  return (
    <Surface as="section" padding="lg" aria-labelledby="notifications-title">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-16 text-primary-500 shadow-neu-inset">
          <Icon name="bell" size={22} />
        </span>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Heading
              id="notifications-title"
              className="typo-h3 text-fg-primary"
            >
              {text.title}
            </Heading>
            <p className="typo-b2 text-fg-tertiary">{text.description}</p>
          </div>
          {body}
        </div>
      </div>
    </Surface>
  );
};

NotificationsCard.displayName = `NotificationsCard`;

export default NotificationsCard;
