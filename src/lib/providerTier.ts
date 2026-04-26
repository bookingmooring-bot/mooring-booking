import type { Profile } from '@/hooks/useProfile';

export type ProviderTier = 'standard' | 'white-label';
export type BerthTier = 'up-to-50' | 'over-50';

export const COMMISSION_RATES: Record<ProviderTier, number> = {
  standard: 0.12,
  'white-label': 0.10,
};

export const TRANSACTION_FEES: Record<ProviderTier, number> = {
  standard: 0,
  'white-label': 5,
};

export const WL_SUBSCRIPTION_PRICES: Record<BerthTier, number> = {
  'up-to-50': 199,
  'over-50': 299,
};

export const getCommissionRate = (tier: ProviderTier): number =>
  COMMISSION_RATES[tier] ?? COMMISSION_RATES.standard;

export const getTransactionFee = (tier: ProviderTier): number =>
  TRANSACTION_FEES[tier] ?? TRANSACTION_FEES.standard;

export const calculateBookingFees = (
  totalPrice: number,
  tier: ProviderTier,
): { commissionAmount: number; transactionFee: number } => ({
  commissionAmount: parseFloat((totalPrice * getCommissionRate(tier)).toFixed(2)),
  transactionFee: getTransactionFee(tier),
});

export const isWhiteLabel = (profile: Profile | null | undefined): boolean =>
  profile?.provider_tier === 'white-label';

export const getWhiteLabelPrice = (berthTier: BerthTier): number =>
  WL_SUBSCRIPTION_PRICES[berthTier] ?? WL_SUBSCRIPTION_PRICES['up-to-50'];

export const isPremiumListingIncluded = (tier: ProviderTier): boolean =>
  tier === 'white-label';
