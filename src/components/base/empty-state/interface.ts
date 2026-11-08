import type { ReactNode } from 'react';
import { TIconName } from '@/icons';

export interface IEmptyStateProps {
  icon: TIconName;
  title: ReactNode;
  description?: ReactNode;
  /** Optional call to action. */
  action?: ReactNode;
}
