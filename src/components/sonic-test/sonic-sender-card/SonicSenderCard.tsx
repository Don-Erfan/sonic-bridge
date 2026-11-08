'use client';
import React, { FC, useState } from 'react';
import {
  type PayloadInput,
  SonicEncoder,
  SonicError,
} from '@don-erfan/sonic-bridge';
import { useSonicTransmitter } from '@don-erfan/sonic-bridge/react';
import { fillTemplate, uiText } from '@/config';
import { localizeDigits } from '@/lib/utils';
import type { TTone } from '@/lib/tone';
import { Badge, Button, Surface, TextField } from '../../base';
import { LevelMeter } from '../level-meter';
import { loopbackFor } from '../loopback';
import { ISonicSenderCardProps } from './interface';

const text = uiText.sonicTest;

const STATUS_TONE = {
  idle: `neutral`,
  preparing: `info`,
  transmitting: `primary`,
  done: `success`,
  error: `danger`,
} as const satisfies Record<keyof typeof text.transmitterStatus, TTone>;

/** Objects/arrays are sent as JSON; everything else as text (digits auto-pack). */
const toPayload = (value: string): PayloadInput => {
  const trimmed = value.trim();
  if (/^[[{]/.test(trimmed)) {
    try {
      return { type: `json`, value: JSON.parse(trimmed) as unknown };
    } catch {
      // Not JSON — send as text.
    }
  }
  return value;
};

/** Sample rate only affects this airtime preview, not the transmission. */
const PREVIEW_SAMPLE_RATE = 48_000;

/** Encodes the payload and plays it through the speaker (or the loopback). */
export const SonicSenderCard: FC<ISonicSenderCardProps> = ({
  settings,
  onSent,
}) => {
  const [payload, setPayload] = useState(`482193`);
  const { transmit, cancel, status, progress, error, isTransmitting } =
    useSonicTransmitter({
      onSent,
      ...(settings.mode === `loopback` && { destination: loopbackFor }),
    });

  const preview = (() => {
    try {
      const encoder = new SonicEncoder(PREVIEW_SAMPLE_RATE, {
        band: settings.band,
        speed: settings.speed,
      });
      return { signal: encoder.encode(toPayload(payload)), error: null };
    } catch (cause) {
      return { signal: null, error: SonicError.from(cause, `payload/invalid`) };
    }
  })();

  const visibleError =
    error && error.code !== `operation/aborted` ? error : preview.error;

  return (
    <Surface as="section" padding="lg" aria-labelledby="sonic-sender-title">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="sonic-sender-title" className="typo-h3 text-fg-primary">
            {text.sender}
          </h2>
          <Badge tone={STATUS_TONE[status]} hasDot isPulsing={isTransmitting}>
            {text.transmitterStatus[status]}
          </Badge>
        </div>

        <TextField
          label={text.payload}
          value={payload}
          onChange={setPayload}
          autoCapitalize="none"
          description={
            preview.signal
              ? localizeDigits(
                  fillTemplate(text.airtime, {
                    type: preview.signal.contentType,
                    bytes: preview.signal.payloadBytes,
                    seconds: preview.signal.duration.toFixed(1),
                  }),
                )
              : text.payloadHint
          }
        />

        <Button
          variant={isTransmitting ? `secondary` : `primary`}
          startIcon="speaker"
          isFullWidth
          isDisabled={!preview.signal}
          onPress={() =>
            isTransmitting ? cancel() : void transmit(toPayload(payload))
          }
        >
          {isTransmitting ? text.stopSending : text.send}
        </Button>

        <LevelMeter
          value={progress}
          label={text.transmitterStatus.transmitting}
        />

        {visibleError && (
          <p role="alert" className="typo-b2 text-danger-500">
            {text.errors[visibleError.code]}
          </p>
        )}
      </div>
    </Surface>
  );
};

SonicSenderCard.displayName = `SonicSenderCard`;

export default SonicSenderCard;
