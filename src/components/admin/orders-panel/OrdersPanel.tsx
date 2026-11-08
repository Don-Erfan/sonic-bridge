'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import {
  useAdminOrderByReceipt,
  useAdminOrders,
  useCancelOrder,
  useFulfilOrder,
  useNow,
} from '@/hooks';
import {
  formatDateTime,
  formatNumber,
  formatReceiptNumber,
  normalizeDigits,
} from '@/lib/utils';
import type { IAdminOrder, TOrderStatus } from '@/services';
import type { TTone } from '@/lib/tone';
import {
  Badge,
  Button,
  ConfirmDialog,
  notify,
  SearchField,
  SegmentedControl,
  Surface,
} from '../../base';
import { PanelState, useSheetSession } from '../admin-shared';

type TOrderFilter = `pending` | `all`;

const STATUS_TONE: Record<TOrderStatus, TTone> = {
  pending: `warning`,
  fulfilled: `success`,
  cancelled: `neutral`,
};

/**
 * A typed receipt number: `null` when the field is empty, `NaN` when it is
 * not a positive whole number. Persian / Arabic digits are accepted.
 */
const parseReceipt = (text: string): number | null => {
  const digits = normalizeDigits(text.trim());
  if (digits === ``) return null;
  if (!/^[0-9]+$/.test(digits)) return Number.NaN;
  const number = Number(digits);
  return Number.isSafeInteger(number) && number > 0 ? number : Number.NaN;
};

/**
 * Everyone's orders: hand over (fulfil) or cancel with a refund. The buyer
 * shows their receipt; its number finds the order (any age) to hand over.
 */
export const OrdersPanel: FC = () => {
  const t = uiText.admin.orders;
  const now = useNow();
  const orders = useAdminOrders();
  const fulfil = useFulfilOrder();
  const cancel = useCancelOrder();
  const [filter, setFilter] = useState<TOrderFilter>(`pending`);
  const [search, setSearch] = useState(``);
  const receipt = parseReceipt(search);
  const isSearchValid = receipt === null || !Number.isNaN(receipt);
  const byReceipt = useAdminOrderByReceipt(
    receipt !== null && isSearchValid ? receipt : null,
  );
  const isSearching = receipt !== null;
  const cancellation = useSheetSession<IAdminOrder>();
  const toCancel = cancellation.item;

  const all = orders.data ?? [];
  const pendingCount = all.filter((order) => order.status === `pending`).length;
  const listed =
    filter === `pending` ? all.filter((o) => o.status === `pending`) : all;
  const visible = isSearching ? (byReceipt.data ?? []) : listed;
  const source = isSearching ? byReceipt : orders;

  const handleFulfil = (order: IAdminOrder) =>
    fulfil.mutate(order.id, {
      onSuccess: () => notify.success(t.fulfilled),
      onError: (error) => notify.error(error),
    });

  const handleCancel = async () => {
    if (!toCancel) return;
    try {
      await cancel.mutateAsync(toCancel.id);
      notify.success(t.cancelled);
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SearchField
        aria-label={t.searchLabel}
        placeholder={t.searchPlaceholder}
        value={search}
        onChange={setSearch}
      />

      {!isSearching && (
        <SegmentedControl
          aria-label={t.filterLabel}
          options={[
            { value: `pending`, label: t.pendingOnly, count: pendingCount },
            { value: `all`, label: t.all },
          ]}
          value={filter}
          onChange={setFilter}
          size="sm"
        />
      )}

      {!isSearchValid ? (
        <p role="alert" className="typo-b2 text-danger-600">
          {t.searchInvalid}
        </p>
      ) : isSearching && byReceipt.isSuccess && byReceipt.data.length === 0 ? (
        <output className="block typo-b2 text-fg-secondary">
          {fillTemplate(t.searchNotFound, {
            number: formatReceiptNumber(receipt),
          })}
        </output>
      ) : (
        <PanelState
          isPending={source.isPending}
          isError={source.isError}
          isEmpty={visible.length === 0}
          onRetry={() => source.refetch()}
          isRetrying={source.isFetching}
        >
          <ul className="flex flex-col gap-3">
            {visible.map((order) => (
              <Surface as="li" key={order.id} padding="md">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="text-3xl leading-none">
                    {order.emoji}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate typo-s1 text-fg-primary">
                      {order.productName}
                    </p>
                    <p className="truncate typo-b2 text-fg-secondary">
                      {order.userFullName}
                    </p>
                    <p className="typo-c1 text-fg-secondary">
                      {fillTemplate(t.receipt, {
                        number: formatReceiptNumber(order.receiptNumber),
                      })}
                    </p>
                    <p className="typo-c1 text-fg-tertiary">
                      {fillTemplate(t.summary, {
                        quantity: formatNumber(order.quantity),
                        total: formatNumber(order.total),
                      })}{' '}
                      · {formatDateTime(order.createdAt, now)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[order.status]}>
                    {uiText.wallet.orderStatus[order.status]}
                  </Badge>
                </div>
                {order.status === `pending` && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      startIcon="check"
                      isLoading={
                        fulfil.isPending && fulfil.variables === order.id
                      }
                      isDisabled={fulfil.isPending}
                      onPress={() => handleFulfil(order)}
                    >
                      {t.fulfil}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      startIcon="close"
                      onPress={() => cancellation.open(order)}
                    >
                      {t.cancel}
                    </Button>
                  </div>
                )}
              </Surface>
            ))}
          </ul>
        </PanelState>
      )}

      <ConfirmDialog
        isOpen={cancellation.isOpen}
        onOpenChange={cancellation.onOpenChange}
        title={t.cancelTitle}
        message={fillTemplate(t.cancelMessage, {
          product: toCancel?.productName ?? ``,
          name: toCancel?.userFullName ?? ``,
          total: formatNumber(toCancel?.total ?? 0),
        })}
        confirmLabel={t.cancel}
        tone="danger"
        onConfirm={handleCancel}
      />
    </div>
  );
};

OrdersPanel.displayName = `OrdersPanel`;
