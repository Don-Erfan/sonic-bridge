import { AbstractAPI, INetworkResponse } from '../interceptor';
import { toImageForm, unwrap } from '../common';
import { IProfile, IProfileService } from './interface';

/** `GET /profile` — the signed-in user — and `POST|DELETE /profile/avatar`. */
export class ProfileService extends AbstractAPI implements IProfileService {
  constructor() {
    super(`profile`);
  }

  async getProfile(): Promise<IProfile> {
    return unwrap(await this.get<INetworkResponse<IProfile>>());
  }

  async uploadAvatar(file: File): Promise<IProfile> {
    return unwrap(
      await this.upload<INetworkResponse<IProfile>>(
        `avatar`,
        toImageForm(file),
      ),
    );
  }

  async removeAvatar(): Promise<IProfile> {
    return unwrap(await this.delete<INetworkResponse<IProfile>>(`avatar`));
  }
}
