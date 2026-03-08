# DB Triggers for Admin Notifications

All triggers use `pg_net.http_post` (async, non-blocking) to call
the `send-admin-notification` Edge Function.

---

## Prerequisites

```sql
-- pg_net must be enabled (already enabled from booking-lifecycle-automation)
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

## Migration 1: New Mooring Pending → Admin Alert

```sql
CREATE OR REPLACE FUNCTION notify_admin_new_mooring()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  -- Only alert when status is 'pending' (new submission awaiting approval)
  IF NEW.status = 'pending' THEN
    payload := jsonb_build_object(
      'alert_type',   'new_provider',
      'mooring_id',   NEW.id,
      'mooring_name', NEW.name,
      'location',     NEW.location,
      'provider_id',  NEW.owner_id   -- moorings use owner_id (NOT provider_id!)
    );

    PERFORM net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := payload
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_mooring_insert_notify_admin ON moorings;
CREATE TRIGGER on_mooring_insert_notify_admin
  AFTER INSERT ON moorings
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_mooring();
```

---

## Migration 2: New Affiliate Application → Admin Alert

```sql
CREATE OR REPLACE FUNCTION notify_admin_new_affiliate()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  IF NEW.status = 'pending' THEN
    payload := jsonb_build_object(
      'alert_type',    'new_affiliate',
      'affiliate_id',  NEW.id,
      'user_id',       NEW.user_id::text,
      'referral_code', NEW.referral_code
    );

    PERFORM net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := payload
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_affiliate_insert_notify_admin ON affiliate_members;
CREATE TRIGGER on_affiliate_insert_notify_admin
  AFTER INSERT ON affiliate_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_affiliate();
```

---

## Migration 3: Large Booking (>€500) → Admin Alert

```sql
CREATE OR REPLACE FUNCTION notify_admin_large_booking()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  mooring_name TEXT;
BEGIN
  -- Alert only for large bookings
  IF NEW.total_price > 500 THEN
    SELECT name INTO mooring_name FROM moorings WHERE id = NEW.mooring_id;

    payload := jsonb_build_object(
      'alert_type',   'large_booking',
      'booking_id',   NEW.id,
      'mooring_name', COALESCE(mooring_name, 'Nepoznat vez'),
      'guest_name',   NEW.guest_name,
      'check_in',     NEW.check_in,
      'check_out',    NEW.check_out,
      'total_price',  NEW.total_price
    );

    PERFORM net.http_post(
      url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body    := payload
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_large_booking_notify_admin ON bookings;
CREATE TRIGGER on_large_booking_notify_admin
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_large_booking();
```

---

## Migration 4: New User Registration → Admin Alert

This trigger goes on the `auth.users` table (Supabase auth schema).

```sql
CREATE OR REPLACE FUNCTION notify_admin_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := jsonb_build_object(
      'alert_type', 'new_user',
      'user_id',    NEW.id,
      'user_email', NEW.email,
      'user_name',  COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nepoznato')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_notify_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_notify_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_user();
```

---

## Verification Queries

```sql
-- Check triggers on bookings table
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('bookings', 'moorings', 'affiliate_members')
ORDER BY event_object_table, trigger_name;

-- Check triggers on auth.users
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- Check recently sent pg_net requests
SELECT id, status_code, content::text, created
FROM net._http_response
ORDER BY id DESC LIMIT 10;
```
