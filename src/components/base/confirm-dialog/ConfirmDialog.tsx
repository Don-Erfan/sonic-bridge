'use client';
import React, { FC } from 'react';
import { AlertDialog } from '@heroui/react';
import { uiText } from '@/config';
import { useAsyncAction } from '@/hooks';
import { Button } from '../button';
import { IConfirmDialogProps } from './interface';
import {
  confirmDialogBackdropStyles,
  confirmDialogBodyStyles,
  confirmDialogFooterStyles,
  confirmDialogHeadingStyles,
  confirmDialogStyles,
} from './classes';

/**
 * Confirmation dialog — HeroUI `AlertDialog` (`alertdialog` role, focus on
 * the actions, not dismissed by a stray tap while pending).
 *
 * @example
 * <ConfirmDialog
 *   title="لغو رزرو"
 *   message="رزرو «هماهنگی» لغو شود؟"
 *   isOpen={isOpen}
 *   onOpenChange={setOpen}
 *   onConfirm={() => endBooking.mutateAsync(id)}
 * />
 */
export const ConfirmDialog: FC<IConfirmDialogProps> = ({
  title,
  message,
  isOpen,
  onOpenChange,
  onConfirm,
  confirmLabel = uiText.confirm,
  cancelLabel = uiText.cancel,
  tone = `danger`,
}) => {
  const { isPending, run } = useAsyncAction(onConfirm);

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop
        variant="opaque"
        isDismissable={!isPending}
        className={confirmDialogBackdropStyles}
      >
        <AlertDialog.Container placement="center">
          <AlertDialog.Dialog className={confirmDialogStyles}>
            {({ close }) => (
              <>
                <AlertDialog.Header className="p-0">
                  <AlertDialog.Heading className={confirmDialogHeadingStyles}>
                    {title}
                  </AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body className={confirmDialogBodyStyles}>
                  {message}
                </AlertDialog.Body>
                <AlertDialog.Footer className={confirmDialogFooterStyles}>
                  <Button
                    variant="secondary"
                    isDisabled={isPending}
                    onPress={close}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    variant={tone}
                    isLoading={isPending}
                    onPress={async () => {
                      if (await run()) close();
                    }}
                  >
                    {confirmLabel}
                  </Button>
                </AlertDialog.Footer>
              </>
            )}
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};

ConfirmDialog.displayName = `ConfirmDialog`;

export default ConfirmDialog;
