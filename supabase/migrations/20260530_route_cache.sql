-- Faza 2: precise post-booking sea routes.
-- Cache table for server-computed routes + a booking-gate helper. The cache holds
-- no PII (coordinates only) but is locked to the service-role edge function:
-- RLS on, no policies => anon/authenticated read zero rows, service-role bypasses RLS.

CREATE TABLE IF NOT EXISTS public.route_cache (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mooring_id    uuid NOT NULL REFERENCES public.moorings(id) ON DELETE CASCADE,
  origin_key    text NOT NULL,              -- origin lat/lng rounded to a ~100 m grid cell
  graph_version text NOT NULL,              -- matches the committed graph build id (auto-invalidates on rebuild)
  positions     jsonb NOT NULL,             -- [[lat,lng],...] in Leaflet order, ready to draw
  length_nm     double precision NOT NULL,
  hit_count     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz NOT NULL DEFAULT now()
);

-- One cached route per (mooring, origin cell, graph version) — also the read key.
CREATE UNIQUE INDEX IF NOT EXISTS route_cache_uq
  ON public.route_cache (mooring_id, origin_key, graph_version);
CREATE INDEX IF NOT EXISTS route_cache_created_idx ON public.route_cache (created_at);

ALTER TABLE public.route_cache ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated; only service-role (bypasses RLS) touches this.
REVOKE ALL ON public.route_cache FROM anon, authenticated;

COMMENT ON TABLE public.route_cache IS
  'Server-computed precise sea routes keyed by mooring + origin cell + graph version. Written/read only by the sea-route edge function (service-role). RLS on, no policies = no client access.';

-- Booking gate: does this user have a paid/confirmed booking for this mooring?
-- Canonical paid condition (from create-booking-payment / stripe-connect-webhook /
-- guest-quote-accept / job-auto-complete): card='paid', concierge/now4today='completed',
-- cash=confirmed. SECURITY DEFINER so the edge function can also call it via RPC.
CREATE OR REPLACE FUNCTION public.has_paid_booking(p_user uuid, p_mooring uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.user_id = p_user
      AND b.mooring_id = p_mooring
      AND b.booking_status IN ('confirmed','completed')
      AND ( b.payment_status IN ('paid','completed')
            OR (b.payment_method = 'cash' AND b.booking_status = 'confirmed') )
  );
$fn$;

REVOKE EXECUTE ON FUNCTION public.has_paid_booking(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_paid_booking(uuid,uuid) TO service_role;
