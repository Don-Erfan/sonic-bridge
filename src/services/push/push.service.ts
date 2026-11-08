import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import {
  IPushConfig,
  IPushDeliveryReport,
  IPushService,
  IPushSubscriptionPayload,
} from './interface';

/** `GET /push/config`, `POST /push/subscriptions`, `POST /push/unsubscribe`, `POST /push/test`. */
export class PushService extends AbstractAPI implements IPushService {
  constructor() {
    super(`push`);
  }

  async getConfig(): Promise<IPushConfig> {
    return unwrap(await this.get<INetworkResponse<IPushConfig>>(`config`));
  }

  async subscribe(payload: IPushSubscriptionPayload): Promise<void> {
    await this.post<INetworkResponse<null>, IPushSubscriptionPayload>(
      `subscriptions`,
      payload,
    );
  }

  async unsubscribe(endpoint: string): Promise<void> {
    await this.post<INetworkResponse<null>, { endpoint: string }>(
      `unsubscribe`,
      { endpoint },
    );
  }

  async sendTest(): Promise<IPushDeliveryReport> {
    return unwrap(
      await this.post<INetworkResponse<IPushDeliveryReport>>(`test`),
    );
  }
}
