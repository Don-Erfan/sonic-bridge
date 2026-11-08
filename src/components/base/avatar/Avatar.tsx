'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import { Avatar as HeroUIAvatar } from '@heroui/react';
import { getInitials, resolveMediaUrl } from '@/lib/utils';
import { IAvatarProps } from './interface';
import {
  avatarEmojiStyles,
  avatarFallbackTextStyles,
  avatarFrameStyles,
  avatarImageStyles,
  avatarPalette,
  avatarRootStyles,
  avatarSizeStyles,
  presenceDotSizeStyles,
  presenceDotStyles,
  presenceDotToneStyles,
} from './classes';

/** Stable palette index for a name (djb2-style string hash). */
const paletteIndex = (name: string): number => {
  let hash = 5381;
  for (const char of name) hash = (hash * 33) ^ char.charCodeAt(0);
  return Math.abs(hash) % avatarPalette.length;
};

/**
 * Person avatar — HeroUI `Avatar` (image with an initials fallback while
 * loading or on error) in a raised soft ring, with optional presence dot
 * and mood emoji. `src` may be an API media path (`/api/v1/media/…`);
 * it is resolved against the API origin. Always decorative (`aria-hidden`): it is placed next to
 * the visible name, or inside a control that carries an `aria-label`, so
 * assistive technology never announces a name twice.
 *
 * @example
 * <Avatar name="سارا احمدی" presence="in-office" emoji="🎧" />
 */
export const Avatar: FC<IAvatarProps> = ({
  name,
  src,
  size = `md`,
  presence,
  emoji,
}) => {
  const url = resolveMediaUrl(src);

  return (
    <span aria-hidden className={avatarRootStyles}>
      <span className={clsx(avatarFrameStyles, avatarSizeStyles[size])}>
        <HeroUIAvatar className="size-full">
          {url && (
            <HeroUIAvatar.Image
              src={url}
              alt=""
              className={avatarImageStyles}
            />
          )}
          <HeroUIAvatar.Fallback
            className={clsx(
              `size-full rounded-full`,
              avatarPalette[paletteIndex(name)],
              avatarFallbackTextStyles[size],
            )}
          >
            {getInitials(name)}
          </HeroUIAvatar.Fallback>
        </HeroUIAvatar>
      </span>
      {presence && (
        <span
          className={clsx(
            presenceDotStyles,
            presenceDotSizeStyles[size],
            presenceDotToneStyles[presence],
          )}
        />
      )}
      {emoji && <span className={avatarEmojiStyles}>{emoji}</span>}
    </span>
  );
};

Avatar.displayName = `Avatar`;

export default Avatar;
