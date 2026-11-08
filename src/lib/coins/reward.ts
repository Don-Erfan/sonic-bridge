import { toDayKey } from '../utils';
import { IRewardDecision, IRewardInput, IRewardPolicy } from './interface';

/** Coins granted for the first face-recognised check-in of a day. */
export const DAILY_CHECK_IN_REWARD = 100;

/**
 * Default reward policy: {@link DAILY_CHECK_IN_REWARD} coins, at most once per
 * local calendar day, however many times the gate recognises the person.
 */
export class DailyCheckInRewardPolicy implements IRewardPolicy {
  constructor(private readonly amount = DAILY_CHECK_IN_REWARD) {}

  evaluate({ checkedInAt, rewardedDayKeys }: IRewardInput): IRewardDecision {
    const dayKey = toDayKey(checkedInAt);
    return {
      dayKey,
      amount: this.amount,
      isEligible: !rewardedDayKeys.has(dayKey),
    };
  }
}

/** The policy in force. Swap the instance to change the rule app-wide. */
export const rewardPolicy: IRewardPolicy = new DailyCheckInRewardPolicy();
