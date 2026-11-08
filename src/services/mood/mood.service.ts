import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import { IMood, IMoodService, IUpdateMoodPayload } from './interface';

/** `GET|PUT|DELETE /mood` — the signed-in user's mood. */
export class MoodService extends AbstractAPI implements IMoodService {
  constructor() {
    super(`mood`);
  }

  async getMood(): Promise<IMood | null> {
    return unwrap(await this.get<INetworkResponse<IMood | null>>());
  }

  async updateMood(payload: IUpdateMoodPayload): Promise<IMood> {
    return unwrap(
      await this.put<INetworkResponse<IMood>, IUpdateMoodPayload>(``, payload),
    );
  }

  async clearMood(): Promise<void> {
    await this.delete<INetworkResponse<null>>();
  }
}
