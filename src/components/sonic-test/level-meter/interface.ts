export interface ILevelMeterProps {
  /** 0–1. */
  value: number;
  label: string;
  tone?: `primary` | `success`;
}
