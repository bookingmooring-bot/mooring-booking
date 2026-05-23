-- pg_cron: Zakazani jobovi za sve periodične Edge funkcije
-- Koristi pg_cron + pg_net za pozivanje Supabase Edge Functions na intervalu

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Helper: bazni URL za Edge Functions
DO $$
DECLARE
  base_url text := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1';
  auth_header text;
BEGIN
  SELECT 'Bearer ' || decrypted_secret INTO auth_header
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
  LIMIT 1;

  IF auth_header IS NULL THEN
    RAISE WARNING 'SUPABASE_SERVICE_ROLE_KEY not found in vault. Cron jobs will fail until secret is added.';
  END IF;
END $$;

-- ============================================================
-- 1. job-auto-cancel: Otkazuje pending bookinge bez plaćanja nakon 48h
--    Interval: svaki sat
-- ============================================================
SELECT cron.schedule(
  'job-auto-cancel',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-auto-cancel',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================
-- 2. job-auto-complete: Označava bookinge kao završene nakon check-out datuma
--    Interval: svaki sat
-- ============================================================
SELECT cron.schedule(
  'job-auto-complete',
  '15 * * * *',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-auto-complete',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================
-- 3. job-concierge-expiry: Otkazuje concierge zahtjeve nakon 48h bez odgovora
--    Interval: svaki sat
-- ============================================================
SELECT cron.schedule(
  'job-concierge-expiry',
  '30 * * * *',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-concierge-expiry',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================
-- 4. job-checkin-reminders: Šalje podsjetnike 24h prije dolaska
--    Interval: svakih 6h (00:00, 06:00, 12:00, 18:00 UTC)
-- ============================================================
SELECT cron.schedule(
  'job-checkin-reminders',
  '0 0,6,12,18 * * *',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-checkin-reminders',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================
-- 5. job-onboarding-drip: Onboarding email sekvence za nove providere
--    Interval: jednom dnevno u 08:00 UTC
-- ============================================================
SELECT cron.schedule(
  'job-onboarding-drip',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-onboarding-drip',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================
-- 6. job-review-requests: Zahtjevi za recenziju 1 dan nakon check-outa
--    Interval: jednom dnevno u 10:00 UTC
-- ============================================================
SELECT cron.schedule(
  'job-review-requests',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-review-requests',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================
-- 7. check-storm-alerts: Provjera opasnih vremenskih uvjeta
--    Interval: svakih 3h (01:00, 04:00, 07:00, 10:00, 13:00, 16:00, 19:00, 22:00 UTC)
-- ============================================================
SELECT cron.schedule(
  'check-storm-alerts',
  '0 1,4,7,10,13,16,19,22 * * *',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/check-storm-alerts',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{}'::jsonb,
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================
-- Potvrda: Prikaz svih zakazanih jobova
-- ============================================================
SELECT jobid, jobname, schedule, active
FROM cron.job
ORDER BY jobname;
