'use client';
import React, { FC } from 'react';
import { Drawer } from '@heroui/react';
import { uiText } from '@/config';
import { IconButton } from '../icon-button';
import { ISheetProps } from './interface';
import {
  sheetBackdropStyles,
  sheetBodyStyles,
  sheetDialogStyles,
  sheetFooterStyles,
  sheetHandleStyles,
  sheetHeaderStyles,
  sheetHeadingStyles,
} from './classes';

/**
 * Mobile bottom sheet — HeroUI `Drawer` (dialog semantics, focus trap,
 * scroll lock, Escape, swipe-down to dismiss from the handle / header) with
 * a soft-UI panel. The app's default container for forms and pickers.
 *
 * Opened from state, never by a trigger button, so the open state goes on
 * the backdrop (React Aria's `ModalOverlay`) and the `Drawer` root is left
 * out: that root is a `DialogTrigger`, which warns ("PressResponder was
 * rendered without a pressable child") when it has no trigger to wrap.
 *
 * @example
 * <Sheet title="رزرو البرز" isOpen={isOpen} onOpenChange={setOpen} footer={<Button isFullWidth>رزرو</Button>}>
 *   …
 * </Sheet>
 */
export const Sheet: FC<ISheetProps> = ({
  title,
  isOpen,
  onOpenChange,
  children,
  footer,
  isDismissable = true,
  closeLabel = uiText.close,
}) => (
  <Drawer.Backdrop
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    variant="opaque"
    isDismissable={isDismissable}
    isKeyboardDismissDisabled={!isDismissable}
    className={sheetBackdropStyles}
  >
    <Drawer.Content placement="bottom">
      <Drawer.Dialog className={sheetDialogStyles}>
        <Drawer.Handle className={sheetHandleStyles} />
        <Drawer.Header className={sheetHeaderStyles}>
          <Drawer.Heading className={sheetHeadingStyles}>
            {title}
          </Drawer.Heading>
          <IconButton
            slot="close"
            icon="close"
            size="sm"
            aria-label={closeLabel}
            isDisabled={!isDismissable}
          />
        </Drawer.Header>
        <Drawer.Body className={sheetBodyStyles}>{children}</Drawer.Body>
        {footer && (
          <Drawer.Footer className={sheetFooterStyles}>{footer}</Drawer.Footer>
        )}
      </Drawer.Dialog>
    </Drawer.Content>
  </Drawer.Backdrop>
);

Sheet.displayName = `Sheet`;

export default Sheet;
