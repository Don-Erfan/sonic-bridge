import type { IProduct } from '@/services';

export interface IProductCardProps {
  product: IProduct;
  /** Current balance; `undefined` while loading (buying is disabled). */
  balance: number | undefined;
  onBuy: (product: IProduct) => void;
}
