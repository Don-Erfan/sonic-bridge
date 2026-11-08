'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useMyMood, useNow, useProfile } from '@/hooks';
import { Icon } from '@/icons';
import { isMoodActive, moodRegistry, TMoodKey } from '@/lib/mood';
import { formatTime } from '@/lib/utils';
import { Badge, Button, Skeleton, Surface } from '../../base';
import { MoodSheet } from '../mood-sheet';
import { IMoodCardProps } from './interface';

/** Emoji offered for a one-tap start when no mood is set. */
const QUICK_PICKS: readonly TMoodKey[] = [
  `great`,
  `focused`,
  `tired`,
  `celebrating`,
];

const AVAILABILITY_TONE = {
  available: `success`,
  away: `warning`,
  busy: `danger`,
} as const;

/**
 * Today's mood at a glance, with the editor one tap away. With no mood set
 * it offers quick-pick emoji that open the editor preselected.
 *
 * @example
 * <MoodCard />
 */
export const MoodCard: FC<IMoodCardProps> = ({ headingLevel = 2 }) => {
  const { data: mood, isPending } = useMyMood();
  const { data: profile } = useProfile();
  const now = useNow();
  const [isOpen, setOpen] = useState(false);
  const [initialKey, setInitialKey] = useState<TMoodKey | null>(null);
  const Heading = `h${headingLevel}` as const;
  const activeMood = mood && isMoodActive(mood, now) ? mood : null;

  const open = (key: TMoodKey | null = null) => {
    setInitialKey(key);
    setOpen(true);
  };

  return (
    <Surface as="section" padding="lg" aria-labelledby="mood-card-title">
      <div className="flex items-center justify-between gap-3">
        <Heading id="mood-card-title" className="typo-h3 text-fg-primary">
          {uiText.mood.title}
        </Heading>
        {activeMood && (
          <Button
            variant="secondary"
            size="sm"
            startIcon="edit"
            onPress={() => open()}
          >
            {uiText.mood.edit}
          </Button>
        )}
      </div>

      {isPending ? (
        <div className="mt-4 flex items-center gap-3" aria-busy>
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-3 w-40 rounded-full" />
          </div>
        </div>
      ) : activeMood ? (
        <div className="mt-4 flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full text-3xl shadow-neu-inset"
          >
            {moodRegistry[activeMood.key].emoji}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="typo-s1 text-fg-primary">
              {uiText.mood.labels[activeMood.key]}
            </p>
            {activeMood.note && (
              <p className="truncate typo-b2 text-fg-secondary">
                {activeMood.note}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={AVAILABILITY_TONE[activeMood.availability]} hasDot>
                {uiText.mood.availabilityOptions[activeMood.availability]}
              </Badge>
              {activeMood.expiresAt && (
                <span className="inline-flex items-center gap-1 typo-c1 text-fg-tertiary">
                  <Icon name="clock" size={12} />
                  {fillTemplate(uiText.mood.expiresAt, {
                    time: formatTime(activeMood.expiresAt),
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <p className="typo-b1 text-fg-secondary">{uiText.mood.prompt}</p>
          <div className="flex gap-3">
            {QUICK_PICKS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => open(key)}
                aria-label={uiText.mood.labels[key]}
                className="flex size-12 items-center justify-center rounded-full border border-neu-outline bg-neu text-2xl shadow-neu-sm transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:shadow-neu-pressed"
              >
                <span aria-hidden>{moodRegistry[key].emoji}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => open()}
              aria-label={uiText.mood.sheetTitle}
              className="flex size-12 items-center justify-center rounded-full border border-neu-outline bg-neu text-fg-tertiary shadow-neu-sm transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:shadow-neu-pressed"
            >
              <Icon name="plus" size={22} />
            </button>
          </div>
        </div>
      )}

      <MoodSheet
        isOpen={isOpen}
        onOpenChange={setOpen}
        currentMood={activeMood}
        initialKey={initialKey}
        canSync={Boolean(profile?.mattermost)}
      />
    </Surface>
  );
};

MoodCard.displayName = `MoodCard`;

export default MoodCard;
