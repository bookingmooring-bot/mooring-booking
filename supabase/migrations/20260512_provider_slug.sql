-- White-label provider slug for public profile URLs (mooring-booking.com/:slug)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS provider_slug TEXT;

-- URL-safe slug: 4-50 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_provider_slug_format
  CHECK (provider_slug IS NULL OR provider_slug ~ '^[a-z0-9][a-z0-9\-]{2,48}[a-z0-9]$');

-- Only white-label providers can have a slug
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_slug_requires_white_label
  CHECK (provider_slug IS NULL OR provider_tier = 'white-label');

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_provider_slug
  ON public.profiles (provider_slug)
  WHERE provider_slug IS NOT NULL;
