'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import { Spinner } from '@heroui/react';
import { uiText } from '@/config';
import { LogoMark } from '@/icons';
import { ILoadingProps } from './interface';

/**
 * Loading indicator: the Ozone mark in a raised soft disc with a spinner,
 * exposed as a status region (`<output>`).
 *
 * @example
 * <Loading isFullPage />
 */
export const Loading: FC<ILoadingProps> = ({
  'aria-label': ariaLabel = uiText.loading,
  isFullPage = false,
}) => (
  <output
    aria-label={ariaLabel}
    className={clsx(
      `flex flex-col items-center justify-center gap-4`,
      isFullPage ? `min-h-[60dvh]` : `py-10`,
    )}
  >
    <span className="flex size-16 items-center justify-center rounded-full bg-neu shadow-neu">
      <LogoMark size={34} />
    </span>
    <Spinner color="accent" size="sm" />
  </output>
);

Loading.displayName = `Loading`;

export default Loading;
