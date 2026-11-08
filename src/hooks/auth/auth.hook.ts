import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, ICredentials } from '@/services';
import { releasePushSubscription } from '../push';

/** Signs in and stores the session cookies. */
export const useLogin = () =>
  useMutation({
    mutationFn: (credentials: ICredentials) => authService.login(credentials),
  });

/**
 * Signs out and drops every cached query, so nothing of the previous
 * session can be shown to the next person using the device. This
 * browser's notification subscription is removed first, while the request
 * is still authenticated.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await releasePushSubscription();
      await authService.logout();
    },
    onSettled: () => queryClient.clear(),
  });
};
