'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { useInstallPrompt } from '@/hooks';
import { Icon } from '@/icons';
import { Button, Surface } from '../../base';
import { IInstallAppCardProps } from './interface';

/**
 * "Install the app" card adapted to the device: the browser's install
 * dialog on Chromium, Add-to-Home-Screen steps on iOS, a confirmation when
 * already installed.
 *
 * @example
 * <InstallAppCard />
 */
export const InstallAppCard: FC<IInstallAppCardProps> = ({
  headingLevel = 2,
}) => {
  const { isInstalled, platform, prompt } = useInstallPrompt();
  const Heading = `h${headingLevel}` as const;

  const body = isInstalled ? (
    <p className="flex items-center gap-2 typo-b1 text-tone-success-fg">
      <Icon name="check-circle" size={18} />
      {uiText.install.installed}
    </p>
  ) : platform === `prompt` ? (
    <Button
      variant="primary"
      startIcon="download"
      onPress={() => void prompt()}
    >
      {uiText.install.action}
    </Button>
  ) : platform === `ios` ? (
    <p className="flex items-start gap-2 typo-b2 text-fg-secondary">
      <Icon
        name="share"
        size={18}
        className="mt-0.5 shrink-0 text-secondary-500"
      />
      {uiText.install.iosHint}
    </p>
  ) : (
    <p className="typo-b2 text-fg-tertiary">{uiText.install.unsupported}</p>
  );

  return (
    <Surface as="section" padding="lg" aria-labelledby="install-title">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-16 text-primary-500 shadow-neu-inset">
          <Icon name="download" size={22} />
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Heading id="install-title" className="typo-h3 text-fg-primary">
              {uiText.install.title}
            </Heading>
            {!isInstalled && (
              <p className="typo-b2 text-fg-tertiary">
                {uiText.install.description}
              </p>
            )}
          </div>
          {body}
        </div>
      </div>
    </Surface>
  );
};

InstallAppCard.displayName = `InstallAppCard`;

export default InstallAppCard;
