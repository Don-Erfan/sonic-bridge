import { AbstractAPI, INetworkResponse } from '../interceptor';
import { unwrap } from '../common';
import {
  IBookRoomPayload,
  IMeetingRoom,
  IRoomBooking,
  IRoomService,
} from './interface';

/** `GET /rooms`, `POST /rooms/:id/bookings`, `DELETE /rooms/bookings/:id`. */
export class RoomService extends AbstractAPI implements IRoomService {
  constructor() {
    super(`rooms`);
  }

  async getRooms(): Promise<IMeetingRoom[]> {
    return unwrap(await this.get<INetworkResponse<IMeetingRoom[]>>());
  }

  async bookRoom({ roomId, ...body }: IBookRoomPayload): Promise<IRoomBooking> {
    return unwrap(
      await this.post<
        INetworkResponse<IRoomBooking>,
        Omit<IBookRoomPayload, `roomId`>
      >(`${encodeURIComponent(roomId)}/bookings`, body),
    );
  }

  async endBooking(bookingId: string): Promise<void> {
    await this.delete<INetworkResponse<null>>(
      `bookings/${encodeURIComponent(bookingId)}`,
    );
  }
}
