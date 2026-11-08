'use client';
import React, { FC, useId } from 'react';

export interface IDateTimeFieldProps {
  label: string;
  /** `YYYY-MM-DDTHH:mm` (see `toDateTimeInput`). */
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

/**
 * Native date-and-time picker in the text-field well. Native so phones show
 * their own wheel; values are local (office) time.
 */
export const DateTimeField: FC<IDateTimeFieldProps> = ({
  label,
  value,
  onChange,
  isDisabled,
  isInvalid,
}) => {
  const id = useId();

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="typo-s1 text-fg-secondary">
        {label}
      </label>
      <input
        id={id}
        type="datetime-local"
        dir="ltr"
        value={value}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="h-12 w-full rounded-16 border border-neu-outline bg-neu px-4 text-base leading-6 text-fg-primary shadow-neu-inset transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-danger-500"
      />
    </div>
  );
};

DateTimeField.displayName = `DateTimeField`;
