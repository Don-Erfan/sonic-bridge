import type { TEventCategory, TRsvp } from '@/lib/events';

export interface ICompanyEvent {
  id: string;
  title: string;
  description: string;
  category: TEventCategory;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  startsAt: number;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  endsAt: number;
  isAllDay: boolean;
  location: string;
  organizer: string;
  attendeesCount: number;
  myRsvp: TRsvp | null;
}

/** Events API contract. */
export interface IEventService {
  /** `GET /events` — recent past and upcoming. */
  getEvents(): Promise<ICompanyEvent[]>;
  /** `PUT /events/:id/rsvp` */
  respond(eventId: string, rsvp: TRsvp): Promise<ICompanyEvent>;
}
