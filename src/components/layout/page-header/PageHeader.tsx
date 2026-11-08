import React, { FC } from 'react';
import { IPageHeaderProps } from './interface';

/**
 * Page title block: the page's only `h1`, an optional subtitle and action.
 *
 * @example
 * <PageHeader title="اتاق‌های جلسه" subtitle="اتاق آزاد پیدا کنید." />
 */
export const PageHeader: FC<IPageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="flex items-end justify-between gap-4 px-1 pt-2 pb-1">
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="typo-h1 text-fg-primary">{title}</h1>
      {subtitle && <p className="typo-b1 text-fg-tertiary">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

PageHeader.displayName = `PageHeader`;

export default PageHeader;
