-- Migration: add_stripe_fields
-- Description: Adds Stripe Connect and Payments fields to profiles and bookings tables.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─── Profiles: Stripe customer + Connect fields ───────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id       TEXT,
  ADD COLUMN IF NOT EXISTS stripe_account_id        TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for webhook lookups by Stripe customer/account ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id
  ON public.profiles (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

-- ─── Bookings: Stripe payment tracking fields ─────────────────────────────────

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id   TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent
  ON public.bookings (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- Run this to confirm all columns exist after migration:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'profiles'
--   AND column_name IN ('stripe_customer_id','stripe_account_id','stripe_onboarding_complete');
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'bookings'
--   AND column_name IN ('stripe_payment_intent_id','stripe_checkout_session_id');
