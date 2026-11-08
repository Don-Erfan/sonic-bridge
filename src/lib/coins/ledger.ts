import { toDayKey } from '../utils';
import { ILedgerEntry, ILedgerSummary } from './interface';

/** Balance and totals of a ledger as of `now`. */
export const summarizeLedger = (
  entries: readonly ILedgerEntry[],
  now: Date,
): ILedgerSummary => {
  const today = toDayKey(now);
  return entries.reduce<ILedgerSummary>(
    (summary, entry) => {
      summary.balance += entry.amount;
      if (entry.amount > 0) {
        summary.totalEarned += entry.amount;
        if (toDayKey(new Date(entry.createdAt)) === today) {
          summary.earnedToday += entry.amount;
        }
      } else {
        summary.totalSpent += -entry.amount;
      }
      return summary;
    },
    { balance: 0, earnedToday: 0, totalEarned: 0, totalSpent: 0 },
  );
};

/** Day keys that already hold a check-in reward. */
export const getRewardedDayKeys = (
  entries: readonly ILedgerEntry[],
): Set<string> =>
  new Set(
    entries
      .filter((entry) => entry.type === `check-in-reward`)
      .map((entry) => toDayKey(new Date(entry.createdAt))),
  );
