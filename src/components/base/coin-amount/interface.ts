export interface ICoinAmountProps {
  amount: number;
  size?: TCoinAmountSize;
  /** Shows `+` / `−` and colours credits / debits. */
  isSigned?: boolean;
  /** Visually hides the coin word; it stays for screen readers. */
  isCompact?: boolean;
}

export type TCoinAmountSize = `sm` | `md` | `lg` | `xl`;
