import type { ILedgerEntry, ILedgerSummary } from '@/lib/coins';

/** One ledger row. */
export interface ITransaction extends ILedgerEntry {
  id: string;
  /** Extra context (e.g. the product name); `null` uses the type label. */
  description: string | null;
  /** Related order id for purchases / refunds. */
  reference: string | null;
}

/** Balance and totals (computed on the server from the ledger). */
export type TWalletSummary = ILedgerSummary;

/** Wallet API contract. */
export interface IWalletService {
  /** `GET /wallet/summary` */
  getSummary(): Promise<TWalletSummary>;
  /** `GET /wallet/transactions` — newest first. */
  getTransactions(): Promise<ITransaction[]>;
}
