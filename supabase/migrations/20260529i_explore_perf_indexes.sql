-- Explore page performance indexes
-- Supports the get_explore_moorings RPC: price sort, amenities filter,
-- date-availability NOT EXISTS probes against bookings and mooring_availability.
-- Country/layer (idx_moorings_country_layer) and PostGIS geog (moorings_geog_gix)
-- already exist in the base schema.

-- price sort / future server-side price filter
CREATE INDEX IF NOT EXISTS idx_moorings_active_price
  ON public.moorings (price_per_night) WHERE status = 'active';

-- amenities @> filter (array contains)
CREATE INDEX IF NOT EXISTS idx_moorings_amenities_gin
  ON public.moorings USING gin (amenities);

-- availability overlap probe (NOT EXISTS on bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_avail_overlap
  ON public.bookings (mooring_id, check_in, check_out)
  WHERE booking_status <> 'cancelled';

-- blocked-dates probe (NOT EXISTS on mooring_availability)
CREATE INDEX IF NOT EXISTS idx_mooring_availability_blocked
  ON public.mooring_availability (mooring_id, date) WHERE available = false;
