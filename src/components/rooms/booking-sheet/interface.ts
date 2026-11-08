import type { IMeetingRoom } from '@/services';

export interface IBookingSheetProps {
  /** The room being booked (kept while the sheet animates closed). */
  room: IMeetingRoom | null;
  viewerId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
