-- Faza 2: store regional routing graphs in the DB instead of bundling them as
-- static files in the edge function. Keeps the function deployable via the
-- Management API (no static-file upload needed) and makes adding a new region a
-- plain INSERT — no redeploy, no 10 MB source limit. The edge function loads the
-- region's graph once per warm instance and caches it in memory.

CREATE TABLE IF NOT EXISTS public.sea_route_graph (
  region       text PRIMARY KEY,              -- 'adriatic', 'aegean', ...
  label        text NOT NULL,
  bbox         double precision[] NOT NULL,   -- [minLng, minLat, maxLng, maxLat]
  version      text NOT NULL,                 -- graph build id (content hash)
  -- gzipped compact graph { nodes:[[lng,lat],...], edges:[[ai,bi,weightNM],...] },
  -- base64-encoded. Stored gzipped so the row stays ~1 MB (fits the Management
  -- API upload limit) and transfers small to the edge function, which inflates it.
  graph_gz_b64 text NOT NULL,
  nodes        integer NOT NULL,
  edges        integer NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sea_route_graph ENABLE ROW LEVEL SECURITY;
-- Graphs are read only by the service-role edge function. No client policies.
REVOKE ALL ON public.sea_route_graph FROM anon, authenticated;

COMMENT ON TABLE public.sea_route_graph IS
  'Regional sea-routing graphs (compact { nodes, edges }). Read by the sea-route edge function (service-role) to compute precise routes. RLS on, no policies = no client access.';
