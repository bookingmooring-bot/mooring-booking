-- Add mooring_layer to nearby_active_moorings RPC return + layer-based sort priority
CREATE OR REPLACE FUNCTION public.nearby_active_moorings(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 150,
  min_boat_length numeric default null
)
RETURNS TABLE (
  id uuid,
  name text,
  location text,
  country text,
  country_flag text,
  lat double precision,
  lng double precision,
  price_per_night numeric,
  max_boat_length numeric,
  max_draft numeric,
  amenities text[],
  wind_protection text,
  is_last_minute boolean,
  is_now4today boolean,
  is_verified_partner boolean,
  is_premium_listing boolean,
  winter_storage boolean,
  mooring_units integer,
  rating numeric,
  review_count integer,
  distance_km double precision,
  mooring_layer text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $fn$
  SELECT
    m.id, m.name, m.location, m.country, m.country_flag,
    m.lat, m.lng, m.price_per_night, m.max_boat_length, m.max_draft,
    m.amenities, m.wind_protection, m.is_last_minute, m.is_now4today,
    m.is_verified_partner, m.is_premium_listing, m.winter_storage,
    m.mooring_units, m.rating, m.review_count,
    (extensions.ST_Distance(
      m.geog,
      extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography
    ) / 1000.0)::double precision AS distance_km,
    COALESCE(m.mooring_layer, 'premium')::text AS mooring_layer
  FROM public.moorings m
  WHERE m.status = 'active'
    AND m.geog IS NOT NULL
    AND extensions.ST_DWithin(
      m.geog,
      extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography,
      radius_km * 1000.0
    )
    AND (min_boat_length IS NULL OR m.max_boat_length IS NULL OR m.max_boat_length >= min_boat_length)
  ORDER BY
    CASE COALESCE(m.mooring_layer, 'premium')
      WHEN 'premium' THEN 0
      WHEN 'concierge' THEN 1
      WHEN 'explore' THEN 2
      ELSE 3
    END ASC,
    m.is_verified_partner DESC NULLS LAST,
    m.is_premium_listing DESC NULLS LAST,
    distance_km ASC,
    m.rating DESC NULLS LAST
  LIMIT 50;
$fn$;

GRANT EXECUTE ON FUNCTION public.nearby_active_moorings(double precision, double precision, double precision, numeric)
  TO anon, authenticated, service_role;
