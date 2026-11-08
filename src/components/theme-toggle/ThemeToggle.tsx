'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { useTheme } from '@/hooks';
import { IconButton } from '../base';
import { IThemeToggleProps } from './interface';

/**
 * One-tap light / dark switch for the header. Disabled until the theme is
 * known on the client, so server HTML and hydration always match.
 *
 * @example
 * <ThemeToggle />
 */
export const ThemeToggle: FC<IThemeToggleProps> = ({ size = `sm` }) => {
  const { resolvedTheme, setMode } = useTheme();
  const isDark = resolvedTheme === `dark`;

  return (
    <IconButton
      icon={isDark ? `sun` : `moon`}
      size={size}
      aria-label={
        isDark ? uiText.theme.toggleToLight : uiText.theme.toggleToDark
      }
      isDisabled={!resolvedTheme}
      onPress={() => setMode(isDark ? `light` : `dark`)}
    />
  );
};

ThemeToggle.displayName = `ThemeToggle`;

export default ThemeToggle;
