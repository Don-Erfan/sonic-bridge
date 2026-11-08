import type { IOrder } from '@/services';

export interface IOrderListProps {
  orders: readonly IOrder[];
  /** Order whose receipt opens right away (a notification's link). */
  initialOpenId?: string | null;
}
