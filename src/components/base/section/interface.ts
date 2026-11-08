import type { ReactNode } from 'react';

export interface ISectionProps {
  /** Unique id; labels the region for assistive technology. */
  id: string;
  title: ReactNode;
  children: ReactNode;
  /** "See all" style link at the end edge of the header. */
  action?: { label: string; href: string };
}
