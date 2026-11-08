'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useProfile, useStaff } from '@/hooks';
import {
  countByPresence,
  selectPresenceList,
  TPresenceFilter,
} from '@/lib/presence';
import { formatNumber } from '@/lib/utils';
import {
  EmptyState,
  ErrorState,
  SearchField,
  SegmentedControl,
  Skeleton,
  Surface,
} from '../../base';
import { PageHeader } from '../../layout';
import { StaffRow } from '../staff-row';

const SKELETON_ROWS = 6;

/**
 * Team presence (`/team`): who is in the office today and who is not,
 * searchable and filterable, refreshed while the page is open.
 */
export const TeamView: FC = () => {
  const { data: staff, isPending, isError, refetch, isFetching } = useStaff();
  const { data: profile } = useProfile();
  const [filter, setFilter] = useState<TPresenceFilter>(`all`);
  const [query, setQuery] = useState(``);

  const counts = staff ? countByPresence(staff) : null;
  const inOffice = counts?.[`in-office`] ?? 0;
  const total = staff?.length ?? 0;
  const list = staff ? selectPresenceList(staff, filter, query) : [];

  return (
    <>
      <PageHeader
        title={uiText.team.title}
        subtitle={
          staff
            ? fillTemplate(uiText.team.summary, {
                inOffice: formatNumber(inOffice),
                total: formatNumber(total),
              })
            : uiText.team.subtitle
        }
      />

      <div className="flex flex-col gap-3">
        <SearchField
          aria-label={uiText.team.searchLabel}
          placeholder={uiText.team.searchPlaceholder}
          value={query}
          onChange={setQuery}
        />
        <SegmentedControl
          aria-label={uiText.team.filterLabel}
          options={[
            {
              value: `all`,
              label: uiText.team.all,
              count: staff ? total : undefined,
            },
            {
              value: `in-office`,
              label: uiText.team.inOffice,
              count: staff ? inOffice : undefined,
            },
            {
              value: `not-in-office`,
              label: uiText.team.notInOffice,
              count: staff ? total - inOffice : undefined,
            },
          ]}
          value={filter}
          onChange={setFilter}
          isFullWidth
          size="sm"
        />
      </div>

      <Surface padding="none" aria-label={uiText.team.title}>
        {isPending ? (
          <ul aria-busy className="divide-y divide-default-300/60">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <li key={index} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
        ) : list.length === 0 ? (
          <EmptyState icon="users" title={uiText.team.empty} />
        ) : (
          <ul className="divide-y divide-default-300/60">
            {list.map((member) => (
              <li key={member.id}>
                <StaffRow member={member} isMe={member.id === profile?.id} />
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </>
  );
};

TeamView.displayName = `TeamView`;

export default TeamView;
