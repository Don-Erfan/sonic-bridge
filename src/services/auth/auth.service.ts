import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import { IAuthService, ICredentials, ISessionTokens } from './interface';
import { clearSession, saveSession } from './session';

/** `POST /auth/login`, `POST /auth/logout`. */
export class AuthService extends AbstractAPI implements IAuthService {
  constructor() {
    super(`auth`);
  }

  async login(credentials: ICredentials): Promise<void> {
    const tokens = unwrap(
      await this.post<INetworkResponse<ISessionTokens>, ICredentials>(
        `login`,
        credentials,
      ),
    );
    saveSession(tokens);
  }

  async logout(): Promise<void> {
    try {
      await this.post<INetworkResponse<null>>(`logout`);
    } finally {
      // Signing out must work even when the server is unreachable.
      clearSession();
    }
  }
}
