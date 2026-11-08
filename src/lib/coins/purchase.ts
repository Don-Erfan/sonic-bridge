import { IPurchaseContext, IPurchaseRule, TPurchaseFailure } from './interface';

/** Largest quantity of one product per order. */
export const MAX_ORDER_QUANTITY = 10;

/**
 * Base link of the purchase validation chain (Chain of Responsibility).
 * Subclasses implement one check; the base forwards to the next link.
 */
abstract class PurchaseRule implements IPurchaseRule {
  private next: IPurchaseRule | null = null;

  setNext(next: IPurchaseRule): IPurchaseRule {
    this.next = next;
    return next;
  }

  validate(context: IPurchaseContext): TPurchaseFailure | null {
    return this.check(context) ?? this.next?.validate(context) ?? null;
  }

  protected abstract check(context: IPurchaseContext): TPurchaseFailure | null;
}

class ActiveRule extends PurchaseRule {
  protected check({ isActive }: IPurchaseContext) {
    return isActive ? null : (`inactive` as const);
  }
}

class QuantityRule extends PurchaseRule {
  protected check({ quantity }: IPurchaseContext) {
    return Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= MAX_ORDER_QUANTITY
      ? null
      : (`invalid-quantity` as const);
  }
}

class StockRule extends PurchaseRule {
  protected check({ quantity, stock }: IPurchaseContext) {
    return quantity <= stock ? null : (`out-of-stock` as const);
  }
}

class LimitRule extends PurchaseRule {
  protected check({
    quantity,
    perUserLimit,
    alreadyPurchased,
  }: IPurchaseContext) {
    return perUserLimit === null || alreadyPurchased + quantity <= perUserLimit
      ? null
      : (`limit-reached` as const);
  }
}

class BalanceRule extends PurchaseRule {
  protected check({ quantity, unitPrice, balance }: IPurchaseContext) {
    return quantity * unitPrice <= balance
      ? null
      : (`insufficient-balance` as const);
  }
}

/**
 * Builds the chain in priority order: a sold-out item reports "out of stock"
 * before "not enough coins", which is the more useful message.
 */
export const createPurchaseValidator = (): IPurchaseRule => {
  const head = new ActiveRule();
  head
    .setNext(new QuantityRule())
    .setNext(new StockRule())
    .setNext(new LimitRule())
    .setNext(new BalanceRule());
  return head;
};

/** Shared, stateless validator used by the UI to pre-check purchases. */
export const purchaseValidator: IPurchaseRule = createPurchaseValidator();

/**
 * Largest quantity that passes every rule (0 = cannot buy at all). Drives
 * the upper bound of the quantity stepper.
 */
export const getMaxPurchasableQuantity = (
  context: Omit<IPurchaseContext, `quantity`>,
): number => {
  for (let quantity = MAX_ORDER_QUANTITY; quantity >= 1; quantity -= 1) {
    if (purchaseValidator.validate({ ...context, quantity }) === null) {
      return quantity;
    }
  }
  return 0;
};
