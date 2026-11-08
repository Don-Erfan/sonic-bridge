'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useNow } from '@/hooks';
import { formatLongDate } from '@/lib/utils';
import { greetingFor } from './constants';
import { IGreetingProps } from './interface';

/**
 * Time-of-day greeting and today's date (Solar Hijri) — the home page `h1`.
 *
 * @example
 * <Greeting name="سارا" />
 */
export const Greeting: FC<IGreetingProps> = ({ name }) => {
  const now = useNow();

  return (
    <div className="flex flex-col gap-1 px-1 pt-2">
      <h1 className="typo-h1 text-fg-primary">
        {greetingFor(now.getHours())}، {name}
      </h1>
      <p className="typo-b1 text-fg-tertiary">
        {fillTemplate(uiText.home.subtitle, { date: formatLongDate(now) })}
      </p>
    </div>
  );
};

Greeting.displayName = `Greeting`;

export default Greeting;
