import type { IButtonProps } from '../button';

export interface IImagePickerButtonProps extends Omit<IButtonProps, `onPress`> {
  /** Called with a file that passed the type and size pre-check. */
  onPick: (file: File) => void;
}
