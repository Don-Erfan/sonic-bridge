'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { useTheme } from '@/hooks';
import type { TThemeMode } from '@/lib/theme';
import { ISegmentedOption, SegmentedControl } from '../base';
import { IThemeSwitchProps } from './interface';

const THEME_OPTIONS: readonly ISegmentedOption<TThemeMode>[] = [
  { value: `light`, label: uiText.theme.light, icon: `sun` },
  { value: `dark`, label: uiText.theme.dark, icon: `moon` },
  { value: `system`, label: uiText.theme.system, icon: `monitor` },
];

/**
 * Light / dark / system theme picker bound to the theme store.
 *
 * @example
 * <ThemeSwitch />
 */
export const ThemeSwitch: FC<IThemeSwitchProps> = ({
  'aria-label': ariaLabel = uiText.theme.label,
}) => {
  const { mode, resolvedTheme, setMode } = useTheme();

  return (
    <SegmentedControl
      aria-label={ariaLabel}
      options={THEME_OPTIONS}
      value={mode}
      onChange={setMode}
      isDisabled={!resolvedTheme}
      isFullWidth
      size="sm"
    />
  );
};

ThemeSwitch.displayName = `ThemeSwitch`;

export default ThemeSwitch;
