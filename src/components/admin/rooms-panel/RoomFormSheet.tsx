'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useCreateRoom, useUpdateRoom } from '@/hooks';
import type { IAdminRoom, TRoomAmenity } from '@/services';
import { Button, notify, Sheet, TextField } from '../../base';
import { AMENITY_ICON } from '../../rooms/room-card/constants';
import { parseInteger, ToggleRow } from '../admin-shared';

/** Every amenity, in the order the room cards show them. */
const AMENITIES = Object.keys(AMENITY_ICON) as TRoomAmenity[];

export interface IRoomFormSheetProps {
  /** `null` = a new room. */
  room: IAdminRoom | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sessionKey: number;
}

const RoomForm: FC<{ room: IAdminRoom | null; onDone: () => void }> = ({
  room,
  onDone,
}) => {
  const t = uiText.admin.rooms;
  const [name, setName] = useState(room?.name ?? ``);
  const [floor, setFloor] = useState(String(room?.floor ?? `0`));
  const [capacity, setCapacity] = useState(String(room?.capacity ?? ``));
  const [sortOrder, setSortOrder] = useState(String(room?.sortOrder ?? `0`));
  const [amenities, setAmenities] = useState<TRoomAmenity[]>(
    room?.amenities ?? [],
  );
  const [isSubmitted, setSubmitted] = useState(false);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const parsedFloor = parseInteger(floor);
  const parsedCapacity = parseInteger(capacity);
  const parsedSort = parseInteger(sortOrder);
  const invalid = {
    name: !name.trim(),
    floor: parsedFloor === null,
    capacity: parsedCapacity === null || parsedCapacity < 1,
    sort: parsedSort === null,
  };
  const show = (key: keyof typeof invalid) => isSubmitted && invalid[key];

  const toggleAmenity = (amenity: TRoomAmenity, isOn: boolean) =>
    setAmenities((current) =>
      // Kept in the canonical order, whatever the click order.
      AMENITIES.filter((a) => (a === amenity ? isOn : current.includes(a))),
    );

  const handleSubmit = async () => {
    setSubmitted(true);
    if (Object.values(invalid).some(Boolean)) return;
    const payload = {
      name: name.trim(),
      floor: parsedFloor ?? 0,
      capacity: parsedCapacity ?? 1,
      amenities,
      sortOrder: parsedSort ?? 0,
    };
    try {
      if (room) {
        await updateRoom.mutateAsync({ id: room.id, payload });
        notify.success(uiText.admin.saved);
      } else {
        await createRoom.mutateAsync(payload);
        notify.success(uiText.admin.created);
      }
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label={t.name}
        value={name}
        onChange={setName}
        maxLength={64}
        isRequired
        isInvalid={show(`name`)}
        errorMessage={uiText.admin.required}
      />
      <div className="grid grid-cols-3 gap-4">
        <TextField
          label={t.floor}
          inputMode="numeric"
          value={floor}
          onChange={setFloor}
          isInvalid={show(`floor`)}
          errorMessage={uiText.admin.invalidNumber}
        />
        <TextField
          label={t.capacity}
          inputMode="numeric"
          value={capacity}
          onChange={setCapacity}
          isRequired
          isInvalid={show(`capacity`)}
          errorMessage={uiText.admin.invalidNumber}
        />
        <TextField
          label={t.sortOrder}
          inputMode="numeric"
          value={sortOrder}
          onChange={setSortOrder}
          isInvalid={show(`sort`)}
          errorMessage={uiText.admin.invalidNumber}
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 typo-s1 text-fg-secondary">
          {t.amenities}
        </legend>
        {AMENITIES.map((amenity) => (
          <ToggleRow
            key={amenity}
            label={uiText.rooms.amenities[amenity]}
            icon={AMENITY_ICON[amenity]}
            isSelected={amenities.includes(amenity)}
            onChange={(isOn) => toggleAmenity(amenity, isOn)}
          />
        ))}
      </fieldset>
      <div className="pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={createRoom.isPending || updateRoom.isPending}
          onPress={handleSubmit}
        >
          {uiText.save}
        </Button>
      </div>
    </div>
  );
};

/** Create or edit a meeting room. */
export const RoomFormSheet: FC<IRoomFormSheetProps> = ({
  room,
  isOpen,
  onOpenChange,
  sessionKey,
}) => (
  <Sheet
    title={
      room
        ? fillTemplate(uiText.admin.rooms.editTitle, { name: room.name })
        : uiText.admin.rooms.createTitle
    }
    isOpen={isOpen}
    onOpenChange={onOpenChange}
  >
    <RoomForm key={sessionKey} room={room} onDone={() => onOpenChange(false)} />
  </Sheet>
);

RoomFormSheet.displayName = `RoomFormSheet`;
