import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileKeys, staffKeys } from '@/lib/query';
import { IProfile, profileService } from '@/services';

/** The signed-in user (rarely changes: cached for the session). */
export const useProfile = () =>
  useQuery({
    queryKey: profileKeys.current(),
    queryFn: () => profileService.getProfile(),
    staleTime: Infinity,
  });

/**
 * Shared success path of the avatar mutations: the server's profile replaces
 * the cached one (so the header and profile page switch at once), and the
 * team list — which shows everyone's photo — is refreshed.
 */
const useAvatarMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<IProfile>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.current(), profile);
      void queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
};

/** Uploads a new profile photo (JPEG, PNG or WebP, up to 5 MB). */
export const useUploadAvatar = () =>
  useAvatarMutation((file: File) => profileService.uploadAvatar(file));

/** Removes the profile photo (initials are shown instead). */
export const useRemoveAvatar = () =>
  useAvatarMutation<void>(() => profileService.removeAvatar());
