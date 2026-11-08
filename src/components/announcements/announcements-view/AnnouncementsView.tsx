'use client';
import React, { FC, useEffect } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useAnnouncements, useNow, useUnreadAnnouncements } from '@/hooks';
import { Icon } from '@/icons';
import { formatDateTime } from '@/lib/utils';
import { EmptyState, ErrorState, Skeleton, Surface } from '../../base';
import { PageHeader } from '../../layout';

/**
 * Announcements to all staff (`/announcements`), newest first — where an
 * announcement notification leads. Opening it clears the header's unread dot.
 */
export const AnnouncementsView: FC = () => {
  const now = useNow();
  const {
    data: announcements,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useAnnouncements();
  const { markSeen } = useUnreadAnnouncements();

  useEffect(() => {
    if (announcements) markSeen();
  }, [announcements, markSeen]);

  return (
    <>
      <PageHeader
        title={uiText.announcements.title}
        subtitle={uiText.announcements.subtitle}
      />

      {isPending ? (
        <div className="flex flex-col gap-3" aria-busy>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-24" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : announcements.length === 0 ? (
        <EmptyState icon="megaphone" title={uiText.announcements.empty} />
      ) : (
        <ul className="flex flex-col gap-3">
          {announcements.map((announcement) => (
            <Surface as="li" key={announcement.id} padding="lg">
              <article className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-16 text-primary-500 shadow-neu-inset-sm"
                >
                  <Icon name="megaphone" size={20} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <h2 className="typo-s1 text-fg-primary">
                    {announcement.title}
                  </h2>
                  <p className="typo-b1 break-words whitespace-pre-line text-fg-secondary">
                    {announcement.body}
                  </p>
                  <p className="typo-c1 text-fg-tertiary">
                    {fillTemplate(uiText.announcements.from, {
                      name: announcement.authorName,
                    })}
                    {` · `}
                    <time
                      dateTime={new Date(announcement.createdAt).toISOString()}
                    >
                      {formatDateTime(announcement.createdAt, now)}
                    </time>
                  </p>
                </div>
              </article>
            </Surface>
          ))}
        </ul>
      )}
    </>
  );
};

AnnouncementsView.displayName = `AnnouncementsView`;

export default AnnouncementsView;
