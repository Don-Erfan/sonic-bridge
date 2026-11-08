'use client';
import React, { FC, useEffect, useSyncExternalStore } from 'react';
import { detectSupport, type SupportReport } from '@don-erfan/sonic-bridge';
import {
  useSonicBridgeContext,
  useSonicReceiver,
} from '@don-erfan/sonic-bridge/react';
import { fillTemplate, uiText } from '@/config';
import { Icon } from '@/icons';
import { localizeDigits } from '@/lib/utils';
import type { TTone } from '@/lib/tone';
import { Badge, Button, Surface } from '../../base';
import { LevelMeter } from '../level-meter';
import { loopbackFor } from '../loopback';
import { ISonicReceiverCardProps } from './interface';

const text = uiText.sonicTest;

const STATUS_TONE = {
  idle: `neutral`,
  'requesting-permission': `warning`,
  listening: `info`,
  receiving: `primary`,
  success: `success`,
  error: `danger`,
} as const satisfies Record<keyof typeof text.receiverStatus, TTone>;

/** Browser capabilities never change while the page is open. */
let cachedSupport: SupportReport | undefined;
const getSupport = (): SupportReport => (cachedSupport ??= detectSupport());
const subscribeNever = () => () => {};

/** Browser checks shown when receiving is unavailable (`ok` = passes). */
const supportChecks = (support: SupportReport) =>
  [
    { label: text.checkSecure, ok: support.secureContext },
    {
      label: text.checkMicrophone,
      ok: typeof navigator.mediaDevices?.getUserMedia === `function`,
    },
    { label: text.checkWorklet, ok: support.audioWorklet },
  ] as const;

/** Listens continuously and shows the latest message with its link quality. */
export const SonicReceiverCard: FC<ISonicReceiverCardProps> = ({
  settings,
  onReceived,
  onCorrupted,
}) => {
  const shared = useSonicBridgeContext();
  const {
    receiver,
    listen,
    stop,
    state,
    status,
    data,
    message,
    error,
    level,
    progress,
    isListening,
    isSupported,
  } = useSonicReceiver({ continuous: true, timeout: 0, onMessage: onReceived });

  useEffect(
    () => receiver.on(`corrupted`, onCorrupted),
    [receiver, onCorrupted],
  );

  // `null` on the server and during hydration, so both renders agree.
  const support = useSyncExternalStore(subscribeNever, getSupport, () => null);

  const start = () => {
    if (settings.mode === `air` || !shared) {
      void listen();
      return;
    }
    // Loopback: listen to the stream the sender plays into (shared context).
    const { stream } = loopbackFor(shared.audio.get());
    receiver
      .listen({ stream, continuous: true, timeout: 0 })
      .catch(() => undefined);
  };

  const issue =
    (state.status === `listening` || state.status === `receiving`) &&
    state.issue;

  return (
    <Surface as="section" padding="lg" aria-labelledby="sonic-receiver-title">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="sonic-receiver-title" className="typo-h3 text-fg-primary">
            {text.receiver}
          </h2>
          <Badge tone={STATUS_TONE[status]} hasDot isPulsing={isListening}>
            {text.receiverStatus[status]}
          </Badge>
        </div>

        <Button
          variant={isListening ? `secondary` : `primary`}
          startIcon={isListening ? `close` : `message`}
          isFullWidth
          isDisabled={settings.mode === `air` && isSupported === false}
          onPress={isListening ? stop : start}
        >
          {isListening ? text.stopListening : text.listen}
        </Button>

        <LevelMeter value={level} label={text.inputLevel} tone="success" />
        <LevelMeter value={progress} label={text.frameProgress} />

        <Surface variant="inset" padding="md">
          <output
            aria-live="polite"
            className="flex min-h-9 items-center justify-center text-center"
          >
            {data ? (
              <span
                dir="ltr"
                className="font-mono typo-h2 tracking-wider break-all text-fg-primary"
              >
                {data}
              </span>
            ) : (
              <span className="typo-b2 text-fg-tertiary">
                {text.nothingYet}
              </span>
            )}
          </output>
        </Surface>

        {message && (
          <p className="typo-c1 text-fg-tertiary">
            {localizeDigits(
              fillTemplate(text.quality, {
                sync: message.stats.syncScore.toFixed(2),
                margin: message.stats.marginDb.toFixed(0),
                corrected: message.stats.correctedBytes,
              }),
            )}
          </p>
        )}
        {issue && <p className="typo-b2 text-warning-600">{text.corrupted}</p>}
        {error && (
          <p role="alert" className="typo-b2 text-danger-500">
            {text.errors[error.code]}
          </p>
        )}
        {settings.mode === `air` && support && !support.receive && (
          <Surface variant="inset" padding="md" aria-label={text.diagnostics}>
            <ul className="flex flex-col gap-2 typo-b2">
              {supportChecks(support).map(({ label, ok }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon
                    name={ok ? `check-circle` : `alert`}
                    size={18}
                    className={ok ? `text-success-500` : `text-danger-500`}
                  />
                  <span className="text-fg-secondary">{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 typo-b2 text-fg-tertiary">
              {support.secureContext ? text.unsupported : text.insecureHint}
            </p>
          </Surface>
        )}
      </div>
    </Surface>
  );
};

SonicReceiverCard.displayName = `SonicReceiverCard`;

export default SonicReceiverCard;
