import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import { IStaffMember, IStaffService } from './interface';

/** `GET /staff` — everyone, with today's presence and mood. */
export class StaffService extends AbstractAPI implements IStaffService {
  constructor() {
    super(`staff`);
  }

  async getStaff(): Promise<IStaffMember[]> {
    return unwrap(await this.get<INetworkResponse<IStaffMember[]>>());
  }
}
