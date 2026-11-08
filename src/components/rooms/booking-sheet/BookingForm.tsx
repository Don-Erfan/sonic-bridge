'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useBookRoom, useNow } from '@/hooks';
import {
  createBookingWindow,
  getBookableDurations,
  resolveRoomSnapshot,
} from '@/lib/rooms';
import { addMinutes, formatDuration, formatTime } from '@/lib/utils';
import type { IMeetingRoom } from '@/services';
import {
  Button,
  ISegmentedOption,
  notify,
  SegmentedControl,
  TextField,
} from '../../base';

/** Pre-selected meeting length when it fits. */
const PREFERRED_MINUTES = 30;

/** Longest title the form accepts. */
const TITLE_MAX_LENGTH = 80;

interface IBookingFormProps {
  room: IMeetingRoom;
  viewerId: string;
  onDone: () => void;
}

/**
 * "Book from now" form. Offered durations come from the room's state at the
 * current tick, so they shrink as the next meeting approaches; the server
 * still has the final word on conflicts.
 */
export const BookingForm: FC<IBookingFormProps> = ({
  room,
  viewerId,
  onDone,
}) => {
  const now = useNow();
  const bookRoom = useBookRoom();
  const snapshot = resolveRoomSnapshot(room.bookings, now, viewerId);
  const durations = getBookableDurations(snapshot, now);
  const [title, setTitle] = useState(``);
  const [chosenMinutes, setMinutes] = useState<number | null>(null);

  // Keep the choice valid if time moved on and it no longer fits.
  const minutes =
    chosenMinutes !== null && durations.includes(chosenMinutes)
      ? chosenMinutes
      : (durations.find((value) => value >= PREFERRED_MINUTES) ??
        durations[0] ??
        null);

  const options: ISegmentedOption<string>[] = durations.map((value) => ({
    value: String(value),
    label: formatDuration(value),
  }));

  const handleSubmit = async () => {
    if (minutes === null) return;
    try {
      await bookRoom.mutateAsync({
        roomId: room.id,
        title: title.trim() || uiText.rooms.defaultMeetingTitle,
        // The window starts at the moment of the tap, not the last clock tick.
        ...createBookingWindow(new Date(), minutes),
      });
      notify.success(uiText.rooms.booked);
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  if (minutes === null) {
    return (
      <p className="py-6 text-center typo-b1 text-fg-secondary">
        {uiText.rooms.noSlot}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <TextField
        label={uiText.rooms.meetingTitle}
        placeholder={uiText.rooms.meetingTitlePlaceholder}
        value={title}
        onChange={setTitle}
        maxLength={TITLE_MAX_LENGTH}
        enterKeyHint="done"
      />

      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-2 typo-s1 text-fg-secondary">
          {uiText.rooms.duration}
        </legend>
        <div className="-mx-5 scrollbar-none overflow-x-auto px-5 pb-2">
          <SegmentedControl
            aria-label={uiText.rooms.duration}
            options={options}
            value={String(minutes)}
            onChange={(value) => setMinutes(Number(value))}
            size="sm"
          />
        </div>
        <p className="typo-b2 text-fg-tertiary" aria-live="polite">
          {fillTemplate(uiText.rooms.startsNow, {
            time: formatTime(addMinutes(now, minutes)),
          })}
        </p>
      </fieldset>

      <div className="pb-[env(safe-area-inset-bottom)]">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          startIcon="check"
          isFullWidth
          isLoading={bookRoom.isPending}
        >
          {uiText.rooms.book}
        </Button>
      </div>
    </form>
  );
};

BookingForm.displayName = `BookingForm`;
