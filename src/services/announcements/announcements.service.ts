import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import { IAnnouncement, IAnnouncementService } from './interface';

/** `GET /announcements`. */
export class AnnouncementService
  extends AbstractAPI
  implements IAnnouncementService
{
  constructor() {
    super(`announcements`);
  }

  async getAnnouncements(): Promise<IAnnouncement[]> {
    return unwrap(await this.get<INetworkResponse<IAnnouncement[]>>());
  }
}
