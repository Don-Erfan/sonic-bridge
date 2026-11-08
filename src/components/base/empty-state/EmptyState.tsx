import React, { FC } from 'react';
import { Icon } from '@/icons';
import { IEmptyStateProps } from './interface';

/**
 * Empty list placeholder: an inset icon well, a sentence and an optional
 * action.
 *
 * @example
 * <EmptyState icon="users" title="همکاری پیدا نشد." />
 */
export const EmptyState: FC<IEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
    <span className="flex size-16 items-center justify-center rounded-full text-fg-quaternary shadow-neu-inset">
      <Icon name={icon} size={28} />
    </span>
    <p className="typo-s1 text-fg-secondary">{title}</p>
    {description && <p className="typo-b2 text-fg-tertiary">{description}</p>}
    {action}
  </div>
);

EmptyState.displayName = `EmptyState`;

export default EmptyState;
