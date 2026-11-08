'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useNow } from '@/hooks';
import { isMoodActive, moodRegistry } from '@/lib/mood';
import { presenceRegistry } from '@/lib/presence';
import { formatTime } from '@/lib/utils';
import { Avatar, Badge } from '../../base';
import { IStaffRowProps } from './interface';

/**
 * One colleague: avatar with presence dot and mood emoji, name, role, the
 * presence in words (and since when), and their status note.
 *
 * @example
 * <StaffRow member={member} isMe={member.id === me.id} />
 */
export const StaffRow: FC<IStaffRowProps> = ({ member, isMe = false }) => {
  const now = useNow();
  const presence = presenceRegistry[member.presence];
  const mood =
    member.mood && isMoodActive(member.mood, now) ? member.mood : null;

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <Avatar
        name={member.fullName}
        src={member.avatarUrl}
        presence={member.presence}
        emoji={mood ? moodRegistry[mood.key].emoji : undefined}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate typo-s1 text-fg-primary">{member.fullName}</p>
          {isMe && <Badge tone="primary">{uiText.team.you}</Badge>}
        </div>
        <p className="truncate typo-b2 text-fg-tertiary">
          {member.jobTitle} · {member.team}
        </p>
        {mood && (
          <p className="truncate typo-b2 text-fg-secondary">
            {mood.note ? (
              <>
                <span className="sr-only">
                  {uiText.mood.labels[mood.key]}:{' '}
                </span>
                {mood.note}
              </>
            ) : (
              uiText.mood.labels[mood.key]
            )}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge tone={presence.tone} hasDot>
          {uiText.presence[member.presence]}
        </Badge>
        {member.presence === `in-office` && member.checkedInAt && (
          <span className="typo-c1 text-fg-tertiary">
            {fillTemplate(uiText.presence.since, {
              time: formatTime(member.checkedInAt),
            })}
          </span>
        )}
      </div>
    </div>
  );
};

StaffRow.displayName = `StaffRow`;

export default StaffRow;
