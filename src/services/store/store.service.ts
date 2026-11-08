import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import {
  IOrder,
  IProduct,
  IPurchasePayload,
  IPurchaseResult,
  IStoreService,
} from './interface';

/** `GET /store/products`, `GET|POST /store/orders`. */
export class StoreService extends AbstractAPI implements IStoreService {
  constructor() {
    super(`store`);
  }

  async getProducts(): Promise<IProduct[]> {
    return unwrap(await this.get<INetworkResponse<IProduct[]>>(`products`));
  }

  async getOrders(): Promise<IOrder[]> {
    return unwrap(await this.get<INetworkResponse<IOrder[]>>(`orders`));
  }

  async purchase(payload: IPurchasePayload): Promise<IPurchaseResult> {
    return unwrap(
      await this.post<INetworkResponse<IPurchaseResult>, IPurchasePayload>(
        `orders`,
        payload,
      ),
    );
  }
}
