'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useSetStaffPassword } from '@/hooks';
import type { IAdminStaff } from '@/services';
import { Button, notify, Sheet, TextField } from '../../base';

export interface IPasswordSheetProps {
  member: IAdminStaff | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Changes on every opening, so the form starts empty again. */
  sessionKey: number;
}

const PasswordForm: FC<{ member: IAdminStaff; onDone: () => void }> = ({
  member,
  onDone,
}) => {
  const t = uiText.admin.staff;
  const [password, setPassword] = useState(``);
  const [isSubmitted, setSubmitted] = useState(false);
  const setStaffPassword = useSetStaffPassword();
  const isShort = password.length < 8;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (isShort) return;
    try {
      await setStaffPassword.mutateAsync({ id: member.id, password });
      notify.success(t.passwordChanged);
      onDone();
    } catch (error) {
      notify.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-[env(safe-area-inset-bottom)]">
      <TextField
        label={t.newPassword}
        type="password"
        description={t.passwordHint}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        isRequired
        isInvalid={isSubmitted && isShort}
        errorMessage={t.passwordHint}
      />
      <Button
        variant="primary"
        size="lg"
        isFullWidth
        startIcon="lock"
        isLoading={setStaffPassword.isPending}
        onPress={handleSubmit}
      >
        {t.resetPassword}
      </Button>
    </div>
  );
};

/**
 * Sets a new password for someone. The API signs them out everywhere (except
 * the administrator's own current session).
 */
export const PasswordSheet: FC<IPasswordSheetProps> = ({
  member,
  isOpen,
  onOpenChange,
  sessionKey,
}) => (
  <Sheet
    title={
      member
        ? fillTemplate(uiText.admin.staff.resetPasswordTitle, {
            name: member.fullName,
          })
        : uiText.admin.staff.resetPassword
    }
    isOpen={isOpen && member !== null}
    onOpenChange={onOpenChange}
  >
    {member && (
      <PasswordForm
        key={sessionKey}
        member={member}
        onDone={() => onOpenChange(false)}
      />
    )}
  </Sheet>
);

PasswordSheet.displayName = `PasswordSheet`;
