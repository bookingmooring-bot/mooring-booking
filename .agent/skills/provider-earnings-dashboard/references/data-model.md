# Data Model — Provider Earnings

## `bookings` table (relevant columns)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `mooring_id` | uuid | FK → moorings.id |
| `user_id` | uuid | FK → auth.users (the guest/sailor) |
| `provider_id` | uuid | FK → auth.users (the mooring owner) |
| `check_in` | date | ISO date string `YYYY-MM-DD` |
| `check_out` | date | ISO date string `YYYY-MM-DD` |
| `nights` | integer | check_out - check_in in days |
| `price_per_night` | numeric | Price charged per night |
| `total_price` | numeric | nights × price_per_night (gross) |
| `commission_amount` | numeric | 15% platform fee, auto-computed by trigger |
| `guest_name` | text | Full name of the guest |
| `guest_email` | text | Guest email |
| `boat_name` | text | Guest's boat name |
| `boat_length` | numeric | Guest's boat length in meters |
| `booking_status` | text | `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'` |
| `payment_status` | text | `'pending'`, `'paid'` |
| `confirmation_code` | text | Unique booking reference, auto-generated |
| `created_at` | timestamptz | When the booking was created |

**Net earnings per booking** = `total_price - commission_amount`

---

## `moorings` table (relevant columns)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | Mooring name |
| `location` | text | City/area name |
| `country` | text | Country name |
| `owner_id` | uuid | FK → auth.users (provider) |
| `price_per_night` | numeric | Base nightly price |
| `status` | text | `'pending'`, `'active'`, `'rejected'` |
| `image_urls` | text[] | Array of public image URLs |
| `lat` | numeric | GPS latitude |
| `lng` | numeric | GPS longitude |

---

## `mooring_availability` table (relevant columns)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `mooring_id` | uuid | FK → moorings.id |
| `date` | date | A specific calendar date |
| `available` | boolean | `false` = blocked/unavailable |
| `custom_price` | numeric | Override price for that day (nullable) |

**Occupancy calculation**: Count rows where `available = false` within a date range. Total available days = total days in the range. `occupancyRate = (blocked_days / total_days) * 100`.

For a 365-day occupancy rate:
```sql
SELECT 
  mooring_id,
  COUNT(*) FILTER (WHERE available = false) AS booked_days,
  365 AS total_days,
  ROUND(COUNT(*) FILTER (WHERE available = false) * 100.0 / 365, 1) AS occupancy_pct
FROM mooring_availability
WHERE mooring_id = ANY($1)
  AND date >= CURRENT_DATE - INTERVAL '365 days'
  AND date <= CURRENT_DATE
GROUP BY mooring_id;
```

---

## `commissions` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `provider_id` | uuid | FK → auth.users |
| `booking_id` | uuid | FK → bookings.id |
| `amount` | numeric | Commission amount (same as bookings.commission_amount) |
| `status` | text | `'pending'`, `'paid'`, `'overdue'` |
| `due_date` | date | When commission is due |
| `paid_at` | timestamptz | When admin marked as paid |

> You don't need to query `commissions` directly for the earnings dashboard — `bookings.commission_amount` and `bookings.total_price` are sufficient.

---

## Supabase RLS Context

The existing RLS on `bookings` allows:
- **Guest (user)**: SELECT where `user_id = auth.uid()`
- **Provider**: SELECT where `provider_id = auth.uid()`
- **Admin**: SELECT all

The existing RLS on `moorings` allows:
- **Owner (provider)**: All operations where `owner_id = auth.uid()`
- **Everyone**: SELECT where `status = 'active'`

The RLS on `mooring_availability` allows providers to manage their own mooring's availability.
