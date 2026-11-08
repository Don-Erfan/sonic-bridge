'use client';
import React, { FC, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uiText } from '@/config';
import { useLogin } from '@/hooks';
import { LogoMark, LogoWordmark } from '@/icons';
import { getErrorStatus } from '@/services';
import { Button, IconButton, Surface, TextField } from '../../base';
import { ILoginViewProps } from './interface';

/**
 * Sign-in (`/login`). Wrong credentials are reported inline (and announced);
 * other failures fall back to the generic message.
 */
export const LoginView: FC<ILoginViewProps> = ({ redirectTo = `/` }) => {
  const router = useRouter();
  const login = useLogin();
  const [username, setUsername] = useState(``);
  const [password, setPassword] = useState(``);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login.mutateAsync({ username: username.trim(), password });
      router.replace(redirectTo);
    } catch (caught) {
      setError(
        getErrorStatus(caught) === 401
          ? uiText.auth.invalid
          : uiText.errors.generic,
      );
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neu px-4 py-10">
      <Surface elevation="lg" padding="lg" className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-20 items-center justify-center rounded-full shadow-neu-inset">
            <LogoMark size={44} />
          </span>
          <span dir="ltr" className="text-fg-primary">
            <LogoWordmark size={18} />
          </span>
          <h1 className="mt-2 typo-h2 text-fg-primary">{uiText.auth.title}</h1>
          <p className="typo-b1 text-fg-tertiary">{uiText.auth.subtitle}</p>
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            label={uiText.auth.username}
            placeholder={uiText.auth.usernamePlaceholder}
            value={username}
            onChange={setUsername}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            isRequired
            startIcon="user"
          />
          <TextField
            label={uiText.auth.password}
            type={isPasswordVisible ? `text` : `password`}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            isRequired
            startIcon="lock"
            endContent={
              <IconButton
                icon={isPasswordVisible ? `eye-off` : `eye`}
                size="sm"
                variant="ghost"
                aria-label={
                  isPasswordVisible
                    ? uiText.auth.hidePassword
                    : uiText.auth.showPassword
                }
                onPress={() => setPasswordVisible((visible) => !visible)}
              />
            }
          />

          <p role="alert" className="min-h-5 typo-b2 text-danger-600">
            {error}
          </p>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isFullWidth
            isLoading={login.isPending}
            isDisabled={!username.trim() || !password}
          >
            {uiText.auth.submit}
          </Button>

        </form>
      </Surface>
    </main>
  );
};

LoginView.displayName = `LoginView`;

export default LoginView;
