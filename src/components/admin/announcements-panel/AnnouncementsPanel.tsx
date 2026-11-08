'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useNow,
  useSendAnnouncement,
} from '@/hooks';
import { Icon } from '@/icons';
import { formatDateTime, formatNumber } from '@/lib/utils';
import type { IAnnouncement } from '@/services';
import { Button, ConfirmDialog, notify, Surface, TextField } from '../../base';
import { PanelState, useSheetSession } from '../admin-shared';

/** Limits of the API (`SendAnnouncementCommand`). */
const TITLE_MAX = 80;
const BODY_MAX = 500;

/**
 * Announcements to all staff: compose and send (after a confirmation — a
 * pushed notification cannot be recalled), and the list of sent ones with
 * delete. The sender's own devices get the notification too, which makes it
 * easy to check delivery.
 */
export const AnnouncementsPanel: FC = () => {
  const t = uiText.admin.announcements;
  const now = useNow();
  const announcements = useAnnouncements();
  const sendAnnouncement = useSendAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const removal = useSheetSession<IAnnouncement>();
  const [title, setTitle] = useState(``);
  const [body, setBody] = useState(``);
  const [isSubmitted, setSubmitted] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();

  const handleCompose = () => {
    setSubmitted(true);
    if (!trimmedTitle || !trimmedBody) return;
    setConfirmOpen(true);
  };

  const handleSend = async () => {
    try {
      const { devices } = await sendAnnouncement.mutateAsync({
        title: trimmedTitle,
        body: trimmedBody,
      });
      notify.success(
        devices > 0
          ? fillTemplate(t.sent, { count: formatNumber(devices) })
          : t.sentNoDevices,
      );
      setTitle(``);
      setBody(``);
      setSubmitted(false);
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!removal.item) return;
    try {
      await deleteAnnouncement.mutateAsync(removal.item.id);
      notify.success(uiText.admin.deleted);
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Surface as="section" padding="lg" aria-labelledby="compose-title">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="compose-title" className="typo-h3 text-fg-primary">
              {t.compose}
            </h2>
            <p className="typo-b2 text-fg-tertiary">{t.composeHint}</p>
          </div>
          <TextField
            label={t.title}
            value={title}
            onChange={setTitle}
            maxLength={TITLE_MAX}
            description={`${formatNumber(title.length)} / ${formatNumber(TITLE_MAX)}`}
            isRequired
            isInvalid={isSubmitted && !trimmedTitle}
            errorMessage={uiText.admin.required}
          />
          <TextField
            label={t.body}
            value={body}
            onChange={setBody}
            maxLength={BODY_MAX}
            description={`${formatNumber(body.length)} / ${formatNumber(BODY_MAX)}`}
            isMultiline
            isRequired
            isInvalid={isSubmitted && !trimmedBody}
            errorMessage={uiText.admin.required}
          />
          <span>
            <Button
              variant="primary"
              startIcon="megaphone"
              isLoading={sendAnnouncement.isPending}
              onPress={handleCompose}
            >
              {t.send}
            </Button>
          </span>
        </div>
      </Surface>

      <h2 className="typo-h3 text-fg-primary">{t.history}</h2>
      <PanelState
        isPending={announcements.isPending}
        isError={announcements.isError}
        isEmpty={(announcements.data?.length ?? 0) === 0}
        onRetry={() => announcements.refetch()}
        isRetrying={announcements.isFetching}
        emptyMessage={t.empty}
      >
        <ul className="flex flex-col gap-3">
          {announcements.data?.map((announcement) => (
            <Surface as="li" key={announcement.id} padding="md">
              <div className="flex items-start gap-3">
                <Icon
                  name="megaphone"
                  size={20}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="typo-s1 break-words text-fg-primary">
                    {announcement.title}
                  </p>
                  <p className="line-clamp-3 typo-b2 break-words whitespace-pre-line text-fg-secondary">
                    {announcement.body}
                  </p>
                  <p className="typo-c1 text-fg-tertiary">
                    {fillTemplate(uiText.announcements.from, {
                      name: announcement.authorName,
                    })}
                    {` · `}
                    {formatDateTime(announcement.createdAt, now)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  startIcon="trash"
                  onPress={() => removal.open(announcement)}
                >
                  {uiText.admin.delete}
                </Button>
              </div>
            </Surface>
          ))}
        </ul>
      </PanelState>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.confirmTitle}
        message={fillTemplate(t.confirmMessage, { title: trimmedTitle })}
        confirmLabel={t.send}
        onConfirm={handleSend}
      />
      <ConfirmDialog
        isOpen={removal.isOpen}
        onOpenChange={removal.onOpenChange}
        title={t.deleteTitle}
        message={fillTemplate(t.deleteMessage, {
          title: removal.item?.title ?? ``,
        })}
        confirmLabel={uiText.admin.delete}
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

AnnouncementsPanel.displayName = `AnnouncementsPanel`;

export default AnnouncementsPanel;
