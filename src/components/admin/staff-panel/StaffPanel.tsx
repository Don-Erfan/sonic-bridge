'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useAdminStaff, useProfile } from '@/hooks';
import { formatNumber, normalizeForSearch } from '@/lib/utils';
import { hasPermission, IAdminStaff, isAdministrativeRole } from '@/services';
import { Avatar, Badge, Button, SearchField, Surface } from '../../base';
import { PanelState, useSheetSession } from '../admin-shared';
import { CoinsSheet } from './CoinsSheet';
import { PasswordSheet } from './PasswordSheet';
import { StaffFormSheet } from './StaffFormSheet';

const matches = (member: IAdminStaff, query: string) =>
  normalizeForSearch(
    `${member.fullName} ${member.username} ${member.email} ${member.team} ${member.jobTitle}`,
  ).includes(query);

/**
 * People: add, edit, photo, and — as the caller's permissions allow — coins
 * (`coins`), password and activation (`access`) and roles (`roles`). People
 * with an administrative role are changed only by those who may assign
 * roles (the super admin), apart from one's own details; the API enforces
 * every one of these rules too.
 */
export const StaffPanel: FC = () => {
  const t = uiText.admin.staff;
  const { data: profile } = useProfile();
  const staff = useAdminStaff();
  const [search, setSearch] = useState(``);
  const form = useSheetSession<IAdminStaff>();
  const coins = useSheetSession<IAdminStaff>();
  const password = useSheetSession<IAdminStaff>();
  const canManageCoins = hasPermission(profile, `coins`);
  const canManageAccess = hasPermission(profile, `access`);
  const managesAdministrators = hasPermission(profile, `roles`);

  const query = normalizeForSearch(search.trim());
  const visible =
    staff.data?.filter((member) => !query || matches(member, query)) ?? [];
  // Sheets show the latest copy of a record after a refetch.
  const latest = (member: IAdminStaff | null) =>
    member ? (staff.data?.find((m) => m.id === member.id) ?? member) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchField
            aria-label={uiText.search}
            placeholder={uiText.admin.searchPlaceholder}
            value={search}
            onChange={setSearch}
          />
        </div>
        <Button
          variant="primary"
          startIcon="plus"
          onPress={() => form.open(null)}
        >
          {t.add}
        </Button>
      </div>

      <PanelState
        isPending={staff.isPending}
        isError={staff.isError}
        isEmpty={visible.length === 0}
        onRetry={() => staff.refetch()}
        isRetrying={staff.isFetching}
      >
        <ul className="flex flex-col gap-3">
          {visible.map((member) => {
            const isSelf = member.id === profile?.id;
            // Someone else with an administrative role, out of the caller's reach.
            const isProtected =
              isAdministrativeRole(member.role) &&
              !isSelf &&
              !managesAdministrators;
            const showCoins =
              canManageCoins && (!isSelf || managesAdministrators);
            return (
              <Surface as="li" key={member.id} padding="md">
                <div className="flex items-start gap-3">
                  <Avatar name={member.fullName} src={member.avatarUrl} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate typo-s1 text-fg-primary">
                        {member.fullName}
                      </p>
                      {isAdministrativeRole(member.role) && (
                        <Badge tone="primary" icon="shield">
                          {t.roles[member.role]}
                        </Badge>
                      )}
                      {!member.isActive && (
                        <Badge tone="danger">{uiText.admin.inactive}</Badge>
                      )}
                      {isSelf && <Badge tone="neutral">{t.you}</Badge>}
                    </div>
                    <p className="truncate typo-b2 text-fg-tertiary">
                      {member.jobTitle} · {member.team}
                    </p>
                    <p
                      dir="ltr"
                      className="truncate text-end typo-c1 text-fg-tertiary"
                    >
                      {member.username}
                    </p>
                  </div>
                  <span className="shrink-0 typo-s2 text-fg-secondary">
                    {fillTemplate(t.balance, {
                      amount: formatNumber(member.balance),
                    })}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!isProtected && (
                    <Button
                      variant="secondary"
                      size="sm"
                      startIcon="edit"
                      onPress={() => form.open(member)}
                    >
                      {uiText.admin.edit}
                    </Button>
                  )}
                  {showCoins && (
                    <Button
                      variant="secondary"
                      size="sm"
                      startIcon="coin"
                      onPress={() => coins.open(member)}
                    >
                      {t.coins}
                    </Button>
                  )}
                  {canManageAccess && !isProtected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      startIcon="lock"
                      onPress={() => password.open(member)}
                    >
                      {t.resetPassword}
                    </Button>
                  )}
                  {isProtected && (
                    <p className="typo-c1 text-fg-tertiary">{t.privileged}</p>
                  )}
                </div>
              </Surface>
            );
          })}
        </ul>
      </PanelState>

      <StaffFormSheet
        member={latest(form.item)}
        currentUserId={profile?.id}
        canAssignRoles={managesAdministrators}
        canManageAccess={canManageAccess}
        isOpen={form.isOpen}
        onOpenChange={form.onOpenChange}
        sessionKey={form.sessionKey}
      />
      <CoinsSheet
        member={latest(coins.item)}
        isOpen={coins.isOpen}
        onOpenChange={coins.onOpenChange}
        sessionKey={coins.sessionKey}
      />
      <PasswordSheet
        member={password.item}
        isOpen={password.isOpen}
        onOpenChange={password.onOpenChange}
        sessionKey={password.sessionKey}
      />
    </div>
  );
};

StaffPanel.displayName = `StaffPanel`;
