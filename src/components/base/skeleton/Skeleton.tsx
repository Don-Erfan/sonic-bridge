'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import { Skeleton as HeroUISkeleton } from '@heroui/react';
import { ISkeletonProps } from './interface';

/**
 * Loading placeholder — HeroUI `Skeleton` (shimmer, honours reduced motion)
 * tinted for the soft-UI base. Hidden from assistive technology: announce
 * loading with the surrounding region's `aria-busy` instead.
 *
 * @example
 * <Skeleton className="h-4 w-32 rounded-full" />
 */
export const Skeleton: FC<ISkeletonProps> = ({ className }) => (
  <HeroUISkeleton
    aria-hidden
    className={clsx(`rounded-12 bg-default-200`, className)}
  />
);

Skeleton.displayName = `Skeleton`;

export default Skeleton;
