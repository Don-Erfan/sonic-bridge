'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import {
  useCreateStaff,
  useRemoveStaffAvatar,
  useUpdateStaff,
  useUploadStaffAvatar,
} from '@/hooks';
import { IAdminStaff, STAFF_ROLES, TStaffRole } from '@/services';
import {
  Avatar,
  Button,
  ImagePickerButton,
  ISegmentedOption,
  notify,
  SegmentedControl,
  Sheet,
  TextField,
} from '../../base';
import { parseInteger, toOptionalText, ToggleRow } from '../admin-shared';

const ROLE_OPTIONS: readonly ISegmentedOption<TStaffRole>[] = STAFF_ROLES.map(
  (role) => ({
    value: role,
    label: uiText.admin.staff.roles[role],
    icon: role === `member` ? `user` : `shield`,
  }),
);

export interface IStaffFormSheetProps {
  /** `null` with `isOpen` = create a new person. */
  member: IAdminStaff | null;
  /** The signed-in administrator (cannot demote or deactivate themselves). */
  currentUserId: string | undefined;
  /** May set roles (`roles` permission); otherwise new people are members. */
  canAssignRoles: boolean;
  /** May activate / deactivate accounts (`access` permission). */
  canManageAccess: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Changes on every opening, so the form starts from the record again. */
  sessionKey: number;
}

interface IStaffFormProps {
  member: IAdminStaff | null;
  currentUserId: string | undefined;
  canAssignRoles: boolean;
  canManageAccess: boolean;
  onDone: () => void;
}

const StaffForm: FC<IStaffFormProps> = ({
  member,
  currentUserId,
  canAssignRoles,
  canManageAccess,
  onDone,
}) => {
  const t = uiText.admin.staff;
  const isCreate = member === null;
  const isSelf = member !== null && member.id === currentUserId;

  const [username, setUsername] = useState(member?.username ?? ``);
  const [fullName, setFullName] = useState(member?.fullName ?? ``);
  const [jobTitle, setJobTitle] = useState(member?.jobTitle ?? ``);
  const [team, setTeam] = useState(member?.team ?? ``);
  const [email, setEmail] = useState(member?.email ?? ``);
  const [gatePersonId, setGatePersonId] = useState(member?.gatePersonId ?? ``);
  const [role, setRole] = useState<TStaffRole>(member?.role ?? `member`);
  const [isActive, setActive] = useState(member?.isActive ?? true);
  const [password, setPassword] = useState(``);
  const [initialCoins, setInitialCoins] = useState(`0`);
  const [isSubmitted, setSubmitted] = useState(false);

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const uploadAvatar = useUploadStaffAvatar();
  const removeAvatar = useRemoveStaffAvatar();
  // The sheet shows the latest photo after an upload without reopening.
  const [avatarUrl, setAvatarUrl] = useState(member?.avatarUrl ?? null);

  const coins = parseInteger(initialCoins);
  const missing = (value: string) => isSubmitted && !value.trim();
  const isPasswordShort = isCreate && isSubmitted && password.length < 8;
  const isCoinsInvalid =
    isCreate && isSubmitted && (coins === null || coins < 0);
  const isBusy = createStaff.isPending || updateStaff.isPending;

  const handleSubmit = async () => {
    setSubmitted(true);
    const required = [username, fullName, jobTitle, team, email];
    if (required.some((value) => !value.trim())) return;
    if (isCreate && (password.length < 8 || coins === null || coins < 0))
      return;

    const fields = {
      username: username.trim(),
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim(),
      team: team.trim(),
      email: email.trim(),
      gatePersonId: toOptionalText(gatePersonId),
      role,
    };
    try {
      if (isCreate) {
        await createStaff.mutateAsync({
          ...fields,
          password,
          initialCoins: coins ?? 0,
        });
        notify.success(uiText.admin.created);
      } else {
        await updateStaff.mutateAsync({
          id: member.id,
          payload: { ...fields, isActive },
        });
        notify.success(uiText.admin.saved);
      }
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  const handleUpload = (file: File) => {
    if (!member) return;
    uploadAvatar.mutate(
      { id: member.id, file },
      {
        onSuccess: (updated) => {
          setAvatarUrl(updated.avatarUrl);
          notify.success(t.photoUpdated);
        },
        onError: (error) => notify.error(error),
      },
    );
  };

  const handleRemovePhoto = () => {
    if (!member) return;
    removeAvatar.mutate(member.id, {
      onSuccess: () => {
        setAvatarUrl(null);
        notify.success(t.photoRemoved);
      },
      onError: (error) => notify.error(error),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {member && (
        <div className="flex items-center gap-4">
          <Avatar name={member.fullName} src={avatarUrl} size="lg" />
          <div className="flex flex-wrap gap-2">
            <ImagePickerButton
              variant="secondary"
              size="sm"
              startIcon="camera"
              isLoading={uploadAvatar.isPending}
              isDisabled={uploadAvatar.isPending || removeAvatar.isPending}
              onPick={handleUpload}
            >
              {avatarUrl ? uiText.profile.changePhoto : uiText.profile.addPhoto}
            </ImagePickerButton>
            {avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                startIcon="trash"
                isLoading={removeAvatar.isPending}
                isDisabled={uploadAvatar.isPending}
                onPress={handleRemovePhoto}
              >
                {uiText.profile.removePhoto}
              </Button>
            )}
          </div>
        </div>
      )}

      <TextField
        label={t.fullName}
        value={fullName}
        onChange={setFullName}
        isRequired
        isInvalid={missing(fullName)}
        errorMessage={uiText.admin.required}
      />
      <TextField
        label={t.username}
        value={username}
        onChange={setUsername}
        autoCapitalize="none"
        autoComplete="off"
        isRequired
        isInvalid={missing(username)}
        errorMessage={uiText.admin.required}
      />
      <TextField
        label={t.email}
        type="email"
        value={email}
        onChange={setEmail}
        autoCapitalize="none"
        isRequired
        isInvalid={missing(email)}
        errorMessage={uiText.admin.required}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label={t.jobTitle}
          value={jobTitle}
          onChange={setJobTitle}
          isRequired
          isInvalid={missing(jobTitle)}
          errorMessage={uiText.admin.required}
        />
        <TextField
          label={t.team}
          value={team}
          onChange={setTeam}
          isRequired
          isInvalid={missing(team)}
          errorMessage={uiText.admin.required}
        />
      </div>
      <TextField
        label={t.gatePersonId}
        description={t.gatePersonIdHint}
        value={gatePersonId}
        onChange={setGatePersonId}
        autoCapitalize="none"
      />

      {isCreate && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label={t.password}
            type="password"
            description={t.passwordHint}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            isRequired
            isInvalid={isPasswordShort}
            errorMessage={t.passwordHint}
          />
          <TextField
            label={t.initialCoins}
            inputMode="numeric"
            value={initialCoins}
            onChange={setInitialCoins}
            isInvalid={isCoinsInvalid}
            errorMessage={uiText.admin.invalidNumber}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="typo-s1 text-fg-secondary">{t.role}</p>
        {canAssignRoles ? (
          <div className="-mx-1 scrollbar-none overflow-x-auto px-1 pb-1">
            <SegmentedControl
              aria-label={t.role}
              options={ROLE_OPTIONS}
              value={role}
              onChange={setRole}
              size="sm"
              isDisabled={isSelf}
            />
          </div>
        ) : (
          <p className="typo-b2 text-fg-primary">
            {t.roles[role]}
            <span className="ms-2 typo-c1 text-fg-tertiary">
              {t.roleLocked}
            </span>
          </p>
        )}
      </div>

      {!isCreate && canManageAccess && (
        <ToggleRow
          label={t.isActive}
          icon="lock"
          isSelected={isActive}
          onChange={setActive}
          isDisabled={isSelf}
        />
      )}
      {isSelf && <p className="typo-c1 text-fg-tertiary">{t.selfHint}</p>}

      <div className="pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isBusy}
          onPress={handleSubmit}
        >
          {uiText.save}
        </Button>
      </div>
    </div>
  );
};

/** Create or edit a staff member: identity, role, access and photo. */
export const StaffFormSheet: FC<IStaffFormSheetProps> = ({
  member,
  currentUserId,
  canAssignRoles,
  canManageAccess,
  isOpen,
  onOpenChange,
  sessionKey,
}) => (
  <Sheet
    title={
      member
        ? fillTemplate(uiText.admin.staff.editTitle, { name: member.fullName })
        : uiText.admin.staff.createTitle
    }
    isOpen={isOpen}
    onOpenChange={onOpenChange}
  >
    <StaffForm
      key={sessionKey}
      member={member}
      currentUserId={currentUserId}
      canAssignRoles={canAssignRoles}
      canManageAccess={canManageAccess}
      onDone={() => onOpenChange(false)}
    />
  </Sheet>
);

StaffFormSheet.displayName = `StaffFormSheet`;
