'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import {
  useAdminEvents,
  useCreateEvent,
  useDeleteEvent,
  useNow,
  useUpdateEvent,
} from '@/hooks';
import { eventCategoryRegistry, TEventCategory } from '@/lib/events';
import { addMinutes, formatDateTime, formatNumber } from '@/lib/utils';
import type { ICompanyEvent } from '@/services';
import {
  Badge,
  Button,
  ConfirmDialog,
  ISegmentedOption,
  notify,
  SegmentedControl,
  Sheet,
  Surface,
  TextField,
} from '../../base';
import {
  DateTimeField,
  fromDateTimeInput,
  PanelState,
  toDateTimeInput,
  ToggleRow,
  useSheetSession,
} from '../admin-shared';

const CATEGORIES = Object.keys(eventCategoryRegistry) as TEventCategory[];

const CATEGORY_OPTIONS: readonly ISegmentedOption<TEventCategory>[] =
  CATEGORIES.map((category) => ({
    value: category,
    label: uiText.events.categories[category],
    icon: eventCategoryRegistry[category].icon,
  }));

/** Next full hour: the default start of a new event. */
const nextHour = (now: Date) => {
  const date = new Date(now);
  date.setMinutes(0, 0, 0);
  return addMinutes(date, 60).getTime();
};

const EventForm: FC<{ event: ICompanyEvent | null; onDone: () => void }> = ({
  event,
  onDone,
}) => {
  const t = uiText.admin.events;
  const now = useNow();
  // Captured once, so the defaults do not move while the form is open.
  const [defaultStart] = useState(() => nextHour(now));
  const [title, setTitle] = useState(event?.title ?? ``);
  const [description, setDescription] = useState(event?.description ?? ``);
  const [category, setCategory] = useState<TEventCategory>(
    event?.category ?? `meeting`,
  );
  const [start, setStart] = useState(
    toDateTimeInput(event?.startsAt ?? defaultStart),
  );
  const [end, setEnd] = useState(
    toDateTimeInput(event?.endsAt ?? defaultStart + 60 * 60_000),
  );
  const [isAllDay, setAllDay] = useState(event?.isAllDay ?? false);
  const [location, setLocation] = useState(event?.location ?? ``);
  const [organizer, setOrganizer] = useState(event?.organizer ?? ``);
  const [isSubmitted, setSubmitted] = useState(false);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const startsAt = fromDateTimeInput(start);
  const endsAt = fromDateTimeInput(end);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (
      !title.trim() ||
      startsAt === null ||
      endsAt === null ||
      endsAt <= startsAt
    ) {
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      startsAt,
      endsAt,
      isAllDay,
      location: location.trim(),
      organizer: organizer.trim(),
    };
    try {
      if (event) {
        await updateEvent.mutateAsync({ id: event.id, payload });
        notify.success(uiText.admin.saved);
      } else {
        await createEvent.mutateAsync(payload);
        notify.success(uiText.admin.created);
      }
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  const isTimeInvalid =
    isSubmitted && (startsAt === null || endsAt === null || endsAt <= startsAt);

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label={t.title}
        value={title}
        onChange={setTitle}
        maxLength={200}
        isRequired
        isInvalid={isSubmitted && !title.trim()}
        errorMessage={uiText.admin.required}
      />
      <TextField
        label={t.description}
        value={description}
        onChange={setDescription}
        maxLength={4000}
        isMultiline
      />
      <div className="flex flex-col gap-2">
        <p className="typo-s1 text-fg-secondary">{t.category}</p>
        <div className="-mx-1 scrollbar-none overflow-x-auto px-1 pb-1">
          <SegmentedControl
            aria-label={t.category}
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            size="sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateTimeField
          label={t.startsAt}
          value={start}
          onChange={setStart}
          isInvalid={isTimeInvalid}
        />
        <DateTimeField
          label={t.endsAt}
          value={end}
          onChange={setEnd}
          isInvalid={isTimeInvalid}
        />
      </div>
      {isTimeInvalid && (
        <p role="alert" className="typo-b2 text-danger-600">
          {t.invalidTime}
        </p>
      )}
      <ToggleRow
        label={t.isAllDay}
        icon="calendar"
        isSelected={isAllDay}
        onChange={setAllDay}
      />
      <TextField
        label={t.location}
        value={location}
        onChange={setLocation}
        maxLength={200}
      />
      <TextField
        label={t.organizer}
        description={t.organizerHint}
        value={organizer}
        onChange={setOrganizer}
        maxLength={200}
      />
      <div className="pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={createEvent.isPending || updateEvent.isPending}
          onPress={handleSubmit}
        >
          {uiText.save}
        </Button>
      </div>
    </div>
  );
};

/** Company events: create, edit and delete. */
export const EventsPanel: FC = () => {
  const t = uiText.admin.events;
  const now = useNow();
  const events = useAdminEvents();
  const deleteEvent = useDeleteEvent();
  const form = useSheetSession<ICompanyEvent>();
  const removal = useSheetSession<ICompanyEvent>();

  const handleDelete = async () => {
    if (!removal.item) return;
    try {
      await deleteEvent.mutateAsync(removal.item.id);
      notify.success(uiText.admin.deleted);
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          startIcon="plus"
          onPress={() => form.open(null)}
        >
          {t.add}
        </Button>
      </div>

      <PanelState
        isPending={events.isPending}
        isError={events.isError}
        isEmpty={(events.data?.length ?? 0) === 0}
        onRetry={() => events.refetch()}
        isRetrying={events.isFetching}
      >
        <ul className="flex flex-col gap-3">
          {events.data?.map((event) => {
            const definition = eventCategoryRegistry[event.category];
            const isPast = event.endsAt <= now.getTime();
            return (
              <Surface as="li" key={event.id} padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate typo-s1 text-fg-primary">
                      {event.title}
                    </p>
                    <p className="typo-c1 text-fg-tertiary">
                      {formatDateTime(event.startsAt, now)}
                      {event.location && ` · ${event.location}`}
                    </p>
                    <p className="typo-c1 text-fg-tertiary">
                      {fillTemplate(uiText.events.attendees, {
                        count: formatNumber(event.attendeesCount),
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={definition.tone} icon={definition.icon}>
                      {uiText.events.categories[event.category]}
                    </Badge>
                    {isPast && (
                      <Badge tone="neutral">{uiText.events.past}</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    startIcon="edit"
                    onPress={() => form.open(event)}
                  >
                    {uiText.admin.edit}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    startIcon="trash"
                    onPress={() => removal.open(event)}
                  >
                    {uiText.admin.delete}
                  </Button>
                </div>
              </Surface>
            );
          })}
        </ul>
      </PanelState>

      <Sheet
        title={form.item ? t.editTitle : t.createTitle}
        isOpen={form.isOpen}
        onOpenChange={form.onOpenChange}
      >
        <EventForm
          key={form.sessionKey}
          event={form.item}
          onDone={() => form.onOpenChange(false)}
        />
      </Sheet>
      <ConfirmDialog
        isOpen={removal.isOpen}
        onOpenChange={removal.onOpenChange}
        title={t.deleteTitle}
        message={fillTemplate(t.deleteMessage, {
          title: removal.item?.title ?? ``,
        })}
        confirmLabel={uiText.admin.delete}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

EventsPanel.displayName = `EventsPanel`;
