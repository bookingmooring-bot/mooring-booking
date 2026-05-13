import { describe, it, expect } from 'vitest';
import {
  isSubscriptionActive,
  getUserTier,
  isPremium,
  hasUnlimitedAI,
  canBook,
  canUseFeature,
  calculateServiceFee,
  AI_BASIC_LIMIT,
  hasAIQuestionsRemaining,
} from '../subscription';
import type { Profile } from '@/hooks/useProfile';

const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'user-1',
  full_name: 'Test User',
  email: 'test@test.com',
  phone: null,
  avatar_url: null,
  role: 'user',
  subscription_tier: 'basic',
  subscription_expires_at: null,
  ai_questions_used: 0,
  preferred_language: 'en',
  created_at: '2026-01-01',
  ...overrides,
});

const activeFuture = new Date(Date.now() + 86400000 * 30).toISOString();
const expiredPast = new Date(Date.now() - 86400000).toISOString();

describe('isSubscriptionActive', () => {
  it('returns false for null profile', () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it('returns true for basic tier (always active)', () => {
    expect(isSubscriptionActive(makeProfile())).toBe(true);
  });

  it('returns true when subscription not expired', () => {
    expect(isSubscriptionActive(makeProfile({
      subscription_tier: 'sailor',
      subscription_expires_at: activeFuture,
    }))).toBe(true);
  });

  it('returns false when subscription expired', () => {
    expect(isSubscriptionActive(makeProfile({
      subscription_tier: 'sailor',
      subscription_expires_at: expiredPast,
    }))).toBe(false);
  });
});

describe('getUserTier', () => {
  it('returns basic for null profile', () => {
    expect(getUserTier(null)).toBe('basic');
  });

  it('maps premium-monthly to sailor', () => {
    expect(getUserTier(makeProfile({
      subscription_tier: 'premium-monthly',
      subscription_expires_at: activeFuture,
    }))).toBe('sailor');
  });

  it('maps premium-annual to captain', () => {
    expect(getUserTier(makeProfile({
      subscription_tier: 'premium-annual',
      subscription_expires_at: activeFuture,
    }))).toBe('captain');
  });

  it('returns basic when paid tier is expired', () => {
    expect(getUserTier(makeProfile({
      subscription_tier: 'captain',
      subscription_expires_at: expiredPast,
    }))).toBe('basic');
  });

  it('returns charter-fleet when active', () => {
    expect(getUserTier(makeProfile({
      subscription_tier: 'charter-fleet',
      subscription_expires_at: activeFuture,
    }))).toBe('charter-fleet');
  });
});

describe('isPremium', () => {
  it('returns true for sailor tier', () => {
    expect(isPremium(makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('returns true for captain tier', () => {
    expect(isPremium(makeProfile({ subscription_tier: 'captain', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('returns true for charter-fleet tier', () => {
    expect(isPremium(makeProfile({ subscription_tier: 'charter-fleet', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('returns false for basic tier', () => {
    expect(isPremium(makeProfile())).toBe(false);
  });

  it('returns true for admin role regardless of tier', () => {
    expect(isPremium(makeProfile({ role: 'admin' }))).toBe(true);
  });

  it('returns false for ai-only tier', () => {
    expect(isPremium(makeProfile({ subscription_tier: 'ai-only', subscription_expires_at: activeFuture }))).toBe(false);
  });
});

describe('hasUnlimitedAI', () => {
  it('returns true for paid tiers', () => {
    expect(hasUnlimitedAI(makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(true);
    expect(hasUnlimitedAI(makeProfile({ subscription_tier: 'captain', subscription_expires_at: activeFuture }))).toBe(true);
    expect(hasUnlimitedAI(makeProfile({ subscription_tier: 'charter-fleet', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('returns true for ai-only tier', () => {
    expect(hasUnlimitedAI(makeProfile({ subscription_tier: 'ai-only', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('returns false for basic tier', () => {
    expect(hasUnlimitedAI(makeProfile())).toBe(false);
  });

  it('returns true for admin', () => {
    expect(hasUnlimitedAI(makeProfile({ role: 'admin' }))).toBe(true);
  });
});

describe('canBook', () => {
  it('returns false for ai-only tier', () => {
    expect(canBook(makeProfile({ subscription_tier: 'ai-only', subscription_expires_at: activeFuture }))).toBe(false);
  });

  it('returns true for basic tier', () => {
    expect(canBook(makeProfile())).toBe(true);
  });

  it('returns true for all other tiers', () => {
    expect(canBook(makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(true);
    expect(canBook(makeProfile({ subscription_tier: 'captain', subscription_expires_at: activeFuture }))).toBe(true);
    expect(canBook(makeProfile({ subscription_tier: 'charter-fleet', subscription_expires_at: activeFuture }))).toBe(true);
  });
});

describe('canUseFeature', () => {
  it('admin can use any feature', () => {
    expect(canUseFeature('fleet-analytics', makeProfile({ role: 'admin' }))).toBe(true);
  });

  it('basic user can browse and book', () => {
    expect(canUseFeature('browse', makeProfile())).toBe(true);
    expect(canUseFeature('book', makeProfile())).toBe(true);
  });

  it('basic user cannot use offline-maps', () => {
    expect(canUseFeature('offline-maps', makeProfile())).toBe(false);
  });

  it('sailor can use offline-maps', () => {
    expect(canUseFeature('offline-maps', makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('captain can use analytics-dashboard', () => {
    expect(canUseFeature('analytics-dashboard', makeProfile({ subscription_tier: 'captain', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('sailor cannot use analytics-dashboard', () => {
    expect(canUseFeature('analytics-dashboard', makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(false);
  });

  it('charter-fleet can use multi-vessel and bulk-reservations', () => {
    const p = makeProfile({ subscription_tier: 'charter-fleet', subscription_expires_at: activeFuture });
    expect(canUseFeature('multi-vessel', p)).toBe(true);
    expect(canUseFeature('bulk-reservations', p)).toBe(true);
  });

  it('captain cannot use multi-vessel', () => {
    expect(canUseFeature('multi-vessel', makeProfile({ subscription_tier: 'captain', subscription_expires_at: activeFuture }))).toBe(false);
  });
});

describe('calculateServiceFee', () => {
  it('captain tier returns 0', () => {
    expect(calculateServiceFee(15, makeProfile({ subscription_tier: 'captain', subscription_expires_at: activeFuture }))).toBe(0);
  });

  it('charter-fleet tier returns 0', () => {
    expect(calculateServiceFee(20, makeProfile({ subscription_tier: 'charter-fleet', subscription_expires_at: activeFuture }))).toBe(0);
  });

  it('sailor with boat <= 12m returns 0', () => {
    expect(calculateServiceFee(12, makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(0);
  });

  it('sailor with boat > 12m pays fee', () => {
    expect(calculateServiceFee(15, makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(35);
  });

  it('basic tier: boat <= 8m = 12 EUR', () => {
    expect(calculateServiceFee(8, makeProfile())).toBe(12);
  });

  it('basic tier: boat 9-12m = 19 EUR', () => {
    expect(calculateServiceFee(10, makeProfile())).toBe(19);
  });

  it('basic tier: boat 13-18m = 35 EUR', () => {
    expect(calculateServiceFee(15, makeProfile())).toBe(35);
  });

  it('basic tier: boat 19-24m = 59 EUR', () => {
    expect(calculateServiceFee(22, makeProfile())).toBe(59);
  });

  it('basic tier: boat > 24m = 99 EUR', () => {
    expect(calculateServiceFee(30, makeProfile())).toBe(99);
  });

  it('null vessel length treated as 0 = 12 EUR', () => {
    expect(calculateServiceFee(null, makeProfile())).toBe(12);
  });
});

describe('hasAIQuestionsRemaining', () => {
  it('returns true for admin', () => {
    expect(hasAIQuestionsRemaining(makeProfile({ role: 'admin' }))).toBe(true);
  });

  it('returns true for premium users', () => {
    expect(hasAIQuestionsRemaining(makeProfile({ subscription_tier: 'sailor', subscription_expires_at: activeFuture }))).toBe(true);
  });

  it('returns true for basic user under limit', () => {
    expect(hasAIQuestionsRemaining(makeProfile({ ai_questions_used: 5 }))).toBe(true);
  });

  it('returns false for basic user at limit', () => {
    expect(hasAIQuestionsRemaining(makeProfile({ ai_questions_used: AI_BASIC_LIMIT }))).toBe(false);
  });

  it('returns true for null profile (anonymous)', () => {
    expect(hasAIQuestionsRemaining(null)).toBe(true);
  });
});
