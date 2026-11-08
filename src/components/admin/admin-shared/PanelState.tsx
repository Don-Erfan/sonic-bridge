'use client';
import React, { FC, ReactNode } from 'react';
import { uiText } from '@/config';
import { EmptyState, ErrorState, Skeleton } from '../../base';

export interface IPanelStateProps {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  isRetrying: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

/** Loading / error / empty handling shared by every admin list. */
export const PanelState: FC<IPanelStateProps> = ({
  isPending,
  isError,
  isEmpty,
  onRetry,
  isRetrying,
  emptyMessage = uiText.admin.empty,
  children,
}) => {
  if (isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy>
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-20 w-full rounded-24" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={onRetry} isRetrying={isRetrying} />;
  if (isEmpty) return <EmptyState icon="search" title={emptyMessage} />;
  return <>{children}</>;
};

PanelState.displayName = `PanelState`;
