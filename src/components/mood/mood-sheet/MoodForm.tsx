'use client';
import React, { FC, useState } from 'react';
import { ToggleButton } from '@heroui/react';
import { fillTemplate, uiText } from '@/config';
import { IMoodSaveResult, useClearMood, useUpdateMood } from '@/hooks';
import { Icon } from '@/icons';
import {
  MOOD_NOTE_MAX_LENGTH,
  moodExpiryStrategies,
  moodRegistry,
  TAvailability,
  TMoodExpiry,
  TMoodKey,
} from '@/lib/mood';
import { countCharacters, formatNumber, truncateCharacters } from '@/lib/utils';
import { Button, notify, SegmentedControl, TextField } from '../../base';
import { MoodPicker } from '../mood-picker';
import {
  AVAILABILITY_OPTIONS,
  DEFAULT_EXPIRY,
  EXPIRY_OPTIONS,
} from './constants';
import { IMoodSheetProps } from './interface';

type TMoodFormProps = Omit<IMoodSheetProps, `isOpen` | `onOpenChange`> & {
  onDone: () => void;
};

/** Tells the user what happened to the save and to each sync target. */
const reportResult = ({ reports }: IMoodSaveResult, message: string) => {
  const failed = reports.find((report) => !report.ok);
  if (failed) {
    notify.warning(uiText.mood.syncFailed, { description: failed.message });
    return;
  }
  notify.success(message, {
    description: reports.length > 0 ? uiText.mood.synced : undefined,
  });
};

/**
 * The mood editor's state lives here, inside the sheet, so it unmounts with
 * the sheet and every opening starts from the current mood.
 */
export const MoodForm: FC<TMoodFormProps> = ({
  currentMood,
  initialKey,
  canSync,
  onDone,
}) => {
  const [moodKey, setMoodKey] = useState<TMoodKey | null>(
    initialKey ?? currentMood?.key ?? null,
  );
  const [note, setNote] = useState(currentMood?.note ?? ``);
  const [availability, setAvailability] = useState<TAvailability>(
    currentMood?.availability ?? `available`,
  );
  const [expiry, setExpiry] = useState<TMoodExpiry>(DEFAULT_EXPIRY);
  const [shouldSync, setShouldSync] = useState(canSync);

  const updateMood = useUpdateMood();
  const clearMood = useClearMood();
  const isBusy = updateMood.isPending || clearMood.isPending;

  const handleMoodChange = (key: TMoodKey) => {
    setMoodKey(key);
    // Picking a mood suggests an availability ("focused" → do not disturb);
    // the user can still change it afterwards.
    setAvailability(moodRegistry[key].suggestedAvailability);
  };

  const handleSubmit = async () => {
    if (!moodKey) return;
    try {
      const result = await updateMood.mutateAsync({
        key: moodKey,
        note: note.trim(),
        availability,
        // Resolved at submit time, so "1 hour" means one hour from *now*.
        expiresAt:
          moodExpiryStrategies[expiry](new Date())?.getTime() ?? null,
        shouldSync: canSync && shouldSync,
      });
      reportResult(result, uiText.mood.saved);
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  const handleClear = async () => {
    try {
      reportResult(await clearMood.mutateAsync(), uiText.mood.cleared);
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <MoodPicker
        aria-label={uiText.mood.pickLabel}
        value={moodKey}
        onChange={handleMoodChange}
      />

      <TextField
        label={uiText.mood.note}
        placeholder={uiText.mood.notePlaceholder}
        value={note}
        onChange={(value) =>
          setNote(truncateCharacters(value, MOOD_NOTE_MAX_LENGTH))
        }
        isMultiline
        rows={2}
        description={fillTemplate(uiText.mood.noteCounter, {
          count: formatNumber(countCharacters(note)),
          max: formatNumber(MOOD_NOTE_MAX_LENGTH),
        })}
      />

      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-2 typo-s1 text-fg-secondary">
          {uiText.mood.availability}
        </legend>
        <SegmentedControl
          aria-label={uiText.mood.availability}
          options={AVAILABILITY_OPTIONS}
          value={availability}
          onChange={setAvailability}
          isFullWidth
          size="sm"
        />
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-2 typo-s1 text-fg-secondary">
          {uiText.mood.expiry}
        </legend>
        <div className="-mx-5 scrollbar-none overflow-x-auto px-5 pb-2">
          <SegmentedControl
            aria-label={uiText.mood.expiry}
            options={EXPIRY_OPTIONS}
            value={expiry}
            onChange={setExpiry}
            size="sm"
          />
        </div>
      </fieldset>

      {canSync && (
        <ToggleButton
          isSelected={shouldSync}
          onChange={setShouldSync}
          className="flex h-auto w-full items-center justify-between gap-3 rounded-20 border border-neu-outline px-4 py-3 text-start shadow-neu-sm [--toggle-button-bg-hover:var(--neu-base)] [--toggle-button-bg-pressed:var(--neu-base)] [--toggle-button-bg-selected-hover:var(--neu-base)] [--toggle-button-bg-selected-pressed:var(--neu-base)] [--toggle-button-bg-selected:var(--neu-base)] [--toggle-button-bg:var(--neu-base)] [--toggle-button-fg-selected:var(--fg-primary)] [--toggle-button-fg:var(--fg-secondary)] data-focus-visible:ring-2 data-focus-visible:ring-primary-500 data-pressed:transform-none"
        >
          <span className="flex items-center gap-3 typo-s1">
            <Icon name="message" size={20} className="text-secondary-500" />
            {uiText.mood.syncToMattermost}
          </span>
          <span
            aria-hidden
            className={
              shouldSync
                ? `flex size-6 items-center justify-center rounded-full bg-primary-500 text-white`
                : `size-6 rounded-full shadow-neu-inset-sm`
            }
          >
            {shouldSync && <Icon name="check" size={16} strokeWidth={2.5} />}
          </span>
        </ToggleButton>
      )}

      <div className="flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={updateMood.isPending}
          isDisabled={!moodKey || isBusy}
          onPress={handleSubmit}
        >
          {canSync && shouldSync ? uiText.mood.save : uiText.save}
        </Button>
        {currentMood && (
          <Button
            variant="ghost"
            isFullWidth
            startIcon="trash"
            isLoading={clearMood.isPending}
            isDisabled={isBusy}
            onPress={handleClear}
          >
            {uiText.mood.clear}
          </Button>
        )}
      </div>
    </div>
  );
};

MoodForm.displayName = `MoodForm`;
