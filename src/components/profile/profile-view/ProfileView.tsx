'use client';
import React, { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fillTemplate, uiText } from '@/config';
import {
  useLogout,
  useProfile,
  useRemoveAvatar,
  useUploadAvatar,
} from '@/hooks';
import { Icon } from '@/icons';
import { isAdmin, isAdministrativeRole } from '@/services';
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  ImagePickerButton,
  notify,
  Skeleton,
  Surface,
} from '../../base';
import { PageHeader } from '../../layout';
import { MoodCard } from '../../mood';
import { InstallAppCard } from '../../pwa';
import { ThemeSwitch } from '../../theme-switch';

/**
 * Profile & settings (`/profile`): identity and photo, mood, theme,
 * Mattermost link, the admin panel (administrators only), app install and
 * sign-out.
 */
export const ProfileView: FC = () => {
  const router = useRouter();
  const {
    data: profile,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useProfile();
  const logout = useLogout();
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [isRemovePhotoOpen, setRemovePhotoOpen] = useState(false);
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const isPhotoBusy = uploadAvatar.isPending || removeAvatar.isPending;

  const handleUpload = (file: File) =>
    uploadAvatar.mutate(file, {
      onSuccess: () => notify.success(uiText.profile.photoUpdated),
      onError: (error) => notify.error(error),
    });

  const handleRemove = async () => {
    try {
      await removeAvatar.mutateAsync();
      notify.success(uiText.profile.photoRemoved);
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  const handleLogout = async () => {
    // `useLogout` clears the session even if the server call fails.
    await logout.mutateAsync().catch(() => undefined);
    router.replace(`/login`);
  };

  return (
    <>
      <PageHeader title={uiText.profile.title} />

      <Surface padding="lg" aria-label={uiText.profile.title}>
        {isPending ? (
          <div className="flex items-center gap-4" aria-busy>
            <Skeleton className="size-20 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-36 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>
        ) : isError || !profile ? (
          <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                name={profile.fullName}
                src={profile.avatarUrl}
                size="xl"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="typo-h2 text-fg-primary">{profile.fullName}</p>
                {isAdministrativeRole(profile.role) && (
                  <span>
                    <Badge tone="primary" icon="shield">
                      {uiText.admin.staff.roles[profile.role]}
                    </Badge>
                  </span>
                )}
                <p className="typo-b1 text-fg-secondary">
                  {profile.jobTitle} · {profile.team}
                </p>
                <p
                  dir="ltr"
                  className="truncate text-end typo-b2 text-fg-tertiary"
                >
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-2">
                <ImagePickerButton
                  variant="secondary"
                  size="sm"
                  startIcon="camera"
                  isLoading={uploadAvatar.isPending}
                  isDisabled={isPhotoBusy}
                  onPick={handleUpload}
                >
                  {profile.avatarUrl
                    ? uiText.profile.changePhoto
                    : uiText.profile.addPhoto}
                </ImagePickerButton>
                {profile.avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    startIcon="trash"
                    isDisabled={isPhotoBusy}
                    onPress={() => setRemovePhotoOpen(true)}
                  >
                    {uiText.profile.removePhoto}
                  </Button>
                )}
              </div>
              <p className="typo-c1 text-fg-tertiary">
                {uiText.profile.photoHint}
              </p>
            </div>
          </div>
        )}
      </Surface>

      <MoodCard />

      <Surface as="section" padding="lg" aria-labelledby="settings-title">
        <h2 id="settings-title" className="typo-h3 text-fg-primary">
          {uiText.profile.settings}
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          <p className="typo-s1 text-fg-secondary">{uiText.theme.label}</p>
          <ThemeSwitch />
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-20 px-4 py-3 shadow-neu-inset">
          <Icon
            name="message"
            size={20}
            className="shrink-0 text-secondary-500"
          />
          <div className="flex min-w-0 flex-col">
            <p className="typo-s1 text-fg-primary">
              {uiText.profile.mattermost}
            </p>
            <p className="truncate typo-b2 text-fg-tertiary">
              {profile?.mattermost ? (
                <bdi>
                  {fillTemplate(uiText.profile.mattermostLinked, {
                    username: profile.mattermost.username,
                  })}
                </bdi>
              ) : (
                uiText.profile.mattermostNotLinked
              )}
            </p>
          </div>
        </div>
      </Surface>

      {isAdmin(profile) && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-24 border border-neu-outline bg-neu px-5 py-4 shadow-neu-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Icon name="shield" size={22} className="shrink-0 text-primary-500" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="typo-s1 text-fg-primary">
              {uiText.profile.adminPanel}
            </span>
            <span className="typo-b2 text-fg-tertiary">
              {uiText.profile.adminPanelHint}
            </span>
          </span>
          <Icon
            name="chevron-right"
            size={20}
            className="shrink-0 text-fg-tertiary rtl:-scale-x-100"
          />
        </Link>
      )}

      <InstallAppCard />

      <Button
        variant="secondary"
        startIcon="logout"
        isFullWidth
        onPress={() => setLogoutOpen(true)}
      >
        {uiText.profile.logout}
      </Button>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        onOpenChange={setLogoutOpen}
        title={uiText.profile.logoutTitle}
        message={uiText.profile.logoutMessage}
        confirmLabel={uiText.profile.logout}
        onConfirm={handleLogout}
      />

      <ConfirmDialog
        isOpen={isRemovePhotoOpen}
        onOpenChange={setRemovePhotoOpen}
        title={uiText.profile.removePhotoTitle}
        message={uiText.profile.removePhotoMessage}
        confirmLabel={uiText.profile.removePhoto}
        tone="danger"
        onConfirm={handleRemove}
      />
    </>
  );
};

ProfileView.displayName = `ProfileView`;

export default ProfileView;
