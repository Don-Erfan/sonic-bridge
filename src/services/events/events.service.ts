import type { TRsvp } from '@/lib/events';
import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import { ICompanyEvent, IEventService } from './interface';

/** `GET /events`, `PUT /events/:id/rsvp`. */
export class EventService extends AbstractAPI implements IEventService {
  constructor() {
    super(`events`);
  }

  async getEvents(): Promise<ICompanyEvent[]> {
    return unwrap(await this.get<INetworkResponse<ICompanyEvent[]>>());
  }

  async respond(eventId: string, rsvp: TRsvp): Promise<ICompanyEvent> {
    return unwrap(
      await this.put<INetworkResponse<ICompanyEvent>, { rsvp: TRsvp }>(
        `${encodeURIComponent(eventId)}/rsvp`,
        { rsvp },
      ),
    );
  }
}
