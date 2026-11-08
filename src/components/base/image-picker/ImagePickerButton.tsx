'use client';
import React, { ChangeEvent, FC, useRef } from 'react';
import { uiText } from '@/config';
import { ACCEPTED_IMAGE_TYPES, checkImageFile } from '@/lib/utils';
import { Button } from '../button';
import { notify } from '../toast';
import { IImagePickerButtonProps } from './interface';

/**
 * A button that opens the file picker for one image (JPEG, PNG or WebP, at
 * most 5 MB). Files that fail the pre-check are explained in a toast and
 * never reach `onPick`; the API checks the content again on upload.
 *
 * @example
 * <ImagePickerButton startIcon="camera" onPick={upload.mutate}>عکس جدید</ImagePickerButton>
 */
export const ImagePickerButton: FC<IImagePickerButtonProps> = ({
  onPick,
  isDisabled,
  isLoading,
  ...buttonProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // Reset so picking the same file again still fires `change`.
    input.value = ``;
    if (!file) return;

    const problem = checkImageFile(file);
    if (problem) {
      notify.danger(uiText.media.invalidTitle, {
        description: uiText.media.problems[problem],
      });
      return;
    }
    onPick(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(`,`)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleChange}
      />
      <Button
        {...buttonProps}
        isDisabled={isDisabled}
        isLoading={isLoading}
        onPress={() => inputRef.current?.click()}
      />
    </>
  );
};

ImagePickerButton.displayName = `ImagePickerButton`;

export default ImagePickerButton;
