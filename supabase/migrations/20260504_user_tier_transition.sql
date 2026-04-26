-- One-time migration: transition existing premium users to new tier names.
-- Run AFTER all code handling both old and new names is deployed.
-- getUserTier() in frontend already maps these, so order doesn't matter.

-- premium-monthly → sailor
UPDATE public.profiles
SET subscription_tier = 'sailor'
WHERE subscription_tier = 'premium-monthly';

-- premium-annual → captain
UPDATE public.profiles
SET subscription_tier = 'captain'
WHERE subscription_tier = 'premium-annual';
