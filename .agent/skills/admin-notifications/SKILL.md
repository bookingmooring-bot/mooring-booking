---
name: admin-notifications
description: >
  Implements admin-level email notifications and alerts for the Mooring Booking platform.
  Use this skill whenever the user wants to:
  — Send the platform admin an email when a new mooring provider registers and needs approval
  — Notify admin when a new affiliate application is submitted
  — Alert admin when a Stripe payment fails, dispute is opened, or a refund is requested
  — Send admin a daily/weekly summary of platform activity (bookings, revenue, new users)
  — Notify admin when a booking is cancelled by a guest or provider
  — Alert admin when a user reports a problem or submits a contact form
  — Add an admin email address to receive platform-level alerts
  — Build an Edge Function that sends notifications to the admin
  — Set up DB triggers or webhooks that notify the admin automatically on key events
  — Configure a "platform alert" email system for critical events (fraud, disputes, large bookings)
  Trigger on: "obavijesti admina", "email adminu", "admin notifikacija", "admin obavijest",
  "notify admin", "admin email", "admin alert", "obavijest o novom provideru",
  "novi provajder odobrenje", "provider approval email", "admin mora odobriti",
  "alert admina", "izvještaj platforme", "dnevni izvještaj", "weekly report",
  "platform report", "booking summary admin", "admin dashboard email",
  "stripe alert admin", "payment dispute admin", "fraud alert", "admin pregled",
  "svaki novi korisnik email adminu", "admin treba znati", "obavijesti administratora".
  ALWAYS use this skill when admin-level monitoring, alerts, or approval workflows need email support.
---

# Admin Notifications Skill — Mooring Booking

## 🧭 Overview

All admin notifications go to a single **ADMIN_EMAIL** address set as a Supabase secret.
The implementation uses a dedicated Edge Function `send-admin-notification` that accepts
a typed `alert_type` payload — this keeps a single deployable function instead of one per event.

---

## ✅ Key Configuration

| Item | Value |
|------|-------|
| **Admin email secret** | `ADMIN_EMAIL` (set in Supabase Edge Function secrets) |
| **From address** | `Mooring Booking <noreply@mooring-booking.com>` |
| **Resend API Key** | `RESEND_API_KEY` (already set) |
| **Supabase project** | `bblxawscmyzelinidkmb` |

> **FIRST STEP**: Ask user to confirm admin email, then set: `ADMIN_EMAIL=hernausa96@gmail.com`
> via Supabase Dashboard → Settings → Edge Functions → Secrets

---

## 📊 Accurate Database Schema (Verified)

### `profiles` table
- `id` uuid, `email` text, `full_name` text
- `role` text → `'user' | 'provider' | 'admin'`
- `stripe_onboarding_complete` boolean
- `created_at` timestamptz

### `moorings` table
- `id` uuid, `owner_id` uuid (FK → profiles.id), `name` text, `location` text
- `status` text → `'pending' | 'active' | 'inactive' | 'rejected'`
- `created_at` timestamptz

> **IMPORTANT**: moorings use `owner_id` (NOT `provider_id` or `user_id`)

### `affiliate_members` table
- `id` uuid, `user_id` uuid (FK → auth.users.id)
- `referral_code` text, `status` text → `'pending' | 'approved' | 'rejected' | 'banned'`
- `created_at` timestamptz

### `bookings` table
- `booking_status` → `'pending' | 'confirmed' | 'completed' | 'cancelled'`
- `payment_status` → `'pending' | 'paid' | 'refunded' | 'failed'`
- `total_price` numeric, `cancelled_by` → `'guest' | 'provider' | 'system'`
- `stripe_payment_intent_id` text

---

## 🔔 Notification Types

| # | Event | Trigger | alert_type |
|---|-------|---------|------------|
| 1 | New mooring pending approval | DB trigger on `moorings` INSERT | `new_provider` |
| 2 | New affiliate application | DB trigger on `affiliate_members` INSERT | `new_affiliate` |
| 3 | Stripe payment issue | Called from `stripe-webhook` / `stripe-connect-webhook` | `stripe_alert` |
| 4 | Large booking (>€500) | DB trigger on `bookings` INSERT | `large_booking` |
| 5 | Daily platform summary | Cron job 07:00 UTC | `daily_report` |

---

## 🏗️ Architecture

```
Event occurs
    ↓
DB Trigger (moorings/bookings/affiliate_members)
    ↓ pg_net.http_post
send-admin-notification Edge Function
    ↓ Resend API batch
Admin inbox (ADMIN_EMAIL secret)
```

For Stripe alerts, the existing `stripe-webhook` function calls
`send-admin-notification` directly via `fetch()`.

---

## 📁 Reference Files

| File | Contents |
|------|----------|
| `references/edge-function.md` | Full TypeScript code for `send-admin-notification` |
| `references/db-triggers.md` | SQL for all DB triggers (moorings, affiliates, bookings) |
| `references/cron-job.md` | SQL for `job-admin-daily-report` cron + Edge Function code |
| `references/stripe-integration.md` | How to integrate with existing `stripe-webhook` function |

---

## ⚙️ Implementation Order

1. Set `ADMIN_EMAIL` Supabase secret
2. Deploy `send-admin-notification` Edge Function
3. Apply `db-triggers.md` migration (moorings + affiliates + large bookings)
4. Deploy `job-admin-daily-report` Edge Function
5. Register cron job via SQL (`cron-job.md`)
6. Integrate Stripe alert call into `stripe-webhook` (`stripe-integration.md`)
7. Test each notification type

---

## 🔐 Security Note

- Never expose passwords, full Stripe keys, or card numbers in admin emails
- Use `ADMIN_EMAIL` Supabase secret, never hardcode
- All DB trigger functions use `SECURITY DEFINER`
