-- Base schema for Mooring Booking platform
-- This migration captures the core tables as they exist in production.
-- It is idempotent: every CREATE uses IF NOT EXISTS.

-- =============================================================================
-- Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- Helper functions
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =============================================================================
-- 1. profiles
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                          uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name                   text,
  email                       text,
  phone                       text,
  avatar_url                  text,
  role                        text DEFAULT 'user',
  subscription_tier           text DEFAULT 'basic',
  subscription_expires_at     timestamptz,
  ai_questions_used           int DEFAULT 0,
  preferred_language          text DEFAULT 'en',
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now(),
  address                     text,
  whatsapp                    text,
  provider_consent_at         timestamptz,
  boat_name                   text,
  boat_length                 numeric,
  guest_rating                numeric,
  guest_rating_count          int DEFAULT 0,
  stripe_customer_id          text,
  stripe_account_id           text,
  stripe_onboarding_complete  boolean NOT NULL DEFAULT false,
  expo_push_token             text,
  last_known_lat              double precision,
  last_known_lng              double precision,
  storm_alerts_enabled        boolean NOT NULL DEFAULT true,
  storm_wind_threshold_kn     int NOT NULL DEFAULT 35,
  storm_wave_threshold_m      numeric NOT NULL DEFAULT 3.0,
  provider_tier               text NOT NULL DEFAULT 'standard',
  white_label_berth_tier      text,
  white_label_subscription_id text,
  white_label_activated_at    timestamptz,
  commission_rate             numeric DEFAULT 0.12,
  provider_slug               text
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_provider_slug
  ON public.profiles (provider_slug) WHERE provider_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_provider_tier
  ON public.profiles (provider_tier) WHERE provider_tier = 'white-label';
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id
  ON public.profiles (stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles readable"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Users insert own profile"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================================================
-- 2. moorings
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.moorings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id             uuid REFERENCES public.profiles(id),
  name                 text NOT NULL,
  location             text NOT NULL,
  country              text NOT NULL,
  country_flag         text,
  description          text,
  lat                  double precision NOT NULL,
  lng                  double precision NOT NULL,
  price_per_night      numeric NOT NULL,
  discount_percent     int DEFAULT 0,
  wind_protection      text DEFAULT 'good',
  amenities            text[] DEFAULT '{}',
  max_boat_length      numeric,
  max_draft            numeric,
  max_beam             numeric,
  mooring_units        int DEFAULT 1,
  image_urls           text[] DEFAULT '{}',
  is_last_minute       boolean DEFAULT false,
  is_now4today         boolean DEFAULT false,
  is_premium_listing   boolean DEFAULT false,
  winter_storage       boolean DEFAULT false,
  winter_storage_type  text,
  winter_price_monthly numeric,
  winter_services      text[] DEFAULT '{}',
  payment_methods      text[] DEFAULT '{}',
  owner_name           text,
  owner_phone          text,
  owner_whatsapp       text,
  status               text DEFAULT 'active',
  stripe_account_id    text,
  rating               numeric DEFAULT 0,
  review_count         int DEFAULT 0,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now(),
  marketing_tools      boolean DEFAULT false,
  insurance_mediation  boolean DEFAULT false,
  is_verified_partner  boolean NOT NULL DEFAULT false,
  geog                 geography(Point, 4326),
  mooring_layer        text NOT NULL DEFAULT 'premium',
  source_url           text,
  data_source          text,
  contact_email        text,
  contact_phone        text,
  address              text,
  vhf_channel          text,
  operating_hours      text,
  price_low_season     numeric,
  price_high_season    numeric,
  price_annual         numeric,
  pricing_notes        text,
  pricing_url          text,
  online_booking       boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_moorings_owner            ON public.moorings (owner_id);
CREATE INDEX IF NOT EXISTS idx_moorings_country          ON public.moorings (country);
CREATE INDEX IF NOT EXISTS idx_moorings_location         ON public.moorings (location);
CREATE INDEX IF NOT EXISTS idx_moorings_status           ON public.moorings (status);
CREATE INDEX IF NOT EXISTS idx_moorings_layer            ON public.moorings (mooring_layer);
CREATE INDEX IF NOT EXISTS idx_moorings_country_layer    ON public.moorings (country, mooring_layer) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_moorings_verified_partner ON public.moorings (is_verified_partner) WHERE is_verified_partner = true;
CREATE INDEX IF NOT EXISTS moorings_geog_gix             ON public.moorings USING gist (geog);

ALTER TABLE public.moorings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active moorings public read"    ON public.moorings FOR SELECT USING (status = 'active' OR owner_id = auth.uid());
CREATE POLICY "Admins can do everything on moorings" ON public.moorings FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Auth users create moorings"     ON public.moorings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());
CREATE POLICY "Owners update own moorings"     ON public.moorings FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners delete own moorings"     ON public.moorings FOR DELETE USING (owner_id = auth.uid());

-- =============================================================================
-- 3. bookings
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mooring_id                 uuid REFERENCES public.moorings(id),
  user_id                    uuid REFERENCES public.profiles(id),
  provider_id                uuid REFERENCES public.profiles(id),
  check_in                   date NOT NULL,
  check_out                  date NOT NULL,
  boat_name                  text,
  boat_length                numeric,
  guest_name                 text NOT NULL,
  guest_email                text NOT NULL,
  guest_phone                text,
  nights                     int NOT NULL,
  price_per_night            numeric NOT NULL,
  total_price                numeric NOT NULL,
  commission_amount          numeric DEFAULT 0,
  commission_rate            numeric DEFAULT 0.15,
  payment_method             text,
  payment_status             text DEFAULT 'pending',
  booking_status             text DEFAULT 'pending',
  confirmation_code          text,
  is_now4today               boolean DEFAULT false,
  created_at                 timestamptz DEFAULT now(),
  updated_at                 timestamptz DEFAULT now(),
  referral_code              text,
  affiliate_commission       numeric DEFAULT 0,
  stripe_payment_intent_id   text,
  stripe_checkout_session_id text,
  cancelled_at               timestamptz,
  completed_at               timestamptz,
  reminder_sent              boolean DEFAULT false,
  review_request_sent        boolean DEFAULT false,
  cancelled_by               text,
  cancellation_reason        text,
  transaction_fee            numeric NOT NULL DEFAULT 0,
  booking_type               text NOT NULL DEFAULT 'instant',
  concierge_status           text,
  stripe_authorization_id    text,
  concierge_expires_at       timestamptz,
  special_requests           text,
  whatsapp_notification_sent boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_bookings_mooring              ON public.bookings (mooring_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user                 ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status               ON public.bookings (booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_referral_code        ON public.bookings (referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent ON public.bookings (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_concierge_expiry     ON public.bookings (concierge_expires_at) WHERE booking_type = 'concierge' AND concierge_status = 'pending_marina';

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on bookings" ON public.bookings FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Auth users create bookings"           ON public.bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users read own bookings"              ON public.bookings FOR SELECT USING (user_id = auth.uid() OR provider_id = auth.uid());
CREATE POLICY "Users update own bookings"            ON public.bookings FOR UPDATE USING (user_id = auth.uid() OR provider_id = auth.uid());
CREATE POLICY "Users delete own cancelled bookings"  ON public.bookings FOR DELETE USING (user_id = auth.uid() AND booking_status = 'cancelled');

-- =============================================================================
-- 4. reviews
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mooring_id uuid REFERENCES public.moorings(id),
  user_id    uuid REFERENCES public.profiles(id),
  booking_id uuid REFERENCES public.bookings(id),
  rating     int NOT NULL,
  comment    text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT reviews_booking_id_unique UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_mooring ON public.reviews (mooring_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on reviews" ON public.reviews FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Reviews public read"                 ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Auth users create reviews"           ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =============================================================================
-- 5. mooring_availability
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.mooring_availability (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mooring_id   uuid REFERENCES public.moorings(id),
  date         date NOT NULL,
  available    boolean DEFAULT true,
  custom_price numeric,
  CONSTRAINT mooring_availability_mooring_id_date_key UNIQUE (mooring_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_mooring_date ON public.mooring_availability (mooring_id, date);

ALTER TABLE public.mooring_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on mooring_availability" ON public.mooring_availability FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Availability public read"  ON public.mooring_availability FOR SELECT USING (true);
CREATE POLICY "Owners manage availability" ON public.mooring_availability FOR INSERT WITH CHECK (mooring_id IN (SELECT id FROM moorings WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update availability" ON public.mooring_availability FOR UPDATE USING (mooring_id IN (SELECT id FROM moorings WHERE owner_id = auth.uid()));
CREATE POLICY "Owners delete availability" ON public.mooring_availability FOR DELETE USING (mooring_id IN (SELECT id FROM moorings WHERE owner_id = auth.uid()));

-- =============================================================================
-- 6. commissions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.commissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.profiles(id),
  booking_id  uuid REFERENCES public.bookings(id),
  amount      numeric NOT NULL,
  status      text DEFAULT 'pending',
  due_date    date,
  paid_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commissions_provider ON public.commissions (provider_id);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on commissions" ON public.commissions FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Providers read own commissions"          ON public.commissions FOR SELECT USING (provider_id = auth.uid());

-- =============================================================================
-- 7. affiliate_members
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id),
  referral_code   text NOT NULL UNIQUE,
  status          text NOT NULL DEFAULT 'pending',
  commission_rate numeric NOT NULL DEFAULT 10.00,
  total_clicks    int NOT NULL DEFAULT 0,
  total_referrals int NOT NULL DEFAULT 0,
  total_earned    numeric NOT NULL DEFAULT 0.00,
  created_at      timestamptz NOT NULL DEFAULT now(),
  approved_at     timestamptz,
  notes           text
);

CREATE INDEX IF NOT EXISTS idx_affiliate_members_referral_code ON public.affiliate_members (referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_members_user_id       ON public.affiliate_members (user_id);

ALTER TABLE public.affiliate_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all affiliates"    ON public.affiliate_members FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Affiliates can read own record"      ON public.affiliate_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can apply to become affiliate" ON public.affiliate_members FOR INSERT WITH CHECK (user_id = auth.uid());
