import { uiText } from '@/config';

/**
 * Greeting by hour (Strategy table): the first entry whose `until` hour is
 * after the current hour wins.
 */
export const GREETINGS: readonly { until: number; text: string }[] = [
  { until: 5, text: uiText.home.evening },
  { until: 11, text: uiText.home.morning },
  { until: 14, text: uiText.home.noon },
  { until: 18, text: uiText.home.afternoon },
  { until: 24, text: uiText.home.evening },
];

export const greetingFor = (hour: number): string =>
  GREETINGS.find(({ until }) => hour < until)?.text ?? uiText.home.morning;
