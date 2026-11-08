import type { TEventCategory } from '@/lib/events';
import type { TProductCategory } from '@/lib/store';
import type { ICompanyEvent } from '../events/interface';
import type { TStaffRole } from '../profile/interface';
import type { TRoomAmenity } from '../rooms/interface';
import type { TOrderStatus } from '../store/interface';
import type { ITransaction } from '../wallet/interface';

/** A staff member as administrators see them (`GET /admin/staff`). */
export interface IAdminStaff {
  id: string;
  username: string;
  fullName: string;
  jobTitle: string;
  team: string;
  email: string;
  avatarUrl: string | null;
  /** Face-recognition id at the entrance gate, `null` = not linked. */
  gatePersonId: string | null;
  role: TStaffRole;
  /** `false` = deactivated: cannot sign in. */
  isActive: boolean;
  balance: number;
  /** Unix time in milliseconds (UTC). */
  createdAt: number;
}

/** Editable fields of a staff member (`PUT /admin/staff/:id`). */
export interface IStaffPayload {
  username: string;
  fullName: string;
  jobTitle: string;
  team: string;
  email: string;
  gatePersonId: string | null;
  role: TStaffRole;
  isActive: boolean;
}

/** Body of `POST /admin/staff`. */
export interface ICreateStaffPayload extends Omit<IStaffPayload, `isActive`> {
  password: string;
  /** Welcome coins credited at once (0 for none). */
  initialCoins: number;
}

/** Body of `POST /admin/staff/:id/coins`: positive gives, negative takes. */
export interface IAdjustCoinsPayload {
  amount: number;
  description: string | null;
}

export interface ICoinAdjustmentResult {
  transaction: ITransaction;
  /** The person's balance after the adjustment. */
  balance: number;
}

/** A store product as administrators see it (`GET /admin/products`). */
export interface IAdminProduct {
  id: string;
  name: string;
  description: string;
  category: TProductCategory;
  price: number;
  stock: number;
  perUserLimit: number | null;
  emoji: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  /** Units sold (cancelled orders excluded). */
  soldUnits: number;
}

/** Body of `POST /admin/products` and `PUT /admin/products/:id`. */
export type TProductPayload = Omit<
  IAdminProduct,
  `id` | `imageUrl` | `soldUnits`
>;

/** Anyone's order (`GET /admin/orders`). */
export interface IAdminOrder {
  id: string;
  /** The receipt number the buyer shows when collecting the order. */
  receiptNumber: number;
  userId: string;
  userFullName: string;
  productId: string;
  productName: string;
  emoji: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: TOrderStatus;
  createdAt: number;
}

/** A meeting room's settings (`GET /admin/rooms`). */
export interface IAdminRoom {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  amenities: TRoomAmenity[];
  sortOrder: number;
}

export type TRoomPayload = Omit<IAdminRoom, `id`>;

/** Anyone's booking, today or later (`GET /admin/bookings`). */
export interface IAdminBooking {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  organizerId: string;
  organizerName: string;
  startsAt: number;
  endsAt: number;
}

/** Body of `PUT /admin/bookings/:id`. */
export interface IReschedulePayload {
  title: string;
  startsAt: number;
  endsAt: number;
}

/** Body of `POST /admin/events` and `PUT /admin/events/:id`. */
export interface IEventPayload {
  title: string;
  description: string;
  category: TEventCategory;
  startsAt: number;
  endsAt: number;
  isAllDay: boolean;
  location: string;
  /** Empty = the administrator's own name. */
  organizer: string;
}

/**
 * Administration API (`/admin/*`), for staff whose profile `role` is
 * `admin`; everyone else gets `403 forbidden`. Failures carry the API's
 * envelope `code` (`username_taken`, `negative_balance`, …) and a Persian
 * `detail` to show as-is.
 */
export interface IAdminService {
  getStaff(): Promise<IAdminStaff[]>;
  createStaff(payload: ICreateStaffPayload): Promise<IAdminStaff>;
  updateStaff(id: string, payload: IStaffPayload): Promise<IAdminStaff>;
  setPassword(id: string, password: string): Promise<void>;
  uploadStaffAvatar(id: string, file: File): Promise<IAdminStaff>;
  removeStaffAvatar(id: string): Promise<IAdminStaff>;
  getStaffTransactions(id: string): Promise<ITransaction[]>;
  adjustCoins(
    id: string,
    payload: IAdjustCoinsPayload,
  ): Promise<ICoinAdjustmentResult>;

  getProducts(): Promise<IAdminProduct[]>;
  createProduct(payload: TProductPayload): Promise<IAdminProduct>;
  updateProduct(id: string, payload: TProductPayload): Promise<IAdminProduct>;
  deleteProduct(id: string): Promise<void>;
  uploadProductImage(id: string, file: File): Promise<IAdminProduct>;
  removeProductImage(id: string): Promise<IAdminProduct>;

  /** The latest orders, or only the one with `receipt` as its receipt number. */
  getOrders(receipt?: number): Promise<IAdminOrder[]>;
  fulfilOrder(id: string): Promise<IAdminOrder>;
  /** Refunds the coins and restocks the product. */
  cancelOrder(id: string): Promise<IAdminOrder>;

  getRooms(): Promise<IAdminRoom[]>;
  createRoom(payload: TRoomPayload): Promise<IAdminRoom>;
  updateRoom(id: string, payload: TRoomPayload): Promise<IAdminRoom>;
  /** Also deletes the room's bookings. */
  deleteRoom(id: string): Promise<void>;

  getBookings(): Promise<IAdminBooking[]>;
  rescheduleBooking(
    id: string,
    payload: IReschedulePayload,
  ): Promise<IAdminBooking>;
  /** Cancels a future booking, ends one in progress. */
  endBooking(id: string): Promise<void>;

  getEvents(): Promise<ICompanyEvent[]>;
  createEvent(payload: IEventPayload): Promise<ICompanyEvent>;
  updateEvent(id: string, payload: IEventPayload): Promise<ICompanyEvent>;
  deleteEvent(id: string): Promise<void>;
}
