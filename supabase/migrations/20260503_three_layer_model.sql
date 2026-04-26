-- Phase 0: Three-layer mooring model + 5 subscription tiers + concierge booking

-- ─── Moorings: add layer classification ─────────────────────────────────────

ALTER TABLE public.moorings
  ADD COLUMN IF NOT EXISTS mooring_layer TEXT NOT NULL DEFAULT 'premium'
    CHECK (mooring_layer IN ('premium', 'concierge', 'explore'));

ALTER TABLE public.moorings
  ADD COLUMN IF NOT EXISTS source_url TEXT;

ALTER TABLE public.moorings
  ADD COLUMN IF NOT EXISTS data_source TEXT
    CHECK (data_source IS NULL OR data_source IN ('manual', 'osm', 'google_maps', 'registry'));

ALTER TABLE public.moorings
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

ALTER TABLE public.moorings
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_moorings_layer ON public.moorings (mooring_layer);

-- Existing moorings with an owner are premium partners
UPDATE public.moorings
  SET mooring_layer = 'premium'
  WHERE owner_id IS NOT NULL AND mooring_layer = 'premium';

-- ─── Bookings: add concierge booking fields ─────────────────────────────────

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_type TEXT NOT NULL DEFAULT 'instant'
    CHECK (booking_type IN ('instant', 'concierge'));

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS concierge_status TEXT
    CHECK (concierge_status IS NULL OR concierge_status IN ('pending_marina', 'confirmed', 'declined', 'expired'));

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_authorization_id TEXT;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS concierge_expires_at TIMESTAMPTZ;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS special_requests TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_concierge_expiry
  ON public.bookings (concierge_expires_at)
  WHERE booking_type = 'concierge' AND concierge_status = 'pending_marina';

-- ─── Profiles: expand subscription tiers ────────────────────────────────────

-- Drop existing check constraint if present, then add new one supporting all 7 values
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN (
    'basic', 'sailor', 'captain', 'charter-fleet', 'ai-only',
    'premium-monthly', 'premium-annual'
  ));
