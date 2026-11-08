'use client';
import React, { FC, useState } from 'react';
import { uiText } from '@/config';
import { useProfile } from '@/hooks';
import { hasPermission, isAdmin, TAdminArea } from '@/services';
import {
  Badge,
  EmptyState,
  ErrorState,
  ISegmentedOption,
  SegmentedControl,
  Skeleton,
} from '../../base';
import { PageHeader } from '../../layout';
import { BookingsPanel } from '../bookings-panel';
import { EventsPanel } from '../events-panel';
import { OrdersPanel } from '../orders-panel';
import { ProductsPanel } from '../products-panel';
import { RoomsPanel } from '../rooms-panel';
import { StaffPanel } from '../staff-panel';

type TAdminSection =
  `staff` | `products` | `orders` | `rooms` | `bookings` | `events`;

const SECTIONS: readonly ISegmentedOption<TAdminSection>[] = [
  { value: `staff`, label: uiText.admin.sections.staff, icon: `users` },
  { value: `products`, label: uiText.admin.sections.products, icon: `bag` },
  { value: `orders`, label: uiText.admin.sections.orders, icon: `receipt` },
  { value: `rooms`, label: uiText.admin.sections.rooms, icon: `door` },
  { value: `bookings`, label: uiText.admin.sections.bookings, icon: `clock` },
  { value: `events`, label: uiText.admin.sections.events, icon: `calendar` },
];

/** The permission each section needs (bookings belong to rooms). */
const SECTION_AREA: Record<TAdminSection, TAdminArea> = {
  staff: `staff`,
  products: `store`,
  orders: `orders`,
  rooms: `rooms`,
  bookings: `rooms`,
  events: `events`,
};

const PANELS: Record<TAdminSection, FC> = {
  staff: StaffPanel,
  products: ProductsPanel,
  orders: OrdersPanel,
  rooms: RoomsPanel,
  bookings: BookingsPanel,
  events: EventsPanel,
};

/**
 * Administration panel (`/admin`). Each section is shown only to roles
 * whose profile `permissions` include its area; the API enforces the same
 * matrix on every `/admin/*` call, so this guard is for the experience, not
 * the security.
 */
export const AdminView: FC = () => {
  const {
    data: profile,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useProfile();
  const [chosen, setChosen] = useState<TAdminSection | null>(null);
  const sections = SECTIONS.filter((option) =>
    hasPermission(profile, SECTION_AREA[option.value]),
  );
  // The chosen section if still allowed (roles can change), else the first.
  const section =
    sections.find((option) => option.value === chosen)?.value ??
    sections[0]?.value;
  const Panel = section ? PANELS[section] : null;

  return (
    <>
      <PageHeader
        title={uiText.admin.title}
        subtitle={
          sections.length
            ? sections.map((option) => option.label).join(`، `)
            : uiText.admin.subtitle
        }
        action={
          profile &&
          isAdmin(profile) && (
            <Badge tone="primary" icon="shield">
              {uiText.admin.staff.roles[profile.role]}
            </Badge>
          )
        }
      />

      {isPending ? (
        <Skeleton className="h-40 w-full rounded-24" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : !isAdmin(profile) || !section || !Panel ? (
        <EmptyState
          icon="lock"
          title={uiText.admin.forbiddenTitle}
          description={uiText.admin.forbiddenMessage}
        />
      ) : (
        <>
          <div className="-mx-4 scrollbar-none overflow-x-auto px-4 pb-2">
            <SegmentedControl
              aria-label={uiText.admin.sectionsLabel}
              options={sections}
              value={section}
              onChange={setChosen}
              size="sm"
            />
          </div>
          <section aria-label={uiText.admin.sections[section]}>
            <Panel />
          </section>
        </>
      )}
    </>
  );
};

AdminView.displayName = `AdminView`;

export default AdminView;
