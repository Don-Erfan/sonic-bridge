import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import { ITransaction, IWalletService, TWalletSummary } from './interface';

/** `GET /wallet/summary`, `GET /wallet/transactions`. */
export class WalletService extends AbstractAPI implements IWalletService {
  constructor() {
    super(`wallet`);
  }

  async getSummary(): Promise<TWalletSummary> {
    return unwrap(await this.get<INetworkResponse<TWalletSummary>>(`summary`));
  }

  async getTransactions(): Promise<ITransaction[]> {
    return unwrap(
      await this.get<INetworkResponse<ITransaction[]>>(`transactions`),
    );
  }
}
