import type { ReactNode } from 'react';

export interface IPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Control at the end edge (e.g. a filter or "book" button). */
  action?: ReactNode;
}
