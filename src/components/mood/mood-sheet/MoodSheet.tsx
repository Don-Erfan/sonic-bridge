'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { Sheet } from '../../base';
import { IMoodSheetProps } from './interface';
import { MoodForm } from './MoodForm';

/**
 * Bottom sheet to set today's mood, availability and auto-clear time, and
 * mirror it to Mattermost.
 *
 * @example
 * <MoodSheet isOpen={isOpen} onOpenChange={setOpen} currentMood={mood} canSync />
 */
export const MoodSheet: FC<IMoodSheetProps> = ({
  isOpen,
  onOpenChange,
  ...formProps
}) => (
  <Sheet
    title={uiText.mood.sheetTitle}
    isOpen={isOpen}
    onOpenChange={onOpenChange}
  >
    <MoodForm {...formProps} onDone={() => onOpenChange(false)} />
  </Sheet>
);

MoodSheet.displayName = `MoodSheet`;

export default MoodSheet;
