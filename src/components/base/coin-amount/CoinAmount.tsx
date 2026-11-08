import React, { FC } from 'react';
import clsx from 'clsx';
import { uiText } from '@/config';
import { Icon } from '@/icons';
import { formatNumber, formatSignedNumber } from '@/lib/utils';
import { ICoinAmountProps } from './interface';
import {
  coinAmountRootStyles,
  coinAmountTextStyles,
  coinCreditStyles,
  coinDebitStyles,
  coinDiscSize,
  coinDiscStyles,
} from './classes';

/**
 * A coin amount: gold coin glyph + Persian-numeral figure.
 *
 * @example
 * <CoinAmount amount={1250} size="lg" />
 * <CoinAmount amount={-400} isSigned />
 */
export const CoinAmount: FC<ICoinAmountProps> = ({
  amount,
  size = `md`,
  isSigned = false,
  isCompact = true,
}) => {
  const { disc, glyph } = coinDiscSize[size];

  return (
    <span
      className={clsx(
        coinAmountRootStyles,
        coinAmountTextStyles[size],
        isSigned && (amount >= 0 ? coinCreditStyles : coinDebitStyles),
      )}
    >
      <span
        aria-hidden
        className={coinDiscStyles}
        style={{ width: disc, height: disc }}
      >
        <Icon name="coin" size={glyph} strokeWidth={2.25} />
      </span>
      <bdi>{isSigned ? formatSignedNumber(amount) : formatNumber(amount)}</bdi>
      <span className={clsx(isCompact && `sr-only`)}>{uiText.coins}</span>
    </span>
  );
};

CoinAmount.displayName = `CoinAmount`;

export default CoinAmount;
