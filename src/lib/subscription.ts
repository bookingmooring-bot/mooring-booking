import type { Profile } from '@/hooks/useProfile';

export type SubscriptionTier = 'basic' | 'premium-monthly' | 'premium-annual';

/**
 * Check if the subscription is still active (not expired).
 * Returns true if no expiry is set (basic) or expiry is in the future.
 */
export const isSubscriptionActive = (profile: Profile | null | undefined): boolean => {
  if (!profile) return false;
  if (profile.subscription_tier === 'basic') return true;
  if (!profile.subscription_expires_at) return false;
  return new Date(profile.subscription_expires_at) > new Date();
};

/**
 * Get the effective tier — if premium but expired, returns 'basic'.
 */
export const getUserTier = (profile: Profile | null | undefined): SubscriptionTier => {
  if (!profile) return 'basic';
  const tier = profile.subscription_tier || 'basic';
  if (tier !== 'basic' && !isSubscriptionActive(profile)) return 'basic';
  return tier;
};

/**
 * Check if the user has an active premium subscription.
 */
export const isPremium = (profile: Profile | null | undefined): boolean => {
  if (profile?.role === 'admin') return true; // Admins are always premium
  const tier = getUserTier(profile);
  return tier === 'premium-monthly' || tier === 'premium-annual';
};

/**
 * Check if a user can use a specific feature based on their tier.
 */
export const canUseFeature = (feature: string, profile: Profile | null | undefined): boolean => {
  const tier = getUserTier(profile);

  const basicFeatures = ['browse', 'book', 'basic-weather', 'basic-search', 'email-support'];
  const premiumFeatures = [
    ...basicFeatures,
    'unlimited-ai', '7day-forecast', 'offline-maps', 'storm-alerts',
    'priority-booking', 'ad-free', 'maneuvering-guides', 'port-congestion',
    'now4today-alerts', 'turn-by-turn-nav', 'winter-storage-search',
    'exclusive-discounts', 'priority-support', 'whatsapp-notifications',
  ];
  const annualFeatures = [
    ...premiumFeatures,
    'early-access', 'dedicated-manager', 'marina-discounts',
    'loyalty-2x', 'exclusive-events', 'api-access', 'b2b-referral',
  ];

  if (tier === 'premium-annual') return annualFeatures.includes(feature);
  if (tier === 'premium-monthly') return premiumFeatures.includes(feature);
  return basicFeatures.includes(feature);
};

/**
 * Service fee based on subscription tier and vessel length (Terms v3.0 Section 5.1).
 * Captain (premium-annual): always €0
 * Sailor (premium-monthly): €0 for vessels ≤12m, otherwise Basic rates
 * Basic: €12 (≤8m), €19 (≤12m), €35 (≤18m), €59 (≤24m), €99 (>24m)
 */
export const calculateServiceFee = (vesselLengthM: number | null | undefined, profile: Profile | null | undefined): number => {
  const tier = getUserTier(profile);

  if (tier === 'premium-annual') return 0;

  if (tier === 'premium-monthly') {
    if (!vesselLengthM || vesselLengthM <= 12) return 0;
  }

  const length = vesselLengthM ?? 0;
  if (length <= 8) return 12;
  if (length <= 12) return 19;
  if (length <= 18) return 35;
  if (length <= 24) return 59;
  return 99;
};

/**
 * AI question limit for basic users.
 */
export const AI_BASIC_LIMIT = 10;


/**
 * Check if a user has remaining AI questions.
 */
export const hasAIQuestionsRemaining = (profile: Profile | null | undefined): boolean => {
  if (profile?.role === 'admin') return true; // Admins have unlimited questions
  if (isPremium(profile)) return true;
  if (!profile) return true; // allow unauthenticated users (localStorage fallback)
  return (profile.ai_questions_used ?? 0) < AI_BASIC_LIMIT;
};
