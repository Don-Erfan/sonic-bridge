'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useAdminProducts, useDeleteProduct } from '@/hooks';
import { formatNumber } from '@/lib/utils';
import type { IAdminProduct } from '@/services';
import { Badge, Button, ConfirmDialog, notify, Surface } from '../../base';
import { ProductVisual } from '../../store';
import { PanelState, useSheetSession } from '../admin-shared';
import { ProductFormSheet } from './ProductFormSheet';

/** Store catalogue: products, prices, stock, pictures and visibility. */
export const ProductsPanel: FC = () => {
  const t = uiText.admin.products;
  const products = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const form = useSheetSession<IAdminProduct>();
  const removal = useSheetSession<IAdminProduct>();
  const toDelete = removal.item;

  const latest = (product: IAdminProduct | null) =>
    product
      ? (products.data?.find((p) => p.id === product.id) ?? product)
      : null;

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProduct.mutateAsync(toDelete.id);
      notify.success(uiText.admin.deleted);
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          startIcon="plus"
          onPress={() => form.open(null)}
        >
          {t.add}
        </Button>
      </div>

      <PanelState
        isPending={products.isPending}
        isError={products.isError}
        isEmpty={(products.data?.length ?? 0) === 0}
        onRetry={() => products.refetch()}
        isRetrying={products.isFetching}
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {products.data?.map((product) => (
            <Surface as="li" key={product.id} padding="md">
              <div className="flex items-start gap-3">
                <ProductVisual
                  imageUrl={product.imageUrl}
                  emoji={product.emoji}
                  emojiClassName="text-3xl"
                  className="size-16 shrink-0 rounded-20 shadow-neu-inset"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate typo-s1 text-fg-primary">
                      {product.name}
                    </p>
                    {!product.isActive && (
                      <Badge tone="neutral">{uiText.admin.inactive}</Badge>
                    )}
                    {product.stock <= 0 && (
                      <Badge tone="danger">{uiText.store.outOfStock}</Badge>
                    )}
                  </div>
                  <p className="typo-c1 text-fg-tertiary">
                    {uiText.store.categories[product.category]}
                  </p>
                  <p className="typo-b2 text-fg-secondary">
                    {fillTemplate(t.summary, {
                      price: formatNumber(product.price),
                      stock: formatNumber(product.stock),
                      sold: formatNumber(product.soldUnits),
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  startIcon="edit"
                  onPress={() => form.open(product)}
                >
                  {uiText.admin.edit}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  startIcon="trash"
                  onPress={() => removal.open(product)}
                >
                  {uiText.admin.delete}
                </Button>
              </div>
            </Surface>
          ))}
        </ul>
      </PanelState>

      <ProductFormSheet
        product={latest(form.item)}
        isOpen={form.isOpen}
        onOpenChange={form.onOpenChange}
        sessionKey={form.sessionKey}
      />
      <ConfirmDialog
        isOpen={removal.isOpen}
        onOpenChange={removal.onOpenChange}
        title={t.deleteTitle}
        message={fillTemplate(t.deleteMessage, { name: toDelete?.name ?? `` })}
        confirmLabel={uiText.admin.delete}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

ProductsPanel.displayName = `ProductsPanel`;
