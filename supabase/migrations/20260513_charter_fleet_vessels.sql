-- Charter Fleet: extend vessel profiles and link bookings to fleet vessels

-- New columns for fleet management on user_vessel_profiles
ALTER TABLE public.user_vessel_profiles
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS home_port text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS charter_notes text,
  ADD COLUMN IF NOT EXISTS image_url text;

DO $$ BEGIN
  ALTER TABLE public.user_vessel_profiles
    ADD CONSTRAINT chk_vessel_status CHECK (status IN ('available', 'in-use', 'maintenance'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Link bookings to specific fleet vessels
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS vessel_id uuid REFERENCES public.user_vessel_profiles(id);

CREATE INDEX IF NOT EXISTS idx_bookings_vessel_id
  ON public.bookings (vessel_id) WHERE vessel_id IS NOT NULL;
