'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import {
  useCreateProduct,
  useRemoveProductImage,
  useUpdateProduct,
  useUploadProductImage,
} from '@/hooks';
import {
  PRODUCT_CATEGORIES,
  productCategoryIcons,
  TProductCategory,
} from '@/lib/store';
import type { IAdminProduct } from '@/services';
import {
  Button,
  ImagePickerButton,
  ISegmentedOption,
  notify,
  SegmentedControl,
  Sheet,
  TextField,
} from '../../base';
import { ProductVisual } from '../../store';
import { parseInteger, parseOptionalInteger, ToggleRow } from '../admin-shared';

const CATEGORY_OPTIONS: readonly ISegmentedOption<TProductCategory>[] =
  PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: uiText.store.categories[category],
    icon: productCategoryIcons[category],
  }));

export interface IProductFormSheetProps {
  /** `null` = a new product. */
  product: IAdminProduct | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sessionKey: number;
}

const ProductForm: FC<{
  product: IAdminProduct | null;
  onDone: () => void;
}> = ({ product, onDone }) => {
  const t = uiText.admin.products;
  const [name, setName] = useState(product?.name ?? ``);
  const [description, setDescription] = useState(product?.description ?? ``);
  const [category, setCategory] = useState<TProductCategory>(
    product?.category ?? `food`,
  );
  const [price, setPrice] = useState(String(product?.price ?? ``));
  const [stock, setStock] = useState(String(product?.stock ?? `0`));
  const [limit, setLimit] = useState(
    product?.perUserLimit === null || product?.perUserLimit === undefined
      ? ``
      : String(product.perUserLimit),
  );
  const [emoji, setEmoji] = useState(product?.emoji ?? `🎁`);
  const [sortOrder, setSortOrder] = useState(String(product?.sortOrder ?? `0`));
  const [isActive, setActive] = useState(product?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? null);
  const [isSubmitted, setSubmitted] = useState(false);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();
  const removeImage = useRemoveProductImage();

  const parsedPrice = parseInteger(price);
  const parsedStock = parseInteger(stock);
  const parsedSort = parseInteger(sortOrder);
  const parsedLimit = parseOptionalInteger(limit);
  const invalid = {
    name: !name.trim(),
    emoji: !emoji.trim(),
    price: parsedPrice === null || parsedPrice < 0,
    stock: parsedStock === null || parsedStock < 0,
    sort: parsedSort === null,
    limit: !parsedLimit.isValid || (parsedLimit.value ?? 1) < 1,
  };
  const show = (key: keyof typeof invalid) => isSubmitted && invalid[key];

  const handleSubmit = async () => {
    setSubmitted(true);
    if (Object.values(invalid).some(Boolean)) return;
    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      price: parsedPrice ?? 0,
      stock: parsedStock ?? 0,
      perUserLimit: parsedLimit.value,
      emoji: emoji.trim(),
      isActive,
      sortOrder: parsedSort ?? 0,
    };
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, payload });
        notify.success(uiText.admin.saved);
      } else {
        await createProduct.mutateAsync(payload);
        notify.success(uiText.admin.created);
      }
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  const handleUpload = (file: File) => {
    if (!product) return;
    uploadImage.mutate(
      { id: product.id, file },
      {
        onSuccess: (updated) => {
          setImageUrl(updated.imageUrl);
          notify.success(t.imageUpdated);
        },
        onError: (error) => notify.error(error),
      },
    );
  };

  const handleRemoveImage = () => {
    if (!product) return;
    removeImage.mutate(product.id, {
      onSuccess: () => {
        setImageUrl(null);
        notify.success(t.imageRemoved);
      },
      onError: (error) => notify.error(error),
    });
  };

  const isImageBusy = uploadImage.isPending || removeImage.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ProductVisual
          imageUrl={imageUrl}
          emoji={emoji || `🎁`}
          className="size-24 shrink-0 rounded-24 shadow-neu-inset"
        />
        <div className="flex flex-col gap-2">
          <p className="typo-s1 text-fg-secondary">{t.image}</p>
          {product ? (
            <div className="flex flex-wrap gap-2">
              <ImagePickerButton
                variant="secondary"
                size="sm"
                startIcon="image"
                isLoading={uploadImage.isPending}
                isDisabled={isImageBusy}
                onPick={handleUpload}
              >
                {imageUrl ? t.changeImage : t.addImage}
              </ImagePickerButton>
              {imageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  startIcon="trash"
                  isLoading={removeImage.isPending}
                  isDisabled={isImageBusy}
                  onPress={handleRemoveImage}
                >
                  {t.removeImage}
                </Button>
              )}
            </div>
          ) : (
            <p className="typo-c1 text-fg-tertiary">{t.imageAfterCreate}</p>
          )}
          <p className="typo-c1 text-fg-tertiary">{uiText.profile.photoHint}</p>
        </div>
      </div>

      <TextField
        label={t.name}
        value={name}
        onChange={setName}
        maxLength={128}
        isRequired
        isInvalid={show(`name`)}
        errorMessage={uiText.admin.required}
      />
      <TextField
        label={t.description}
        value={description}
        onChange={setDescription}
        maxLength={1024}
        isMultiline
      />
      <div className="flex flex-col gap-2">
        <p className="typo-s1 text-fg-secondary">{t.category}</p>
        <div className="-mx-1 scrollbar-none overflow-x-auto px-1 pb-1">
          <SegmentedControl
            aria-label={t.category}
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            size="sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label={t.price}
          inputMode="numeric"
          value={price}
          onChange={setPrice}
          isRequired
          isInvalid={show(`price`)}
          errorMessage={uiText.admin.invalidNumber}
        />
        <TextField
          label={t.stock}
          inputMode="numeric"
          value={stock}
          onChange={setStock}
          isRequired
          isInvalid={show(`stock`)}
          errorMessage={uiText.admin.invalidNumber}
        />
        <TextField
          label={t.perUserLimit}
          description={t.perUserLimitHint}
          inputMode="numeric"
          value={limit}
          onChange={setLimit}
          isInvalid={show(`limit`)}
          errorMessage={uiText.admin.invalidNumber}
        />
        <TextField
          label={t.sortOrder}
          inputMode="numeric"
          value={sortOrder}
          onChange={setSortOrder}
          isInvalid={show(`sort`)}
          errorMessage={uiText.admin.invalidNumber}
        />
      </div>
      <TextField
        label={t.emoji}
        description={t.emojiHint}
        value={emoji}
        onChange={setEmoji}
        maxLength={16}
        isRequired
        isInvalid={show(`emoji`)}
        errorMessage={uiText.admin.required}
      />
      <ToggleRow
        label={t.isActive}
        icon="bag"
        isSelected={isActive}
        onChange={setActive}
      />

      <div className="pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={createProduct.isPending || updateProduct.isPending}
          onPress={handleSubmit}
        >
          {uiText.save}
        </Button>
      </div>
    </div>
  );
};

/** Create or edit a store product, its price in coins and its picture. */
export const ProductFormSheet: FC<IProductFormSheetProps> = ({
  product,
  isOpen,
  onOpenChange,
  sessionKey,
}) => (
  <Sheet
    title={
      product
        ? fillTemplate(uiText.admin.products.editTitle, { name: product.name })
        : uiText.admin.products.createTitle
    }
    isOpen={isOpen}
    onOpenChange={onOpenChange}
  >
    <ProductForm
      key={sessionKey}
      product={product}
      onDone={() => onOpenChange(false)}
    />
  </Sheet>
);

ProductFormSheet.displayName = `ProductFormSheet`;
