-- Migration: white_label_provider_tier
-- Description: Adds White Label Marina provider tier fields to profiles and transaction_fee to bookings.

-- ─── Profiles: provider tier fields ──────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS provider_tier          TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS white_label_berth_tier TEXT,
  ADD COLUMN IF NOT EXISTS white_label_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS white_label_activated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_provider_tier
  ON public.profiles (provider_tier)
  WHERE provider_tier = 'white-label';

-- ─── Bookings: flat transaction fee for White Label providers ────────────────

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS transaction_fee NUMERIC(10,2) NOT NULL DEFAULT 0;
