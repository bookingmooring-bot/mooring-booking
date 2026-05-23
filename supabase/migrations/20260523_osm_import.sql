-- OSM Import: dodaj osm_id na moorings + import log tabela

-- 1. Dodaj osm_id kolonu za precizni dedup pri reimportu
ALTER TABLE public.moorings ADD COLUMN IF NOT EXISTS osm_id bigint;
CREATE INDEX IF NOT EXISTS idx_moorings_osm_id ON public.moorings (osm_id) WHERE osm_id IS NOT NULL;

-- 2. Import log tabela
CREATE TABLE IF NOT EXISTS public.osm_import_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  bbox jsonb,
  feature_types text[],
  fetched_count int DEFAULT 0,
  inserted_count int DEFAULT 0,
  updated_count int DEFAULT 0,
  skipped_count int DEFAULT 0,
  error_count int DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  triggered_by text DEFAULT 'admin_manual' CHECK (triggered_by IN ('admin_manual', 'cron')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

ALTER TABLE public.osm_import_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read import logs"
  ON public.osm_import_log FOR SELECT USING (is_admin());

CREATE POLICY "Service role can manage import logs"
  ON public.osm_import_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
