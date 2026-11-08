'use client';
import React, { FC } from 'react';
import type { Key, Selection } from 'react-aria-components';
import { ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { uiText } from '@/config';
import { MOOD_KEYS, moodRegistry, TMoodKey } from '@/lib/mood';
import { IMoodPickerProps } from './interface';

/**
 * Emoji grid to pick a mood — HeroUI `ToggleButtonGroup` (single choice,
 * arrow keys). Each option shows the emoji *and* its name.
 *
 * @example
 * <MoodPicker aria-label="حالتان را انتخاب کنید" value={key} onChange={setKey} />
 */
export const MoodPicker: FC<IMoodPickerProps> = ({
  value,
  onChange,
  'aria-label': ariaLabel,
}) => {
  const handleSelectionChange = (keys: Selection) => {
    if (keys === `all`) return;
    const [next] = keys as Set<Key>;
    if (next !== undefined) onChange(next as TMoodKey);
  };

  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      isDetached
      selectedKeys={value ? [value] : []}
      onSelectionChange={handleSelectionChange}
      className="grid w-full grid-cols-4 gap-2 min-[360px]:gap-3"
    >
      {MOOD_KEYS.map((key) => (
        <ToggleButton
          key={key}
          id={key}
          className="flex h-auto w-full min-w-0 flex-col gap-1 rounded-20 border border-neu-outline px-1 py-2.5 shadow-neu-sm transition-[box-shadow,color] duration-200 [--toggle-button-bg-hover:var(--neu-base)] [--toggle-button-bg-pressed:var(--neu-base)] [--toggle-button-bg-selected-hover:var(--neu-base)] [--toggle-button-bg-selected-pressed:var(--neu-base)] [--toggle-button-bg-selected:var(--neu-base)] [--toggle-button-bg:var(--neu-base)] [--toggle-button-fg-selected:var(--accent-fg)] [--toggle-button-fg:var(--fg-secondary)] data-focus-visible:ring-2 data-focus-visible:ring-primary-500 data-pressed:transform-none data-selected:shadow-neu-pressed data-selected:ring-2 data-selected:ring-primary-400"
        >
          <span aria-hidden className="text-2xl leading-none">
            {moodRegistry[key].emoji}
          </span>
          <span className="text-center typo-c1 whitespace-normal">
            {uiText.mood.labels[key]}
          </span>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

MoodPicker.displayName = `MoodPicker`;

export default MoodPicker;
