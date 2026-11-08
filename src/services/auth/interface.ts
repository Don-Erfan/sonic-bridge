/** Body of `POST /auth/login`. */
export interface ICredentials {
  username: string;
  password: string;
}

/** Tokens returned by `POST /auth/login`, stored as cookies. */
export interface ISessionTokens {
  token: string;
  refreshToken: string;
}

/**
 * Auth API contract. Both implementations persist the session as the
 * `token` / `refreshToken` cookies the interceptor's `AuthMiddleware` reads.
 */
export interface IAuthService {
  /** `POST /auth/login` — rejects with 401 on wrong credentials. */
  login(credentials: ICredentials): Promise<void>;
  /** `POST /auth/logout` — always clears the local session. */
  logout(): Promise<void>;
}
