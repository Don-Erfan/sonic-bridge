'use client';
import React, { FC, useState } from 'react';
import { SonicBridgeProvider } from '@don-erfan/sonic-bridge/react';
import { uiText } from '@/config';
import { formatNumber, formatTime } from '@/lib/utils';
import {
  Button,
  EmptyState,
  ISegmentedOption,
  Section,
  SegmentedControl,
  StatTile,
  Surface,
} from '../../base';
import { PageHeader } from '../../layout';
import {
  ISonicReceivedEntry,
  ISonicTestSettings,
  TSonicTestMode,
} from '../interface';
import { SonicReceiverCard } from '../sonic-receiver-card';
import { SonicSenderCard } from '../sonic-sender-card';

const text = uiText.sonicTest;

const MODES: readonly ISegmentedOption<TSonicTestMode>[] = [
  { value: `air`, label: text.modeAir, icon: `speaker` },
  { value: `loopback`, label: text.modeLoopback, icon: `refresh` },
];

const BANDS: readonly ISegmentedOption<ISonicTestSettings[`band`]>[] = [
  { value: `audible`, label: text.bandAudible },
  { value: `ultrasonic`, label: text.bandUltrasonic },
];

const SPEEDS: readonly ISegmentedOption<ISonicTestSettings[`speed`]>[] = [
  { value: `fast`, label: text.speedFast },
  { value: `normal`, label: text.speedNormal },
  { value: `robust`, label: text.speedRobust },
];

const DEFAULT_SETTINGS: ISonicTestSettings = {
  band: `audible`,
  speed: `normal`,
  mode: `air`,
};

const INITIAL_STATS = { sent: 0, received: 0, corrupted: 0 };
const HISTORY_LIMIT = 8;

/**
 * Sonic Bridge test bench (`/sonic-test`): sends and receives short payloads
 * over sound with `@don-erfan/sonic-bridge`, and counts outcomes so the
 * success rate between two real devices can be measured.
 */
export const SonicTestView: FC = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [history, setHistory] = useState<readonly ISonicReceivedEntry[]>([]);

  const update = <K extends keyof ISonicTestSettings>(
    key: K,
    value: ISonicTestSettings[K],
  ) => setSettings((current) => ({ ...current, [key]: value }));

  const resetStats = () => {
    setStats(INITIAL_STATS);
    setHistory([]);
  };

  return (
    <SonicBridgeProvider band={settings.band} speed={settings.speed}>
      <PageHeader
        title={text.title}
        subtitle={text.subtitle}
        action={
          <Button
            variant="ghost"
            size="sm"
            startIcon="refresh"
            onPress={resetStats}
          >
            {text.resetStats}
          </Button>
        }
      />

      <Surface as="section" padding="lg" aria-label={text.settingsLabel}>
        <div className="flex flex-col gap-4">
          <SegmentedControl
            aria-label={text.mode}
            options={MODES}
            value={settings.mode}
            onChange={(mode) => update(`mode`, mode)}
            isFullWidth
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="px-1 typo-s2 text-fg-secondary">
                {text.band}
              </span>
              <SegmentedControl
                aria-label={text.band}
                options={BANDS}
                value={settings.band}
                onChange={(band) => update(`band`, band)}
                isFullWidth
                size="sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="px-1 typo-s2 text-fg-secondary">
                {text.speed}
              </span>
              <SegmentedControl
                aria-label={text.speed}
                options={SPEEDS}
                value={settings.speed}
                onChange={(speed) => update(`speed`, speed)}
                isFullWidth
                size="sm"
              />
            </div>
          </div>
          <p className="px-1 typo-b2 text-fg-tertiary">
            {settings.mode === `air` ? text.modeAirHint : text.modeLoopbackHint}
          </p>
        </div>
      </Surface>

      <div className="grid gap-4 lg:grid-cols-2">
        <SonicSenderCard
          settings={settings}
          onSent={() => setStats((s) => ({ ...s, sent: s.sent + 1 }))}
        />
        {/* Remount per signal path so the old capture graph is released. */}
        <SonicReceiverCard
          key={settings.mode}
          settings={settings}
          onReceived={(message, value) => {
            setStats((s) => ({ ...s, received: s.received + 1 }));
            setHistory((entries) =>
              [
                {
                  id: Date.now(),
                  receivedAt: new Date(),
                  message,
                  text: value,
                },
                ...entries,
              ].slice(0, HISTORY_LIMIT),
            );
          }}
          onCorrupted={() =>
            setStats((s) => ({ ...s, corrupted: s.corrupted + 1 }))
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon="speaker"
          tone="primary"
          value={formatNumber(stats.sent)}
          label={text.sentCount}
        />
        <StatTile
          icon="check-circle"
          tone="success"
          value={formatNumber(stats.received)}
          label={text.receivedCount}
        />
        <StatTile
          icon="alert"
          tone="danger"
          value={formatNumber(stats.corrupted)}
          label={text.corruptedCount}
        />
      </div>

      <Section id="sonic-history" title={text.history}>
        <Surface padding="none">
          {history.length > 0 ? (
            <ul className="divide-y divide-default-300/60">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="typo-c1 text-fg-tertiary tabular-nums">
                    {formatTime(entry.receivedAt)}
                  </span>
                  <code
                    dir="ltr"
                    className="min-w-0 flex-1 truncate typo-s1 text-fg-primary"
                  >
                    {entry.text}
                  </code>
                  <span className="typo-c1 text-fg-tertiary">
                    {entry.message.type}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="message" title={text.nothingYet} />
          )}
        </Surface>
      </Section>
    </SonicBridgeProvider>
  );
};

SonicTestView.displayName = `SonicTestView`;

export default SonicTestView;
