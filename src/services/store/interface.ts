import type { TProductCategory } from '@/lib/store';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  category: TProductCategory;
  /** Unit price in coins. */
  price: number;
  stock: number;
  /** Maximum units per person over time, `null` = unlimited. */
  perUserLimit: number | null;
  /** Visual of the product tile when there is no photo. */
  emoji: string;
  /** Product photo (a path on the API server), `null` = show the emoji. */
  imageUrl: string | null;
  isActive: boolean;
  /** Units the signed-in user already ordered (not cancelled). */
  purchasedByMe: number;
}

export type TOrderStatus = `pending` | `fulfilled` | `cancelled`;

export interface IOrder {
  id: string;
  /**
   * Unique, increasing receipt number: what the buyer shows to collect the
   * order and what the store staff search for.
   */
  receiptNumber: number;
  productId: string;
  productName: string;
  emoji: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: TOrderStatus;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  createdAt: number;
}

/** Body of `POST /store/orders`. */
export interface IPurchasePayload {
  productId: string;
  quantity: number;
}

export interface IPurchaseResult {
  order: IOrder;
  /** Balance after the debit. */
  balance: number;
}

/**
 * Store API contract. The server is authoritative: it re-runs the purchase
 * rules (stock, limit, balance) atomically and answers 409 with the failing
 * rule as the envelope `code` (`out-of-stock`, `insufficient-balance`, …).
 */
export interface IStoreService {
  /** `GET /store/products` */
  getProducts(): Promise<IProduct[]>;
  /** `GET /store/orders` — newest first. */
  getOrders(): Promise<IOrder[]>;
  /** `POST /store/orders` */
  purchase(payload: IPurchasePayload): Promise<IPurchaseResult>;
}
