'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { Sheet } from '../../base';
import { BookingForm } from './BookingForm';
import { IBookingSheetProps } from './interface';

/**
 * Bottom sheet to book a room from now for a chosen length.
 *
 * @example
 * <BookingSheet room={room} viewerId={me.id} isOpen={isOpen} onOpenChange={setOpen} />
 */
export const BookingSheet: FC<IBookingSheetProps> = ({
  room,
  viewerId,
  isOpen,
  onOpenChange,
}) => (
  <Sheet
    title={
      room ? fillTemplate(uiText.rooms.bookTitle, { room: room.name }) : ``
    }
    isOpen={isOpen && room !== null}
    onOpenChange={onOpenChange}
  >
    {room && (
      <BookingForm
        room={room}
        viewerId={viewerId}
        onDone={() => onOpenChange(false)}
      />
    )}
  </Sheet>
);

BookingSheet.displayName = `BookingSheet`;

export default BookingSheet;
