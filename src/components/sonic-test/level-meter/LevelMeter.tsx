import React, { FC } from 'react';
import clsx from 'clsx';
import { localizeDigits } from '@/lib/utils';
import { ILevelMeterProps } from './interface';

const FILL_STYLES = {
  primary: `bg-primary-500`,
  success: `bg-success-500`,
} as const;

/** Labelled horizontal meter (input level, progress) backed by `<progress>`. */
export const LevelMeter: FC<ILevelMeterProps> = ({
  value,
  label,
  tone = `primary`,
}) => {
  const ratio = Math.min(1, Math.max(0, value));
  const percent = Math.round(ratio * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between typo-c1 text-fg-tertiary">
        <span>{label}</span>
        <span className="tabular-nums">{localizeDigits(percent)}٪</span>
      </div>
      <progress
        className="sr-only"
        max={100}
        value={percent}
        aria-label={label}
      />
      <div
        aria-hidden
        className="h-2 overflow-hidden rounded-full bg-default-300/60"
      >
        <div
          className={clsx(
            `h-full rounded-full transition-[width] duration-100 ease-linear`,
            FILL_STYLES[tone],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

LevelMeter.displayName = `LevelMeter`;

export default LevelMeter;
