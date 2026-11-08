'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import {
  useAdminBookings,
  useAdminEndBooking,
  useNow,
  useRescheduleBooking,
} from '@/hooks';
import { formatRelativeDay, formatTimeRange } from '@/lib/utils';
import type { IAdminBooking } from '@/services';
import {
  Badge,
  Button,
  ConfirmDialog,
  notify,
  Sheet,
  Surface,
  TextField,
} from '../../base';
import {
  DateTimeField,
  fromDateTimeInput,
  PanelState,
  toDateTimeInput,
  useSheetSession,
} from '../admin-shared';

const BookingForm: FC<{ booking: IAdminBooking; onDone: () => void }> = ({
  booking,
  onDone,
}) => {
  const t = uiText.admin.bookings;
  const now = useNow();
  const isInProgress = booking.startsAt <= now.getTime();
  const [title, setTitle] = useState(booking.title);
  const [start, setStart] = useState(toDateTimeInput(booking.startsAt));
  const [end, setEnd] = useState(toDateTimeInput(booking.endsAt));
  const [isSubmitted, setSubmitted] = useState(false);
  const reschedule = useRescheduleBooking();

  const startsAt = isInProgress ? booking.startsAt : fromDateTimeInput(start);
  const endsAt = fromDateTimeInput(end);
  const isTimeInvalid =
    startsAt === null || endsAt === null || endsAt <= startsAt;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!title.trim() || isTimeInvalid) return;
    try {
      await reschedule.mutateAsync({
        id: booking.id,
        payload: { title: title.trim(), startsAt, endsAt },
      });
      notify.success(uiText.admin.saved);
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-[env(safe-area-inset-bottom)]">
      <p className="typo-b2 text-fg-secondary">
        {booking.roomName} ·{' '}
        {fillTemplate(t.organizer, { name: booking.organizerName })}
      </p>
      <TextField
        label={t.title}
        value={title}
        onChange={setTitle}
        maxLength={120}
        isRequired
        isInvalid={isSubmitted && !title.trim()}
        errorMessage={uiText.admin.required}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateTimeField
          label={t.start}
          value={start}
          onChange={setStart}
          isDisabled={isInProgress}
          isInvalid={isSubmitted && isTimeInvalid}
        />
        <DateTimeField
          label={t.end}
          value={end}
          onChange={setEnd}
          isInvalid={isSubmitted && isTimeInvalid}
        />
      </div>
      {isSubmitted && isTimeInvalid && (
        <p role="alert" className="typo-b2 text-danger-600">
          {t.invalidTime}
        </p>
      )}
      <p className="typo-c1 text-fg-tertiary">{t.timeHint}</p>
      <Button
        variant="primary"
        size="lg"
        isFullWidth
        isLoading={reschedule.isPending}
        onPress={handleSubmit}
      >
        {uiText.save}
      </Button>
    </div>
  );
};

/** Everyone's bookings from today on: change the time, cancel or end. */
export const BookingsPanel: FC = () => {
  const t = uiText.admin.bookings;
  const now = useNow();
  const bookings = useAdminBookings();
  const endBooking = useAdminEndBooking();
  const form = useSheetSession<IAdminBooking>();
  const ending = useSheetSession<IAdminBooking>();

  const handleEnd = async () => {
    if (!ending.item) return;
    try {
      await endBooking.mutateAsync(ending.item.id);
      notify.success(t.ended);
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PanelState
        isPending={bookings.isPending}
        isError={bookings.isError}
        isEmpty={(bookings.data?.length ?? 0) === 0}
        emptyMessage={t.empty}
        onRetry={() => bookings.refetch()}
        isRetrying={bookings.isFetching}
      >
        <ul className="flex flex-col gap-3">
          {bookings.data?.map((booking) => {
            const isEnded = booking.endsAt <= now.getTime();
            const isInProgress = !isEnded && booking.startsAt <= now.getTime();
            return (
              <Surface as="li" key={booking.id} padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate typo-s1 text-fg-primary">
                      {booking.title}
                    </p>
                    <p className="truncate typo-b2 text-fg-secondary">
                      {booking.roomName} ·{' '}
                      {fillTemplate(t.organizer, {
                        name: booking.organizerName,
                      })}
                    </p>
                    <p className="typo-c1 text-fg-tertiary">
                      {formatRelativeDay(booking.startsAt, now)} ·{' '}
                      {formatTimeRange(booking.startsAt, booking.endsAt)}
                    </p>
                  </div>
                  {isInProgress && (
                    <Badge tone="success" hasDot isPulsing>
                      {t.inProgress}
                    </Badge>
                  )}
                  {isEnded && <Badge tone="neutral">{t.finished}</Badge>}
                </div>
                {/* A finished booking can no longer be changed or ended. */}
                {!isEnded && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      startIcon="clock"
                      onPress={() => form.open(booking)}
                    >
                      {uiText.admin.edit}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      startIcon="close"
                      onPress={() => ending.open(booking)}
                    >
                      {isInProgress ? t.endNow : t.cancel}
                    </Button>
                  </div>
                )}
              </Surface>
            );
          })}
        </ul>
      </PanelState>

      <Sheet
        title={t.editTitle}
        isOpen={form.isOpen && form.item !== null}
        onOpenChange={form.onOpenChange}
      >
        {form.item && (
          <BookingForm
            key={form.sessionKey}
            booking={form.item}
            onDone={() => form.onOpenChange(false)}
          />
        )}
      </Sheet>
      <ConfirmDialog
        isOpen={ending.isOpen}
        onOpenChange={ending.onOpenChange}
        title={t.endTitle}
        message={fillTemplate(t.endMessage, {
          title: ending.item?.title ?? ``,
          organizer: ending.item?.organizerName ?? ``,
          room: ending.item?.roomName ?? ``,
        })}
        confirmLabel={uiText.confirm}
        tone="danger"
        onConfirm={handleEnd}
      />
    </div>
  );
};

BookingsPanel.displayName = `BookingsPanel`;
