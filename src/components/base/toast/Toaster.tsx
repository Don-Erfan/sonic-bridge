'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import { Button as HeroUIButton, Toast as HeroUIToast } from '@heroui/react';
import { uiText } from '@/config';
import { Icon } from '@/icons';
import { IToasterProps } from './interface';
import {
  toastAccentStyles,
  toastActionStyles,
  toastCloseStyles,
  toastContentStyles,
  toastDescriptionStyles,
  toastIconWrapStyles,
  toastRootStyles,
  toastTitleStyles,
} from './classes';
import {
  TOAST_GAP,
  TOAST_WIDTH,
  toastIcon,
  toastVariantFromHeroUI,
} from './constants';

/**
 * Toast region — HeroUI `Toast.Provider` (stacking, pause on hover/focus,
 * F6 landmark, live-region announcements). Mount once (see `Providers`);
 * raise toasts with `notify`.
 */
export const Toaster: FC<IToasterProps> = ({
  placement = `top`,
  maxVisibleToasts = 3,
}) => (
  <HeroUIToast.Provider
    placement={placement}
    width={TOAST_WIDTH}
    gap={TOAST_GAP}
    maxVisibleToasts={maxVisibleToasts}
    aria-label={uiText.notifications}
    className="pt-[env(safe-area-inset-top)]"
  >
    {({ toast: item }) => {
      const content = item.content;
      const variant = toastVariantFromHeroUI[content.variant ?? `default`];

      return (
        <HeroUIToast
          toast={item}
          variant={content.variant}
          className={toastRootStyles}
        >
          <span
            className={clsx(toastIconWrapStyles, toastAccentStyles[variant])}
          >
            <Icon name={toastIcon[variant]} size={18} />
          </span>
          <HeroUIToast.Content className={toastContentStyles}>
            {content.title && (
              <HeroUIToast.Title className={toastTitleStyles}>
                {content.title}
              </HeroUIToast.Title>
            )}
            {content.description && (
              <HeroUIToast.Description className={toastDescriptionStyles}>
                {content.description}
              </HeroUIToast.Description>
            )}
            {content.actionProps && (
              <HeroUIButton
                {...content.actionProps}
                size="sm"
                className={toastActionStyles}
              />
            )}
          </HeroUIToast.Content>
          <HeroUIToast.CloseButton
            aria-label={uiText.close}
            className={toastCloseStyles}
          >
            <Icon name="close" size={16} />
          </HeroUIToast.CloseButton>
        </HeroUIToast>
      );
    }}
  </HeroUIToast.Provider>
);

Toaster.displayName = `Toaster`;

export default Toaster;
