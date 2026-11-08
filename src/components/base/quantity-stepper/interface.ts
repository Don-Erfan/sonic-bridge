export interface IQuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  /** Names the control group ("تعداد"). */
  'aria-label': string;
  isDisabled?: boolean;
}
