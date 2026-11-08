'use client';
import React from 'react';
import clsx from 'clsx';
import type { Key, Selection } from 'react-aria-components';
import { ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { Icon } from '@/icons';
import { formatNumber } from '@/lib/utils';
import { ISegmentedControlProps } from './interface';
import {
  segmentedCountStyles,
  segmentedFullWidthStyles,
  segmentedInlineStyles,
  segmentedOptionSizeStyles,
  segmentedOptionStyles,
  segmentedTrackStyles,
} from './classes';

/**
 * Single-choice segmented control — HeroUI `ToggleButtonGroup` (arrow-key
 * navigation, exactly one option selected) styled as a soft inset track
 * with a raised selected option.
 *
 * @example
 * <SegmentedControl
 *   aria-label="فیلتر"
 *   options={[{ value: `all`, label: `همه` }, { value: `in`, label: `در دفتر`, count: 9 }]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 */
export const SegmentedControl = <TValue extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  isFullWidth = false,
  isDisabled,
  size = `md`,
}: ISegmentedControlProps<TValue>) => {
  const handleSelectionChange = (keys: Selection) => {
    if (keys === `all`) return;
    const [next] = keys as Set<Key>;
    if (next !== undefined) onChange(next as TValue);
  };

  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      isDetached
      isDisabled={isDisabled}
      selectedKeys={value === null ? [] : [value]}
      onSelectionChange={handleSelectionChange}
      className={clsx(
        segmentedTrackStyles,
        isFullWidth ? segmentedFullWidthStyles : segmentedInlineStyles,
      )}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          id={option.value}
          className={clsx(
            segmentedOptionStyles,
            segmentedOptionSizeStyles[size],
          )}
        >
          {option.icon && <Icon name={option.icon} size={16} />}
          {option.label}
          {option.count !== undefined && (
            <span className={segmentedCountStyles}>
              {formatNumber(option.count)}
            </span>
          )}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

SegmentedControl.displayName = `SegmentedControl`;

export default SegmentedControl;
