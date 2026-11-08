import { uiText } from '@/config';
import { TIconName } from '@/icons';
import type { TRoomStatus } from '@/lib/rooms';
import type { TRoomAmenity } from '@/services';

export const ROOM_STATUS_LABEL: Record<TRoomStatus, string> = {
  available: uiText.rooms.available,
  upcoming: uiText.rooms.upcoming,
  occupied: uiText.rooms.occupied,
};

export const AMENITY_ICON: Record<TRoomAmenity, TIconName> = {
  display: `monitor`,
  'video-conference': `video`,
  whiteboard: `whiteboard`,
  'sound-system': `speaker`,
};

/** Upcoming bookings listed on a card before the rest are summarised. */
export const MAX_LISTED_BOOKINGS = 3;
