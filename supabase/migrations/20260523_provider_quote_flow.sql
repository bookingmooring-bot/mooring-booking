-- Provider Quote Flow: adds price quoting to concierge + now4today bookings
-- Provider sends a price → Guest accepts/declines → Booking confirmed

-- 1. New columns on bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS quoted_price numeric,
  ADD COLUMN IF NOT EXISTS quote_token text,
  ADD COLUMN IF NOT EXISTS guest_response_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS quote_responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS guest_responded_at timestamptz;

-- 2. Indexes for quote flow
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_quote_token
  ON public.bookings (quote_token) WHERE quote_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_quote_response_expiry
  ON public.bookings (guest_response_expires_at)
  WHERE booking_type IN ('concierge', 'now4today')
    AND concierge_status = 'price_quoted';

CREATE INDEX IF NOT EXISTS idx_bookings_now4today_expiry
  ON public.bookings (concierge_expires_at)
  WHERE booking_type = 'now4today' AND concierge_status = 'pending_marina';

-- 3. Update cron: run expiry job every 15 min (was hourly) for Now4Today's tight windows
SELECT cron.unschedule('job-concierge-expiry');

SELECT cron.schedule(
  'job-concierge-expiry',
  '*/15 * * * *',
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
