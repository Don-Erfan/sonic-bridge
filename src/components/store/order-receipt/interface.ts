import type { IOrder } from '@/services';

export interface IOrderReceiptProps {
  order: IOrder;
  /** Who bought it (shown so the store staff can check the person). */
  buyerName?: string;
}

export interface IReceiptSheetProps {
  /** The order shown (kept while the sheet animates closed). */
  order: IOrder | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
