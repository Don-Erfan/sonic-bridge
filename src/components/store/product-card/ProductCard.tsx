'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { purchaseValidator } from '@/lib/coins';
import { formatNumber } from '@/lib/utils';
import { Badge, Button, CoinAmount, Surface } from '../../base';
import { ProductVisual } from '../product-visual';
import { describePurchaseFailure, toPurchaseContext } from '../purchase-rules';
import { IProductCardProps } from './interface';

/**
 * Store tile: product, price and stock. The buy button is enabled only when
 * the purchase rules pass for one unit, and says why when they do not.
 *
 * @example
 * <ProductCard product={product} balance={wallet.balance} onBuy={open} />
 */
export const ProductCard: FC<IProductCardProps> = ({
  product,
  balance,
  onBuy,
}) => {
  const context = toPurchaseContext(product, balance ?? 0);
  const failure =
    balance === undefined ? null : purchaseValidator.validate(context);
  const isOutOfStock = product.stock <= 0;
  const titleId = `product-${product.id}-title`;

  return (
    <Surface
      as="article"
      padding="sm"
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-3"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-20 shadow-neu-inset">
        <ProductVisual
          imageUrl={product.imageUrl}
          emoji={product.emoji}
          className="size-full"
        />
        {isOutOfStock && (
          <span className="absolute start-2 top-2">
            <Badge tone="danger">{uiText.store.outOfStock}</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-1">
        <h3 id={titleId} className="line-clamp-2 typo-s1 text-fg-primary">
          {product.name}
        </h3>
        <CoinAmount amount={product.price} size="md" isCompact={false} />
        {!isOutOfStock && (
          <p className="typo-c1 text-fg-tertiary">
            {fillTemplate(uiText.store.stock, {
              count: formatNumber(product.stock),
            })}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          isFullWidth
          isDisabled={balance === undefined || failure !== null}
          onPress={() => onBuy(product)}
          aria-describedby={failure ? `${titleId}-reason` : undefined}
        >
          {uiText.store.buy}
        </Button>
        {failure && failure !== `out-of-stock` && (
          <p id={`${titleId}-reason`} className="px-1 typo-c1 text-fg-tertiary">
            {describePurchaseFailure(failure, context)}
          </p>
        )}
      </div>
    </Surface>
  );
};

ProductCard.displayName = `ProductCard`;

export default ProductCard;
