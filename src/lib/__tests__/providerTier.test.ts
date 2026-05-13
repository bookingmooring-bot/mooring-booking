import { describe, it, expect } from 'vitest';
import {
  COMMISSION_RATES,
  TRANSACTION_FEES,
  WL_SUBSCRIPTION_PRICES,
  getCommissionRate,
  getTransactionFee,
  calculateBookingFees,
  isWhiteLabel,
  getWhiteLabelPrice,
  isPremiumListingIncluded,
} from '../providerTier';
import type { Profile } from '@/hooks/useProfile';

const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'p-1', full_name: 'Provider', email: 'p@test.com', phone: null,
  avatar_url: null, role: 'provider', subscription_tier: 'basic',
  subscription_expires_at: null, ai_questions_used: 0,
  preferred_language: 'en', created_at: '2026-01-01',
  ...overrides,
});

describe('COMMISSION_RATES', () => {
  it('standard = 12%', () => expect(COMMISSION_RATES.standard).toBe(0.12));
  it('white-label = 10%', () => expect(COMMISSION_RATES['white-label']).toBe(0.10));
});

describe('TRANSACTION_FEES', () => {
  it('standard = 0', () => expect(TRANSACTION_FEES.standard).toBe(0));
  it('white-label = 5', () => expect(TRANSACTION_FEES['white-label']).toBe(5));
});

describe('WL_SUBSCRIPTION_PRICES', () => {
  it('up-to-50 = 199', () => expect(WL_SUBSCRIPTION_PRICES['up-to-50']).toBe(199));
  it('over-50 = 299', () => expect(WL_SUBSCRIPTION_PRICES['over-50']).toBe(299));
});

describe('getCommissionRate', () => {
  it('returns standard rate', () => expect(getCommissionRate('standard')).toBe(0.12));
  it('returns white-label rate', () => expect(getCommissionRate('white-label')).toBe(0.10));
  it('override takes precedence', () => expect(getCommissionRate('standard', 0.15)).toBe(0.15));
});

describe('getTransactionFee', () => {
  it('standard = 0', () => expect(getTransactionFee('standard')).toBe(0));
  it('white-label = 5', () => expect(getTransactionFee('white-label')).toBe(5));
});

describe('calculateBookingFees', () => {
  it('standard: 100 EUR booking → 12 commission, 0 fee', () => {
    const result = calculateBookingFees(100, 'standard');
    expect(result.commissionAmount).toBe(12);
    expect(result.transactionFee).toBe(0);
  });

  it('white-label: 100 EUR booking → 10 commission, 5 fee', () => {
    const result = calculateBookingFees(100, 'white-label');
    expect(result.commissionAmount).toBe(10);
    expect(result.transactionFee).toBe(5);
  });

  it('custom commission rate overrides', () => {
    const result = calculateBookingFees(200, 'standard', 0.15);
    expect(result.commissionAmount).toBe(30);
  });

  it('handles decimal rounding correctly', () => {
    const result = calculateBookingFees(33.33, 'standard');
    expect(result.commissionAmount).toBe(4);
  });
});

describe('isWhiteLabel', () => {
  it('returns true for white-label provider', () => {
    expect(isWhiteLabel(makeProfile({ provider_tier: 'white-label' }))).toBe(true);
  });

  it('returns false for standard provider', () => {
    expect(isWhiteLabel(makeProfile({ provider_tier: 'standard' }))).toBe(false);
  });

  it('returns false for null profile', () => {
    expect(isWhiteLabel(null)).toBe(false);
  });
});

describe('getWhiteLabelPrice', () => {
  it('up-to-50 = 199', () => expect(getWhiteLabelPrice('up-to-50')).toBe(199));
  it('over-50 = 299', () => expect(getWhiteLabelPrice('over-50')).toBe(299));
});

describe('isPremiumListingIncluded', () => {
  it('true for white-label', () => expect(isPremiumListingIncluded('white-label')).toBe(true));
  it('false for standard', () => expect(isPremiumListingIncluded('standard')).toBe(false));
});
