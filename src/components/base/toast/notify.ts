import { toast } from '@heroui/react';
import { uiText } from '@/config';
import { getErrorMessage } from '@/services';
import { INotify, INotifyOptions } from './interface';

/** Adapts the app's option shape to HeroUI's (`action` → `actionProps`). */
const toHeroUIOptions = ({ action, ...options }: INotifyOptions = {}) => ({
  ...options,
  ...(action && {
    actionProps: { children: action.label, onPress: action.onPress },
  }),
});

/**
 * Notification Facade over HeroUI's global toast queue — the one API the app
 * uses to raise a toast from anywhere (components, hooks, callbacks).
 * Rendering lives in `Toaster`.
 *
 * @example
 * notify.success(`ذخیره شد`);
 * notify.error(error, uiText.errors.generic);
 */
export const notify: INotify = {
  danger: (title, options) => toast.danger(title, toHeroUIOptions(options)),
  warning: (title, options) => toast.warning(title, toHeroUIOptions(options)),
  info: (title, options) => toast.info(title, toHeroUIOptions(options)),
  success: (title, options) => toast.success(title, toHeroUIOptions(options)),
  error: (error, fallback = uiText.errors.generic) =>
    toast.danger(uiText.errors.title, {
      description: getErrorMessage(error, fallback),
    }),
  dismiss: (id) => toast.close(id),
  clear: () => toast.clear(),
};
