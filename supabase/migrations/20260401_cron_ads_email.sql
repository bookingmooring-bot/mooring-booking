-- pg_cron: Pošalji Ads Plan email 01.04.2026. u 04:21
-- Pokrenuti u Supabase SQL Editor ako CLI deploy nije dostupan

-- 1. Provjeri da pg_cron i pg_net extensioni postoje
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Email logs tabela (ako ne postoji)
CREATE TABLE IF NOT EXISTS email_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient     text NOT NULL,
  subject       text,
  status        text,
  resend_id     text,
  error_message text,
  sent_at       timestamptz DEFAULT now(),
  campaign      text,
  created_at    timestamptz DEFAULT now()
);

-- 3. Zakazati cron job: 01.04.2026. u 04:21 UTC
-- Cron format: minute hour day-of-month month day-of-week
-- '21 4 1 4 *' = svaki April 1. u 04:21 (jednokratno, brišemo poslije)
SELECT cron.schedule(
  'ads-plan-email-0104-0421',   -- naziv joba
  '21 4 1 4 *',                  -- 04:21 on April 1st
  $$
  SELECT
    net.http_post(
      url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-ads-plan-email',
      headers    := jsonb_build_object(
                      'Content-Type',  'application/json',
                      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                    ),
      body       := '{}'::jsonb,
      timeout_milliseconds := 30000
    ) AS request_id;
  $$
);

-- 4. Potvrda
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'ads-plan-email-0104-0421';
