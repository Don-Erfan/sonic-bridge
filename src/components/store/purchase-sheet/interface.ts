import type { IProduct } from '@/services';

export interface IPurchaseSheetProps {
  /** The product being bought (kept while the sheet animates closed). */
  product: IProduct | null;
  balance: number;
  isOpen: boolean;
  /**
   * Changes every time the sheet is opened for a purchase, so a receipt from
   * an earlier purchase is never shown again.
   */
  sessionKey: number;
  onOpenChange: (isOpen: boolean) => void;
}
