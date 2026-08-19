/**
 * odds.ts — Scan-to-Spin trapdoor odds engine for EchoLink.
 *
 * Trapdoor probabilities give new guests a high-value reward most of the time
 * (exciting first impression) while repeat guests receive the standard reward
 * most of the time (sustainable CAC over the long run).
 */

export interface OddsConfig {
  newGuest: { highValue: number; standard: number };
  repeatGuest: { highValue: number; standard: number };
}

export interface RewardsCatalog {
  highValue: string;
  standard: string;
}

export interface SpinResult {
  tier: 'highValue' | 'standard';
  couponCode: string;
}

const DEFAULT_ODDS: OddsConfig = {
  newGuest: {
    highValue: Number(process.env.ODDS_NEW_HIGH ?? 0.8),
    standard: Number(process.env.ODDS_NEW_STD ?? 0.2),
  },
  repeatGuest: {
    highValue: Number(process.env.ODDS_REPEAT_HIGH ?? 0.1),
    standard: Number(process.env.ODDS_REPEAT_STD ?? 0.9),
  },
};

const DEFAULT_REWARDS: RewardsCatalog = {
  highValue: process.env.REWARD_HIGH_VALUE ?? 'BOGO',
  standard: process.env.REWARD_STANDARD ?? 'PCT10',
};

const COUPON_PREFIX_HIGH = process.env.COUPON_PREFIX_HIGH ?? 'HV-';
const COUPON_PREFIX_STD = process.env.COUPON_PREFIX_STD ?? 'ST-';

/** Generate a random alphanumeric suffix of `len` characters from `rng`. */
function randomSuffix(rng: () => number, len = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(rng() * chars.length)];
  }
  return out;
}

/**
 * Spin the wheel for a guest.
 *
 * @param isNewGuest  true if this is the guest's first visit.
 * @param rng         injectable RNG; defaults to Math.random (useful for seeded
 *                    deterministic testing).
 * @param odds        override the probability config (defaults to env/defaults).
 * @param rewards     override the rewards catalog.
 */
export function spin(
  isNewGuest: boolean,
  rng: () => number = Math.random,
  odds: OddsConfig = DEFAULT_ODDS,
  rewards: RewardsCatalog = DEFAULT_REWARDS,
): SpinResult {
  const probs = isNewGuest ? odds.newGuest : odds.repeatGuest;

  // First call: tier determination
  const roll = rng();
  const tier: 'highValue' | 'standard' = roll < probs.highValue ? 'highValue' : 'standard';

  const prefix = tier === 'highValue' ? COUPON_PREFIX_HIGH : COUPON_PREFIX_STD;
  const suffix = randomSuffix(rng);
  const baseCode = rewards[tier];
  const couponCode = `${prefix}${baseCode}-${suffix}`;

  return { tier, couponCode };
}
