'use client';
import React, { FC, useState } from 'react';
import clsx from 'clsx';
import { resolveMediaUrl } from '@/lib/utils';
import { IProductVisualProps } from './interface';

/**
 * A product's picture: its uploaded image, or its emoji when there is none
 * or the image fails to load. Decorative (`alt=""`): the product name is
 * always shown next to it.
 *
 * @example
 * <ProductVisual imageUrl={product.imageUrl} emoji={product.emoji} />
 */
export const ProductVisual: FC<IProductVisualProps> = ({
  imageUrl,
  emoji,
  emojiClassName = `text-5xl`,
  className,
}) => {
  const url = resolveMediaUrl(imageUrl);
  // Remembers which URL failed, so a newly uploaded image is tried again.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = url !== null && url !== failedUrl;

  return (
    <span
      aria-hidden
      className={clsx(
        `flex items-center justify-center overflow-hidden`,
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- API-hosted user uploads; next/image would need every API origin whitelisted.
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <span className={clsx(`leading-none`, emojiClassName)}>{emoji}</span>
      )}
    </span>
  );
};

ProductVisual.displayName = `ProductVisual`;

export default ProductVisual;
