'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { Icon } from '@/icons';
import { Button } from '../button';
import { IErrorStateProps } from './interface';

/**
 * Failed-to-load placeholder with a retry action. Announced politely when
 * it appears.
 *
 * @example
 * <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
 */
export const ErrorState: FC<IErrorStateProps> = ({
  message = uiText.errors.loadFailed,
  onRetry,
  isRetrying = false,
}) => (
  <div
    role="alert"
    className="flex flex-col items-center gap-3 px-6 py-10 text-center"
  >
    <span className="flex size-16 items-center justify-center rounded-full text-danger-500 shadow-neu-inset">
      <Icon name="alert" size={28} />
    </span>
    <p className="typo-s1 text-fg-secondary">{message}</p>
    {onRetry && (
      <Button
        variant="secondary"
        size="sm"
        startIcon="refresh"
        isLoading={isRetrying}
        onPress={onRetry}
      >
        {uiText.retry}
      </Button>
    )}
  </div>
);

ErrorState.displayName = `ErrorState`;

export default ErrorState;
