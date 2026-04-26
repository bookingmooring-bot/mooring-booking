import type { Profile } from '@/hooks/useProfile';

export type SubscriptionTier =
  | 'basic'
  | 'sailor'
  | 'captain'
  | 'charter-fleet'
  | 'ai-only'
  // Legacy values — mapped to new tiers in getUserTier()
  | 'premium-monthly'
  | 'premium-annual';

export const isSubscriptionActive = (profile: Profile | null | undefined): boolean => {
  if (!profile) return false;
  if (profile.subscription_tier === 'basic') return true;
  if (!profile.subscription_expires_at) return false;
  return new Date(profile.subscription_expires_at) > new Date();
};

export const getUserTier = (profile: Profile | null | undefined): SubscriptionTier => {
  if (!profile) return 'basic';
  const raw = profile.subscription_tier || 'basic';
  if (raw !== 'basic' && !isSubscriptionActive(profile)) return 'basic';
  // Map legacy tiers to new equivalents
  if (raw === 'premium-monthly') return 'sailor';
  if (raw === 'premium-annual') return 'captain';
  return raw;
};

export const isPremium = (profile: Profile | null | undefined): boolean => {
  if (profile?.role === 'admin') return true;
  const tier = getUserTier(profile);
  return tier === 'sailor' || tier === 'captain' || tier === 'charter-fleet';
};

export const hasUnlimitedAI = (profile: Profile | null | undefined): boolean => {
  if (profile?.role === 'admin') return true;
  const tier = getUserTier(profile);
  return tier === 'sailor' || tier === 'captain' || tier === 'charter-fleet' || tier === 'ai-only';
};

export const canBook = (profile: Profile | null | undefined): boolean => {
  const tier = getUserTier(profile);
  return tier !== 'ai-only';
};

export const canUseFeature = (feature: string, profile: Profile | null | undefined): boolean => {
  if (profile?.role === 'admin') return true;
  const tier = getUserTier(profile);

  const basicFeatures = ['browse', 'book', 'basic-weather', 'basic-search', 'email-support'];

  const aiOnlyFeatures = [
    ...basicFeatures,
    'unlimited-ai', '7day-forecast', 'storm-alerts', 'maneuvering-guides',
    'turn-by-turn-nav', 'route-planning', 'mayday-protocols',
  ];

  const sailorFeatures = [
    ...aiOnlyFeatures,
    'offline-maps', 'priority-booking', 'ad-free', 'port-congestion',
    'now4today-alerts', 'winter-storage-search', 'exclusive-discounts',
    'priority-support', 'whatsapp-notifications',
  ];

  const captainFeatures = [
    ...sailorFeatures,
    'charter-tools', 'analytics-dashboard', 'advanced-route-planning',
    'early-access', 'dedicated-manager', 'marina-discounts',
    'loyalty-2x', 'exclusive-events', 'api-access', 'b2b-referral',
  ];

  const charterFleetFeatures = [
    ...captainFeatures,
    'multi-vessel', 'bulk-reservations', 'fleet-analytics',
    'white-label-charter', 'guest-onboarding',
  ];

  if (tier === 'charter-fleet') return charterFleetFeatures.includes(feature);
  if (tier === 'captain') return captainFeatures.includes(feature);
  if (tier === 'sailor') return sailorFeatures.includes(feature);
  if (tier === 'ai-only') return aiOnlyFeatures.includes(feature);
  return basicFeatures.includes(feature);
};

export const calculateServiceFee = (vesselLengthM: number | null | undefined, profile: Profile | null | undefined): number => {
  const tier = getUserTier(profile);

  if (tier === 'captain' || tier === 'charter-fleet') return 0;

  if (tier === 'sailor') {
    if (!vesselLengthM || vesselLengthM <= 12) return 0;
  }

  const length = vesselLengthM ?? 0;
  if (length <= 8) return 12;
  if (length <= 12) return 19;
  if (length <= 18) return 35;
  if (length <= 24) return 59;
  return 99;
};

export const AI_BASIC_LIMIT = 10;

export const hasAIQuestionsRemaining = (profile: Profile | null | undefined): boolean => {
  if (profile?.role === 'admin') return true;
  if (hasUnlimitedAI(profile)) return true;
  if (!profile) return true;
  return (profile.ai_questions_used ?? 0) < AI_BASIC_LIMIT;
};
