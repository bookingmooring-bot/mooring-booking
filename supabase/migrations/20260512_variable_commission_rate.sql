-- Variable commission rate per provider (10-15%)
-- Replaces the hardcoded 12%/10% split with a per-provider configurable rate.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(4,3) DEFAULT 0.12;

ALTER TABLE public.profiles
  ADD CONSTRAINT chk_commission_rate_range
  CHECK (commission_rate >= 0.10 AND commission_rate <= 0.15);

-- Set existing white-label providers to 10%
UPDATE public.profiles
  SET commission_rate = 0.10
  WHERE provider_tier = 'white-label'
    AND (commission_rate IS NULL OR commission_rate = 0.12);
