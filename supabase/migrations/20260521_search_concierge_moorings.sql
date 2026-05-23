-- RPC function for MCP server: search concierge moorings with availability check
CREATE OR REPLACE FUNCTION public.search_concierge_moorings(
  p_query text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_check_in date DEFAULT NULL,
  p_check_out date DEFAULT NULL,
  p_min_boat_length numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_radius_km double precision DEFAULT 50,
  p_limit integer DEFAULT 10
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', m.id,
    'name', m.name,
    'location', m.location,
    'country', m.country,
    'lat', m.lat,
    'lng', m.lng,
    'price_per_night', m.price_per_night,
    'max_boat_length', m.max_boat_length,
    'amenities', m.amenities,
    'contact_email', m.contact_email,
    'contact_phone', m.contact_phone,
    'rating', m.rating,
    'review_count', m.review_count,
    'image_urls', m.image_urls,
    'distance_km', CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND m.lat IS NOT NULL AND m.lng IS NOT NULL
      THEN ROUND((ST_Distance(
        m.geog,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
      ) / 1000)::numeric, 1)
      ELSE NULL
    END
  )
  FROM moorings m
  WHERE m.mooring_layer = 'concierge'
    AND m.status = 'active'
    -- Text search
    AND (p_query IS NULL OR (
      m.name ILIKE '%' || p_query || '%'
      OR m.location ILIKE '%' || p_query || '%'
      OR m.country ILIKE '%' || p_query || '%'
    ))
    -- Country filter
    AND (p_country IS NULL OR m.country ILIKE '%' || p_country || '%')
    -- Boat length filter
    AND (p_min_boat_length IS NULL OR m.max_boat_length >= p_min_boat_length)
    -- Price filter
    AND (p_max_price IS NULL OR m.price_per_night <= p_max_price)
    -- Geo-proximity filter
    AND (p_lat IS NULL OR p_lng IS NULL OR m.geog IS NULL OR
      ST_DWithin(
        m.geog,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_km * 1000
      )
    )
    -- Availability: no conflicting confirmed bookings
    AND (p_check_in IS NULL OR p_check_out IS NULL OR NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.mooring_id = m.id
        AND b.booking_status NOT IN ('cancelled')
        AND b.check_in < p_check_out
        AND b.check_out > p_check_in
    ))
    -- Availability: no blocked dates
    AND (p_check_in IS NULL OR p_check_out IS NULL OR NOT EXISTS (
      SELECT 1 FROM mooring_availability ma
      WHERE ma.mooring_id = m.id
        AND ma.date >= p_check_in
        AND ma.date < p_check_out
        AND ma.available = false
    ))
  ORDER BY
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND m.geog IS NOT NULL
      THEN ST_Distance(m.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
      ELSE 0
    END,
    m.rating DESC NULLS LAST
  LIMIT p_limit;
END;
$$;
