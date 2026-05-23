-- Cron job: Weekly OSM import for all Mediterranean regions
-- Runs every Monday at 03:00 UTC

SELECT cron.schedule(
  'osm-import-weekly',
  '0 3 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"croatia","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

-- Stagger imports to avoid Overpass rate limits (15 min apart)

SELECT cron.schedule(
  'osm-import-weekly-italy',
  '15 3 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"italy","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'osm-import-weekly-greece',
  '30 3 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"greece","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'osm-import-weekly-turkey',
  '45 3 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"turkey","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'osm-import-weekly-adriatic',
  '0 4 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"montenegro","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'osm-import-weekly-west-med',
  '15 4 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"spain","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'osm-import-weekly-france',
  '30 4 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"france","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'osm-import-weekly-small',
  '45 4 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"slovenia","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'osm-import-weekly-albania',
  '0 5 * * 1',
  $$
  SELECT net.http_post(
    url        := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/osm-import',
    headers    := jsonb_build_object(
                    'Content-Type',  'application/json',
                    'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
                  ),
    body       := '{"region":"albania","featureTypes":["marina","anchorage","harbour"],"triggeredBy":"cron"}'::jsonb,
    timeout_milliseconds := 55000
  ) AS request_id;
  $$
);
