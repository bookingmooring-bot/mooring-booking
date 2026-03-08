# Testing Guide — Booking Lifecycle Automation

## How to Test Each Component

All tests use MCP tools directly. No browser needed.

---

## 1. Test `job-auto-cancel` Manually

### Step A: Check what would be cancelled (dry run SQL)

```sql
SELECT id, guest_email, guest_name, booking_status, payment_status, created_at, check_in
FROM bookings
WHERE booking_status = 'pending'
  AND payment_status = 'pending'
  AND created_at < NOW() - INTERVAL '48 hours'
ORDER BY created_at ASC;
```

### Step B: Invoke via browser subagent or curl

```bash
curl -X POST https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-auto-cancel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MjE1NzMsImV4cCI6MjA1NDE5NzU3M30.UKBMVN2YJKcqDhYoiWdYnHnPBXEHvPkHGQmhw1SloE0" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Step C: Verify result

```sql
-- After the job runs, confirm cancelled bookings have correct data
SELECT id, booking_status, cancelled_at, cancelled_by, cancellation_reason
FROM bookings
WHERE cancelled_by = 'system'
ORDER BY cancelled_at DESC
LIMIT 5;
```

---

## 2. Test `job-auto-complete` Manually

### Step A: Create a test booking that should be completed

```sql
-- Insert a test booking with check_out yesterday
INSERT INTO bookings (
  booking_status, check_in, check_out, guest_email, guest_name, 
  total_price, confirmation_code, nights, price_per_night,
  mooring_id, user_id, provider_id
)
SELECT
  'confirmed',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE - INTERVAL '1 day',
  'test@example.com',
  'Test Guest',
  250,
  'TEST-AUTO-COMPLETE',
  4,
  62.5,
  id,  -- first available mooring
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'provider' LIMIT 1)
FROM moorings LIMIT 1;
```

### Step B: Invoke the function

```bash
curl -X POST https://bblxawscmyzelinidkmb.supabase.co/functions/v1/job-auto-complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MjE1NzMsImV4cCI6MjA1NDE5NzU3M30.UKBMVN2YJKcqDhYoiWdYnHnPBXEHvPkHGQmhw1SloE0" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Step C: Verify

```sql
SELECT id, booking_status, completed_at, review_request_sent
FROM bookings
WHERE confirmation_code = 'TEST-AUTO-COMPLETE';

-- Cleanup
DELETE FROM bookings WHERE confirmation_code = 'TEST-AUTO-COMPLETE';
```

---

## 3. Test `on-booking-status-change` (DB Trigger)

### Step A: Verify trigger is installed

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'bookings';
```

### Step B: Manually update a booking status

```sql
-- Find a confirmed booking to test with
SELECT id, guest_email, guest_name, booking_status FROM bookings WHERE booking_status = 'confirmed' LIMIT 1;

-- Trigger the status change (replace <UUID> with the actual ID)
UPDATE bookings
SET booking_status = 'cancelled', cancelled_at = NOW(), cancelled_by = 'system'
WHERE id = '<UUID>';
```

The DB trigger fires automatically → `on-booking-status-change` function is called → emails are sent.

### Step C: Check Edge Function logs

Use MCP tool: `get_logs(project_id: "bblxawscmyzelinidkmb", service: "edge-function")`

Look for: `on-booking-status-change` invocations and any errors.

---

## 4. Test Cron Jobs Are Scheduled

```sql
-- List all cron jobs and their schedules
SELECT jobname, schedule, active, jobid
FROM cron.job
ORDER BY jobname;
```

Expected output (after setup):
```
job-auto-cancel-expired-bookings   | 0 * * * *    | t
job-auto-complete-past-bookings    | 0 6 * * *    | t
job-checkin-reminder               | 0 8 * * *    | t
job-review-requests                | 0 10 * * *   | t
```

---

## 5. Check Edge Function Logs

After any test, check logs for errors:

```
get_logs(project_id: "bblxawscmyzelinidkmb", service: "edge-function")
```

Common errors to look for:
- `"booking_status" column does not exist` → Wrong column name, use `booking_status` not `status`
- `Resend Error: 403` → Invalid API key
- `net.http_post` fails → pg_net extension not installed
- `Cannot read properties of null` → Missing join data (mooring or provider not found)

---

## 6. End-to-End Test Flow

1. Create a test booking with `booking_status = 'pending'`, dated `created_at` = 3 days ago
2. Invoke `job-auto-cancel` → booking should become `cancelled`
3. Check email was sent to `guest_email`
4. Create another booking with `booking_status = 'confirmed'`, `check_out` = yesterday
5. Invoke `job-auto-complete` → booking should become `completed`
6. Check email was sent asking for review
7. Manually change `booking_status` from `pending` to `confirmed`
8. Check trigger fired → `on-booking-status-change` logs show invocation
9. Check email inboxes for confirmation emails
