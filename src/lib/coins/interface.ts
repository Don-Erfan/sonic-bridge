/** Kind of ledger entry. */
export type TTransactionType =
  `check-in-reward` | `purchase` | `refund` | `adjustment`;

/** Minimal ledger entry shape the coin rules need. */
export interface ILedgerEntry {
  type: TTransactionType;
  /** Positive = credit, negative = debit. Whole coins. */
  amount: number;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  createdAt: number;
}

/** Totals derived from the ledger. */
export interface ILedgerSummary {
  balance: number;
  earnedToday: number;
  totalEarned: number;
  totalSpent: number;
}

/* -------------------------------------------------------- Reward rule -- */

export interface IRewardInput {
  /** When the face-recognition gate recognised the person. */
  checkedInAt: Date;
  /** Day keys (`YYYY-MM-DD`) that already received a check-in reward. */
  rewardedDayKeys: ReadonlySet<string>;
}

export interface IRewardDecision {
  isEligible: boolean;
  amount: number;
  /** The day the reward is (or would be) booked against. */
  dayKey: string;
}

/**
 * Reward policy (Strategy). The default grants a fixed amount on the first
 * check-in of each day; a streak bonus or weekend rule is a new policy, not
 * an edit to the callers.
 */
export interface IRewardPolicy {
  evaluate(input: IRewardInput): IRewardDecision;
}

/* ------------------------------------------------------ Purchase rule -- */

/** Why a purchase is refused. */
export type TPurchaseFailure =
  | `inactive`
  | `invalid-quantity`
  | `out-of-stock`
  | `limit-reached`
  | `insufficient-balance`;

/** Facts a purchase is validated against. */
export interface IPurchaseContext {
  isActive: boolean;
  quantity: number;
  unitPrice: number;
  stock: number;
  /** Maximum units per person, `null` = unlimited. */
  perUserLimit: number | null;
  /** Units of this product the person already ordered. */
  alreadyPurchased: number;
  balance: number;
}

/**
 * One link of the purchase validation chain (Chain of Responsibility):
 * returns the first failure found, or `null` when every rule passes.
 */
export interface IPurchaseRule {
  setNext(next: IPurchaseRule): IPurchaseRule;
  validate(context: IPurchaseContext): TPurchaseFailure | null;
}
