---
name: booking-lifecycle-automation
description: >
  Automates the full lifecycle of a mooring booking — from creation to completion — including
  automatic status changes, scheduled cron jobs, database triggers, and email notifications at
  every stage.
  Use this skill whenever the user wants to:
  — Automatically change booking status (pending → confirmed → completed → cancelled)
  — Set up or fix Supabase Cron Jobs that run daily checks (auto-cancel, auto-complete, reminders)
  — Create a Supabase DB trigger that fires when booking_status changes and sends emails
  — Auto-cancel bookings that are pending for more than 48 hours without confirmation
  — Auto-complete bookings after check-out date passes
  — Send emails at each lifecycle stage (confirmation, cancellation, completion, reminders)
  — Build or fix the `on-booking-status-change` Edge Function
  — Build or fix `job-auto-cancel` or `job-auto-complete` cron functions
  — Add columns to the `bookings` table, register or unschedule cron jobs
  — Debug why a cron job isn't running or email isn't sending on status change
  Trigger on: "automatizacija rezervacije", "booking lifecycle", "status rezervacije",
  "auto-cancel", "auto-potvrdi", "automatski potvrdi", "pending booking", "expired booking",
  "cron job", "pg_cron", "automatski posao", "rezervacija istekla", "booking status change",
  "promjena statusa", "check-in automatski", "check-out automatski", "auto-complete booking",
  "auto cancel booking", "job scheduler", "scheduled job", "booking automation",
  "automatski podsjetnik", "reminder job", "daily job", "supabase cron",
  "pokretanje automatski", "posao koji se ponavlja", "svaki dan u", "svakog jutra",
  "on-booking-status-change", "trigger za booking", "email pri promjeni statusa".
  ALWAYS use this skill when the topic is booking status changes, scheduled cron jobs, or any
  automation that runs in the background on a time-based or event-based schedule.
---

# Booking Lifecycle Automation — Mooring Booking

## 🧭 Overview

The Mooring Booking platform uses **Supabase Edge Functions** + **pg_cron** for automated booking
lifecycle management, and a **DB trigger → Edge Function** pattern for event-driven email sending.

### Supabase Project
- **Project ID**: `bblxawscmyzelinidkmb`
- **Region**: eu-central-1
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHhhd3NjbXl6ZWxpbmlka21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MjE1NzMsImV4cCI6MjA1NDE5NzU3M30.UKBMVN2YJKcqDhYoiWdYnHnPBXEHvPkHGQmhw1SloE0`

### Booking Status Flow

```
NEW BOOKING
    │
    ▼
[pending] ──(provider confirms / Stripe payment)──► [confirmed]
    │                                                     │
    ▼                                               (check-out date passes)
[cancelled] ◄──(auto-cancel after 48h no confirm)        ▼
                                                    [completed]
```

> ⚠️ **CRITICAL**: The bookings table column is named **`booking_status`** (NOT `status`).
> Always use `booking_status` in all SQL queries and Edge Function code.
> Valid values: `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`
> There is NO `checked_in` status — skip directly from `confirmed` to `completed`.

---

## 📦 Current State

### `bookings` Table — Key Columns

```sql
bookings (
  id uuid PRIMARY KEY,
  booking_status text DEFAULT 'pending',   -- ← USE THIS, not 'status'
    -- CHECK: pending | confirmed | completed | cancelled
  payment_status text DEFAULT 'pending',   -- pending | paid | refunded | failed
  check_in date,
  check_out date,
  guest_email text,
  guest_name text,
  guest_phone text,
  total_price numeric,
  confirmation_code text,
  mooring_id uuid REFERENCES moorings(id),
  user_id uuid REFERENCES profiles(id),
  provider_id uuid REFERENCES profiles(id),
  cancelled_at timestamptz,          -- already exists ✅
  completed_at timestamptz,          -- already exists ✅
  reminder_sent boolean DEFAULT false,       -- already exists ✅
  review_request_sent boolean DEFAULT false, -- already exists ✅
  cancelled_by text,                 -- 'guest' | 'provider' | 'system'
  cancellation_reason text,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  referral_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Currently Deployed Cron Jobs

| Edge Function | Schedule | Purpose |
|---------------|----------|---------|
| `job-checkin-reminders` | Daily 08:00 UTC | Email reminder 24h before check-in |
| `job-review-requests` | Daily 10:00 UTC | Email review request 24h after check-out |

### Missing Automations (to be built)

| Edge Function | Schedule | Purpose |
|---------------|----------|---------|
| `job-auto-cancel` | Hourly `0 * * * *` | Cancel pending bookings older than 48h |
| `job-auto-complete` | Daily 06:00 UTC | Complete bookings where check-out < today |
| `on-booking-status-change` | DB trigger (event) | Email guest+provider on any status change |

---

## 🛠️ How to Build Missing Automations

### For each new automation, follow this pattern:

1. **Create Edge Function** → see templates in `references/edge-function-templates.md`
2. **Deploy via MCP** with `deploy_edge_function` tool (`project_id: bblxawscmyzelinidkmb`, `verify_jwt: false`)
3. **Register cron job** (for scheduled jobs) → see SQL in `references/cron-sql.md`
4. **Register DB trigger** (for event-based) → see SQL in `references/cron-sql.md`

---

## 📧 Email Pattern

All email sending uses **Resend API** via batch endpoint:

```typescript
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";

await fetch("https://api.resend.com/emails/batch", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${RESEND_API_KEY}`,
  },
  body: JSON.stringify([emailObject1, emailObject2]),
});
```

**From address** (always use this): `"Mooring Booking <onboarding@resend.dev>"`

---

## 🔁 DB Trigger — on-booking-status-change

Read `references/db-trigger.md` for the full SQL to create the DB trigger that calls
`on-booking-status-change` Edge Function whenever `booking_status` changes on a booking.

The Edge Function receives:
```json
{
  "booking_id": "uuid",
  "old_status": "pending",
  "new_status": "confirmed",
  "guest_email": "...",
  "guest_name": "...",
  "check_in": "2025-07-01",
  "check_out": "2025-07-07",
  "total_price": 420,
  "confirmation_code": "MB-XXXX"
}
```

It then sends the appropriate email based on `new_status`.
Read `references/edge-function-templates.md` for the full implementation.

---

## 🗑️ Managing Cron Jobs

```sql
-- List all registered cron jobs
SELECT jobname, schedule, command FROM cron.job;

-- Remove a cron job
SELECT cron.unschedule('job-name-here');

-- Remove a DB trigger
DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
DROP FUNCTION IF EXISTS notify_booking_status_change();
```

---

## 📚 Reference Files

Read these when implementing:

- **`references/edge-function-templates.md`** — Full TypeScript code for each Edge Function
- **`references/cron-sql.md`** — All SQL needed (cron registration + DB trigger)
- **`references/testing-guide.md`** — How to test each automation manually
