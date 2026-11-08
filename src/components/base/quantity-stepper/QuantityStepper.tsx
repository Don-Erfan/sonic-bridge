'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { formatNumber } from '@/lib/utils';
import { IconButton } from '../icon-button';
import { IQuantityStepperProps } from './interface';

/**
 * Minus / value / plus stepper with large touch targets. The value is a
 * live region, so screen-reader users hear each change.
 *
 * @example
 * <QuantityStepper aria-label="تعداد" value={qty} max={3} onChange={setQty} />
 */
export const QuantityStepper: FC<IQuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max,
  'aria-label': ariaLabel,
  isDisabled = false,
}) => (
  <fieldset className="inline-flex items-center gap-3 rounded-full p-1.5 shadow-neu-inset">
    <legend className="sr-only">{ariaLabel}</legend>
    <IconButton
      icon="minus"
      size="sm"
      aria-label={uiText.decrease}
      isDisabled={isDisabled || value <= min}
      onPress={() => onChange(Math.max(min, value - 1))}
    />
    <output
      aria-live="polite"
      className="min-w-8 text-center typo-h3 text-fg-primary tabular-nums"
    >
      {formatNumber(value)}
    </output>
    <IconButton
      icon="plus"
      size="sm"
      aria-label={uiText.increase}
      isDisabled={isDisabled || value >= max}
      onPress={() => onChange(Math.min(max, value + 1))}
    />
  </fieldset>
);

QuantityStepper.displayName = `QuantityStepper`;

export default QuantityStepper;
