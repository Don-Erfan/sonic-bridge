'use client';
import React, { FC } from 'react';
import { ToggleButton } from '@heroui/react';
import { Icon, TIconName } from '@/icons';

export interface IToggleRowProps {
  label: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  icon?: TIconName;
  isDisabled?: boolean;
}

/**
 * A full-width on/off row (HeroUI `ToggleButton`, `aria-pressed`) with a
 * check mark — the app's soft-UI checkbox, as in the mood sheet.
 */
export const ToggleRow: FC<IToggleRowProps> = ({
  label,
  isSelected,
  onChange,
  icon,
  isDisabled,
}) => (
  <ToggleButton
    isSelected={isSelected}
    onChange={onChange}
    isDisabled={isDisabled}
    className="flex h-auto w-full items-center justify-between gap-3 rounded-20 border border-neu-outline px-4 py-3 text-start shadow-neu-sm [--toggle-button-bg-hover:var(--neu-base)] [--toggle-button-bg-pressed:var(--neu-base)] [--toggle-button-bg-selected-hover:var(--neu-base)] [--toggle-button-bg-selected-pressed:var(--neu-base)] [--toggle-button-bg-selected:var(--neu-base)] [--toggle-button-bg:var(--neu-base)] [--toggle-button-fg-selected:var(--fg-primary)] [--toggle-button-fg:var(--fg-secondary)] data-disabled:opacity-50 data-focus-visible:ring-2 data-focus-visible:ring-primary-500 data-pressed:transform-none"
  >
    <span className="flex items-center gap-3 typo-s1">
      {icon && <Icon name={icon} size={20} className="text-secondary-500" />}
      {label}
    </span>
    <span
      aria-hidden
      className={
        isSelected
          ? `flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white`
          : `size-6 shrink-0 rounded-full shadow-neu-inset-sm`
      }
    >
      {isSelected && <Icon name="check" size={16} strokeWidth={2.5} />}
    </span>
  </ToggleButton>
);

ToggleRow.displayName = `ToggleRow`;
