# Daily Admin Report — Cron Job

## Cron Job Registration SQL

```sql
-- Daily admin platform summary at 07:00 UTC
SELECT cron.schedule(
  'job-admin-daily-report',
  '0 7 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := '{"alert_type": "daily_report"}'::jsonb
    );
  $$
);

-- To unschedule:
-- SELECT cron.unschedule('job-admin-daily-report');

-- To verify registration:
-- SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'job-admin-daily-report';
```

---

## What the Daily Report Includes

| Metric | Source |
|--------|--------|
| Nove rezervacije (sinoć) | `bookings.created_at` >= yesterday |
| Prihod potvrđenih | SUM(`total_price`) WHERE `booking_status` IN ('confirmed', 'completed') |
| Novi korisnici | `profiles.created_at` >= yesterday |
| Vezovi na čekanju | `moorings.status = 'pending'` |

> The `daily_report` logic runs **inside** the `send-admin-notification` Edge Function.
> No separate Edge Function needed for this alert type.

---

## Manual Test

To test the daily report immediately:

```sql
SELECT net.http_post(
  url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body    := '{"alert_type": "daily_report"}'::jsonb
);
```

Then check:
```sql
SELECT status_code, content, created FROM net._http_response ORDER BY id DESC LIMIT 1;
```
