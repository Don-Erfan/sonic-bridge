import type { INavItem } from '@/config';

export interface ISideNavProps {
  primary?: readonly INavItem[];
  secondary?: readonly INavItem[];
}
