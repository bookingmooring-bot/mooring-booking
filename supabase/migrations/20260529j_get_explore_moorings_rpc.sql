-- Unified Explore RPC: server-side filtering, sorting, availability and
-- geo-radius, with limit/offset pagination. Replaces the client-side
-- "fetch all 5927 active moorings + filter in JS" path and the missing
-- get_available_moorings RPC. Serves both the grid (small limit + offset)
-- and the map view (large limit, offset 0).
--
-- Modeled on search_concierge_moorings (date-overlap NOT EXISTS) and
-- nearby_active_moorings (PostGIS ST_DWithin, typed-table, grants).

CREATE OR REPLACE FUNCTION public.get_explore_moorings(
  p_limit          integer DEFAULT 24,
  p_offset         integer DEFAULT 0,
  p_check_in       date DEFAULT NULL,
  p_check_out      date DEFAULT NULL,
  p_query          text DEFAULT NULL,
  p_country        text DEFAULT NULL,
  p_layer          text DEFAULT NULL,          -- 'premium' | 'concierge' | 'explore'
  p_amenities      text[] DEFAULT NULL,        -- must contain all
  p_last_minute    boolean DEFAULT NULL,
  p_winter_storage boolean DEFAULT NULL,
  p_sort           text DEFAULT 'rating',      -- rating | price-low | price-high | reviews
  p_lat            double precision DEFAULT NULL,
  p_lng            double precision DEFAULT NULL,
  p_radius_km      double precision DEFAULT NULL
)
RETURNS TABLE (
  id uuid, name text, location text, country text, country_flag text,
  description text, lat double precision, lng double precision,
  price_per_night numeric, discount_percent int, wind_protection text,
  amenities text[], image_urls text[],
  is_last_minute boolean, is_now4today boolean, is_premium_listing boolean,
  winter_storage boolean, rating numeric, review_count int,
  status text, owner_id uuid, mooring_layer text,
  contact_email text, contact_phone text, address text,
  mooring_units int, max_boat_length numeric, max_draft numeric,
  max_beam numeric, vhf_channel text, operating_hours text,
  created_at timestamptz,
  distance_km double precision,
  total_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
  WITH base AS (
    SELECT m.*,
      CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL
           THEN extensions.ST_Distance(
                  m.geog, extensions.ST_MakePoint(p_lng, p_lat)::geography) / 1000.0
           ELSE NULL END AS dist_km
    FROM public.moorings m
    WHERE m.status = 'active'
      AND (p_query IS NULL OR (
              m.name     ILIKE '%' || p_query || '%'
           OR m.location ILIKE '%' || p_query || '%'
           OR m.country  ILIKE '%' || p_query || '%'))
      AND (p_country IS NULL OR m.country ILIKE '%' || p_country || '%')
      AND (p_layer IS NULL OR m.mooring_layer = p_layer)
      AND (p_amenities IS NULL OR m.amenities @> p_amenities)
      AND (p_last_minute    IS NOT TRUE OR m.is_last_minute = true)
      AND (p_winter_storage IS NOT TRUE OR m.winter_storage = true)
      AND (p_lat IS NULL OR p_lng IS NULL OR p_radius_km IS NULL
           OR extensions.ST_DWithin(
                m.geog, extensions.ST_MakePoint(p_lng, p_lat)::geography,
                p_radius_km * 1000))
      AND (p_check_in IS NULL OR p_check_out IS NULL OR NOT EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.mooring_id = m.id
              AND b.booking_status <> 'cancelled'
              AND b.check_in  < p_check_out
              AND b.check_out > p_check_in))
      AND (p_check_in IS NULL OR p_check_out IS NULL OR NOT EXISTS (
            SELECT 1 FROM public.mooring_availability ma
            WHERE ma.mooring_id = m.id
              AND ma.available = false
              AND ma.date >= p_check_in
              AND ma.date <  p_check_out))
  )
  SELECT
    base.id, base.name, base.location, base.country, base.country_flag,
    base.description, base.lat, base.lng, base.price_per_night,
    base.discount_percent, base.wind_protection, base.amenities, base.image_urls,
    base.is_last_minute, base.is_now4today, base.is_premium_listing,
    base.winter_storage, base.rating, base.review_count, base.status, base.owner_id,
    base.mooring_layer, base.contact_email, base.contact_phone, base.address,
    base.mooring_units, base.max_boat_length, base.max_draft, base.max_beam,
    base.vhf_channel, base.operating_hours, base.created_at,
    base.dist_km AS distance_km,
    count(*) OVER() AS total_count
  FROM base
  ORDER BY
    CASE base.mooring_layer WHEN 'premium' THEN 0 WHEN 'concierge' THEN 1 ELSE 2 END ASC,
    CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN base.dist_km END ASC NULLS LAST,
    CASE WHEN p_sort = 'price-low'  THEN base.price_per_night END ASC  NULLS LAST,
    CASE WHEN p_sort = 'price-high' THEN base.price_per_night END DESC NULLS LAST,
    CASE WHEN p_sort = 'reviews'    THEN base.review_count    END DESC NULLS LAST,
    base.rating DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
$fn$;

-- Lock the EXECUTE surface to the intended roles (guest Explore needs anon),
-- matching the security posture from 20260529c (manage anon/authenticated, not PUBLIC).
REVOKE EXECUTE ON FUNCTION public.get_explore_moorings(
  integer, integer, date, date, text, text, text, text[], boolean, boolean, text,
  double precision, double precision, double precision)
  FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_explore_moorings(
  integer, integer, date, date, text, text, text, text[], boolean, boolean, text,
  double precision, double precision, double precision)
  TO anon, authenticated, service_role;
