# Cron & Trigger SQL — Booking Lifecycle Automation

Run all SQL via `execute_sql` MCP tool with `project_id: bblxawscmyzelinidkmb`.

---

## Prerequisites

```sql
-- Enable pg_cron (already enabled, but safe to re-run)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for HTTP calls from triggers (already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

## Register Cron Jobs

### job-auto-cancel (hourly)

```sql
SELECT cron.schedule(
  'job-auto-cancel-expired-bookings',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-auto-cancel',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MjE1NzMsImV4cCI6MjA1NDE5NzU3M30.UKBMVN2YJKcqDhYoiWdYnHnPBXEHvPkHGQmhw1SloE0"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### job-auto-complete (daily at 06:00 UTC)

```sql
SELECT cron.schedule(
  'job-auto-complete-past-bookings',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-auto-complete',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MjE1NzMsImV4cCI6MjA1NDE5NzU3M30.UKBMVN2YJKcqDhYoiWdYnHnPBXEHvPkHGQmhw1SloE0"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## DB Trigger — on-booking-status-change

This fires every time `booking_status` is updated on any booking row.
The trigger calls the `on-booking-status-change` Edge Function with full context.

```sql
-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_status IS DISTINCT FROM OLD.booking_status THEN
    PERFORM net.http_post(
      url := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/on-booking-status-change',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'booking_id',       NEW.id,
        'old_status',       OLD.booking_status,
        'new_status',       NEW.booking_status,
        'guest_email',      NEW.guest_email,
        'guest_name',       NEW.guest_name,
        'check_in',         NEW.check_in,
        'check_out',        NEW.check_out,
        'total_price',      NEW.total_price,
        'confirmation_code', NEW.confirmation_code
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger to the bookings table
DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;

CREATE TRIGGER booking_status_change_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_status_change();
```

---

## Verify Everything Is Registered

```sql
-- Check cron jobs
SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;

-- Check trigger exists
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'bookings';

-- Manually test job-auto-cancel (find candidates)
SELECT id, booking_status, payment_status, created_at
FROM bookings
WHERE booking_status = 'pending'
  AND payment_status = 'pending'
  AND created_at < NOW() - INTERVAL '48 hours';

-- Manually test job-auto-complete (find candidates)
SELECT id, booking_status, check_out
FROM bookings
WHERE booking_status = 'confirmed'
  AND check_out < CURRENT_DATE;
```

---

## Remove / Cleanup

```sql
-- Remove cron jobs
SELECT cron.unschedule('job-auto-cancel-expired-bookings');
SELECT cron.unschedule('job-auto-complete-past-bookings');

-- Remove DB trigger
DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
DROP FUNCTION IF EXISTS notify_booking_status_change();
```
