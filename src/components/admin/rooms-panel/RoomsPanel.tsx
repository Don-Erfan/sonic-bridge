'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useAdminRooms, useDeleteRoom } from '@/hooks';
import { Icon } from '@/icons';
import { formatNumber } from '@/lib/utils';
import type { IAdminRoom } from '@/services';
import { Button, ConfirmDialog, notify, Surface } from '../../base';
import { AMENITY_ICON } from '../../rooms/room-card/constants';
import { PanelState, useSheetSession } from '../admin-shared';
import { RoomFormSheet } from './RoomFormSheet';

/** Meeting rooms: name, floor, capacity and amenities. */
export const RoomsPanel: FC = () => {
  const t = uiText.admin.rooms;
  const rooms = useAdminRooms();
  const deleteRoom = useDeleteRoom();
  const form = useSheetSession<IAdminRoom>();
  const removal = useSheetSession<IAdminRoom>();

  const handleDelete = async () => {
    if (!removal.item) return;
    try {
      await deleteRoom.mutateAsync(removal.item.id);
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
        isPending={rooms.isPending}
        isError={rooms.isError}
        isEmpty={(rooms.data?.length ?? 0) === 0}
        onRetry={() => rooms.refetch()}
        isRetrying={rooms.isFetching}
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {rooms.data?.map((room) => (
            <Surface as="li" key={room.id} padding="md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="truncate typo-s1 text-fg-primary">
                    {room.name}
                  </p>
                  <p className="typo-b2 text-fg-secondary">
                    {fillTemplate(t.summary, {
                      floor: formatNumber(room.floor),
                      capacity: formatNumber(room.capacity),
                    })}
                  </p>
                </div>
                <ul
                  className="flex shrink-0 gap-1.5 text-fg-tertiary"
                  aria-label={uiText.rooms.amenitiesLabel}
                >
                  {room.amenities.map((amenity) => (
                    <li key={amenity} title={uiText.rooms.amenities[amenity]}>
                      <Icon name={AMENITY_ICON[amenity]} size={18} />
                      <span className="sr-only">
                        {uiText.rooms.amenities[amenity]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  startIcon="edit"
                  onPress={() => form.open(room)}
                >
                  {uiText.admin.edit}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  startIcon="trash"
                  onPress={() => removal.open(room)}
                >
                  {uiText.admin.delete}
                </Button>
              </div>
            </Surface>
          ))}
        </ul>
      </PanelState>

      <RoomFormSheet
        room={form.item}
        isOpen={form.isOpen}
        onOpenChange={form.onOpenChange}
        sessionKey={form.sessionKey}
      />
      <ConfirmDialog
        isOpen={removal.isOpen}
        onOpenChange={removal.onOpenChange}
        title={t.deleteTitle}
        message={fillTemplate(t.deleteMessage, {
          name: removal.item?.name ?? ``,
        })}
        confirmLabel={uiText.admin.delete}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

RoomsPanel.displayName = `RoomsPanel`;
