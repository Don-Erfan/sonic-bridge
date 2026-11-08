import { AbstractAPI, INetworkResponse } from '../interceptor';
import { toImageForm, unwrap } from '../common';
import type { ICompanyEvent } from '../events/interface';
import type { ITransaction } from '../wallet/interface';
import {
  IAdjustCoinsPayload,
  IAdminBooking,
  IAdminOrder,
  IAdminProduct,
  IAdminRoom,
  IAdminService,
  IAdminStaff,
  ICoinAdjustmentResult,
  ICreateStaffPayload,
  IEventPayload,
  IReschedulePayload,
  IStaffPayload,
  TProductPayload,
  TRoomPayload,
} from './interface';

type TEnvelope<T> = INetworkResponse<T>;

/** `/admin/*` — people, coins, store, rooms, bookings and events. */
export class AdminService extends AbstractAPI implements IAdminService {
  constructor() {
    super(`admin`);
  }

  // People and coins
  async getStaff() {
    return unwrap(await this.get<TEnvelope<IAdminStaff[]>>(`staff`));
  }

  async createStaff(payload: ICreateStaffPayload) {
    return unwrap(await this.post<TEnvelope<IAdminStaff>>(`staff`, payload));
  }

  async updateStaff(id: string, payload: IStaffPayload) {
    return unwrap(
      await this.put<TEnvelope<IAdminStaff>>(`staff/${id}`, payload),
    );
  }

  async setPassword(id: string, password: string) {
    await this.put<TEnvelope<null>>(`staff/${id}/password`, { password });
  }

  async uploadStaffAvatar(id: string, file: File) {
    return unwrap(
      await this.upload<TEnvelope<IAdminStaff>>(
        `staff/${id}/avatar`,
        toImageForm(file),
      ),
    );
  }

  async removeStaffAvatar(id: string) {
    return unwrap(
      await this.delete<TEnvelope<IAdminStaff>>(`staff/${id}/avatar`),
    );
  }

  async getStaffTransactions(id: string) {
    return unwrap(
      await this.get<TEnvelope<ITransaction[]>>(`staff/${id}/transactions`),
    );
  }

  async adjustCoins(id: string, payload: IAdjustCoinsPayload) {
    return unwrap(
      await this.post<TEnvelope<ICoinAdjustmentResult>>(
        `staff/${id}/coins`,
        payload,
      ),
    );
  }

  // Store
  async getProducts() {
    return unwrap(await this.get<TEnvelope<IAdminProduct[]>>(`products`));
  }

  async createProduct(payload: TProductPayload) {
    return unwrap(
      await this.post<TEnvelope<IAdminProduct>>(`products`, payload),
    );
  }

  async updateProduct(id: string, payload: TProductPayload) {
    return unwrap(
      await this.put<TEnvelope<IAdminProduct>>(`products/${id}`, payload),
    );
  }

  async deleteProduct(id: string) {
    await this.delete<TEnvelope<null>>(`products/${id}`);
  }

  async uploadProductImage(id: string, file: File) {
    return unwrap(
      await this.upload<TEnvelope<IAdminProduct>>(
        `products/${id}/image`,
        toImageForm(file),
      ),
    );
  }

  async removeProductImage(id: string) {
    return unwrap(
      await this.delete<TEnvelope<IAdminProduct>>(`products/${id}/image`),
    );
  }

  async getOrders(receipt?: number) {
    return unwrap(
      await this.get<TEnvelope<IAdminOrder[]>>(
        `orders`,
        receipt === undefined ? undefined : { params: { receipt } },
      ),
    );
  }

  async fulfilOrder(id: string) {
    return unwrap(
      await this.post<TEnvelope<IAdminOrder>>(`orders/${id}/fulfil`),
    );
  }

  async cancelOrder(id: string) {
    return unwrap(
      await this.post<TEnvelope<IAdminOrder>>(`orders/${id}/cancel`),
    );
  }

  // Rooms and bookings
  async getRooms() {
    return unwrap(await this.get<TEnvelope<IAdminRoom[]>>(`rooms`));
  }

  async createRoom(payload: TRoomPayload) {
    return unwrap(await this.post<TEnvelope<IAdminRoom>>(`rooms`, payload));
  }

  async updateRoom(id: string, payload: TRoomPayload) {
    return unwrap(
      await this.put<TEnvelope<IAdminRoom>>(`rooms/${id}`, payload),
    );
  }

  async deleteRoom(id: string) {
    await this.delete<TEnvelope<null>>(`rooms/${id}`);
  }

  async getBookings() {
    return unwrap(await this.get<TEnvelope<IAdminBooking[]>>(`bookings`));
  }

  async rescheduleBooking(id: string, payload: IReschedulePayload) {
    return unwrap(
      await this.put<TEnvelope<IAdminBooking>>(`bookings/${id}`, payload),
    );
  }

  async endBooking(id: string) {
    await this.delete<TEnvelope<null>>(`bookings/${id}`);
  }

  // Events
  async getEvents() {
    return unwrap(await this.get<TEnvelope<ICompanyEvent[]>>(`events`));
  }

  async createEvent(payload: IEventPayload) {
    return unwrap(await this.post<TEnvelope<ICompanyEvent>>(`events`, payload));
  }

  async updateEvent(id: string, payload: IEventPayload) {
    return unwrap(
      await this.put<TEnvelope<ICompanyEvent>>(`events/${id}`, payload),
    );
  }

  async deleteEvent(id: string) {
    await this.delete<TEnvelope<null>>(`events/${id}`);
  }
}
