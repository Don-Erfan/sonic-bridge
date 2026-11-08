import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, ICredentials } from '@/services';

/** Signs in and stores the session cookies. */
export const useLogin = () =>
  useMutation({
    mutationFn: (credentials: ICredentials) => authService.login(credentials),
  });

/**
 * Signs out and drops every cached query, so nothing of the previous
 * session can be shown to the next person using the device.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => queryClient.clear(),
  });
};
