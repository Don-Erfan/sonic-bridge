import type { TDeclarableWorkMode } from '@/lib/presence';
import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import { IAttendanceDay, IAttendanceService } from './interface';

/** `GET /attendance/today`, `PUT /attendance/today/work-mode`. */
export class AttendanceService
  extends AbstractAPI
  implements IAttendanceService
{
  constructor() {
    super(`attendance`);
  }

  async getToday(): Promise<IAttendanceDay> {
    return unwrap(await this.get<INetworkResponse<IAttendanceDay>>(`today`));
  }

  async setWorkMode(
    workMode: TDeclarableWorkMode | null,
  ): Promise<IAttendanceDay> {
    return unwrap(
      await this.put<
        INetworkResponse<IAttendanceDay>,
        { workMode: TDeclarableWorkMode | null }
      >(`today/work-mode`, { workMode }),
    );
  }
}
