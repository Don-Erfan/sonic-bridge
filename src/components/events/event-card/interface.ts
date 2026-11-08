import type { ICompanyEvent } from '@/services';

export interface IEventCardProps {
  event: ICompanyEvent;
  /** `full` (events page, with RSVP) or `compact` (home list). */
  variant?: `full` | `compact`;
}
