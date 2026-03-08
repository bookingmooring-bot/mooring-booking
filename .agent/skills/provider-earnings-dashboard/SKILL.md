---
name: provider-earnings-dashboard
description: >
  Builds and integrates the complete Provider Earnings & Analytics Dashboard for the Mooring Booking app.
  Use this skill whenever the user wants to:
  — Show a mooring owner (provider) how much they have earned in total or per mooring
  — Display total bookings count, total nights sold, and total revenue per provider
  — Break down earnings by individual mooring (which vez earned the most)
  — Show occupancy rate per mooring (how often it was booked vs. available)
  — List who reserved which mooring (guest name, dates, boat, confirmation code)
  — Add an "Earnings" or "Analytics" tab to the Provider Dashboard
  — Build the `useProviderEarnings` React Query hook
  — Create SQL views or Supabase RPC functions for aggregated provider stats
  — Add charts (bar, pie) for revenue and occupancy visualization
  — Show earnings by week / month / year with time-range filtering
  Trigger on: "prihodi", "zarada", "koliko sam zaradio", "zarada po vezu", "ukupna zarada", "popunjenost",
  "occupancy", "earnings", "revenue", "booking stats", "analytics", "prihod po vezu",
  "koliko rezervacija", "koliko noći", "statistika veza", "provider earnings", "prikaži zaradu",
  "earnings dashboard", "earnings tab", "zarada provajdera", "koliko vrijedi moj vez",
  "best mooring", "najpopularniji vez", "koji vez zarađuje najviše".
  ALWAYS use this skill when a provider asks about their income, reservations received, or mooring occupancy.
---

# Provider Earnings Dashboard

This skill guides you through building a **complete earnings and analytics section** for providers (mooring owners) inside the Mooring Booking app. The result is a new **"Earnings" tab** in `Dashboard.tsx` backed by a React Query hook and optional Supabase SQL views.

---

## App Architecture Context

Before writing any code, understand the existing structure:

- **Stack**: React 18 + Vite + TypeScript, TanStack Query, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + RLS)
- **Supabase project ID**: `bblxawscmyzelinidkmb`
- **Key tables**:
  - `bookings` — has `provider_id`, `mooring_id`, `total_price`, `commission_amount`, `check_in`, `check_out`, `nights`, `guest_name`, `guest_email`, `boat_name`, `boat_length`, `booking_status`, `payment_status`, `confirmation_code`, `created_at`
  - `moorings` — has `id`, `name`, `location`, `country`, `owner_id`, `price_per_night`, `status`, `image_urls`
  - `mooring_availability` — has `mooring_id`, `date`, `available`
- **Existing hooks** (do not duplicate):
  - `useProviderBookings()` in `src/hooks/useBookings.ts` — raw list of bookings for the logged-in provider
  - `useMooringList()` in `src/components/provider/MooringList.tsx` (internal) — provider's own moorings
- **Dashboard tabs**: `'dashboard' | 'settings' | 'moorings' | 'calendar'` — you will add `'earnings'`
- **Supabase client**: imported from `@/lib/supabase`

Read `references/data-model.md` for full column definitions before querying.

---

## Implementation Steps

### Step 1 — Create the `useProviderEarnings` Hook

Create `src/hooks/useProviderEarnings.ts`. This hook computes all analytics client-side from the bookings list (no extra DB round-trips for basic stats) and optionally fetches mooring metadata.

```typescript
// src/hooks/useProviderEarnings.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface MooringEarning {
  mooringId: string;
  mooringName: string;
  location: string;
  country: string;
  totalBookings: number;
  totalNights: number;
  grossRevenue: number;        // total_price sum
  netEarnings: number;         // gross - commission
  avgNightsPerBooking: number;
  // occupancy: booked nights / total available nights in period
  occupancyRate: number | null;
}

export interface ProviderEarningsSummary {
  totalBookings: number;
  totalNights: number;
  grossRevenue: number;
  netEarnings: number;
  bestMooring: MooringEarning | null;
  byMooring: MooringEarning[];
  recentBookings: any[];       // last 10 bookings with mooring info
}
```

The hook should:
1. Fetch all bookings for `provider_id = user.id` joined with `moorings(name, location, country)`.
2. Optionally filter by `booking_status IN ('confirmed', 'completed')` and/or `payment_status = 'paid'` — expose a `filterPaid: boolean` parameter so the user can toggle between gross (all) and paid (confirmed paid) views.
3. Group results by `mooring_id` and compute per-mooring stats.
4. Calculate `occupancyRate` by fetching the count of days marked `available = false` in `mooring_availability` for each mooring (use a single batch query for all mooring IDs).
5. Sort `byMooring` by `netEarnings DESC` — first item is `bestMooring`.
6. Return `recentBookings` as the last 10 bookings sorted by `created_at DESC`.

**Query key**: `['provider-earnings', user?.id]`

Read `references/hook-implementation.md` for the full annotated code template.

---

### Step 2 — (Optional) Create a Supabase SQL View for Server-Side Aggregation

If performance matters (provider has hundreds of bookings), create a Postgres view or RPC function instead of computing client-side. Follow the best practices in `references/sql-view.md`.

Apply via `mcp_supabase-mcp-server_apply_migration` with migration name `provider_earnings_view`.

---

### Step 3 — Build the `ProviderEarningsDashboard` Component

Create `src/components/provider/ProviderEarningsDashboard.tsx`.

**UI Sections** (in order):

#### 3a. Summary KPI Cards (top row)
Four cards in a 2×2 or 1×4 grid:
- 💰 **Total Net Earnings** — `netEarnings` formatted as `€X,XXX.XX`
- 📋 **Total Bookings** — integer count
- 🌙 **Total Nights Sold** — integer count
- 🏆 **Best Mooring** — mooring name + net earnings

Use shadcn `<Card>` components. Add a subtle gradient or icon to each.

#### 3b. Time Range Filter
A row of toggle buttons: **All Time | This Month | This Year**. Filter the data client-side from the hook's raw bookings array. Store selection in `useState<'all' | 'month' | 'year'>('all')`.

#### 3c. Per-Mooring Breakdown Table
A table (or a list of cards on mobile) with columns:
| Mooring | Bookings | Nights | Gross Revenue | Commission | **Net Earnings** | Occupancy |

Sort by Net Earnings descending. Highlight the top row with a gold border or badge.

The **Occupancy** column shows a colored percentage badge:
- ≥ 70%: green
- 40–69%: yellow
- < 40%: red/muted

If `occupancyRate` is `null` (no availability data), show `—`.

#### 3d. Recent Guest List
Show the last 10 bookings as a compact list:
- Mooring name, guest name, dates (`check_in → check_out`), confirmation code, net earning for that booking, status badge.

Read `references/ui-components.md` for full JSX snippets.

---

### Step 4 — Add "Earnings" Tab to Dashboard

In `src/pages/Dashboard.tsx`:

1. Add `'earnings'` to the `activeTab` union type:
   ```typescript
   useState<'dashboard' | 'settings' | 'moorings' | 'calendar' | 'earnings'>('dashboard')
   ```

2. Add the tab button **after "Calendar"** and **before "Settings"**, visible only when `profile?.role === 'provider'`:
   ```tsx
   <button
     onClick={() => setActiveTab('earnings')}
     className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
       activeTab === 'earnings'
         ? 'bg-background shadow text-foreground'
         : 'text-muted-foreground hover:text-foreground'
     }`}
   >
     💰 Earnings
   </button>
   ```

3. Add the render branch in the content area:
   ```tsx
   } else if (activeTab === 'earnings') {
     return (
       <div className="mt-8 animate-fade-in">
         <ProviderEarningsDashboard />
       </div>
     );
   }
   ```

---

### Step 5 — RLS Check

Verify the `bookings` table RLS policy allows providers to read rows where `provider_id = auth.uid()`. The existing policy should already cover this (the admin `useAdmin` hook does similar queries). If you encounter permission errors, run:

```sql
-- Check existing policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'bookings';
```

And add if missing:
```sql
CREATE POLICY "Providers can read their own bookings"
ON bookings FOR SELECT
USING (provider_id = auth.uid());
```

Use `mcp_supabase-mcp-server_execute_sql` to verify, and `mcp_supabase-mcp-server_apply_migration` to add the policy.

---

### Step 6 — Verification

After implementation:

1. Log in as a provider account.
2. Navigate to `/dashboard` → click the **Earnings** tab.
3. Confirm KPI cards show non-zero data if bookings exist.
4. Confirm per-mooring table is sorted correctly.
5. Confirm recent bookings list loads.
6. Check browser console for Supabase errors.
7. Run `mcp_supabase-mcp-server_get_advisors` (security + performance) to check for any new RLS gaps.

---

## File Checklist

| File | Action |
|------|--------|
| `src/hooks/useProviderEarnings.ts` | **CREATE** |
| `src/components/provider/ProviderEarningsDashboard.tsx` | **CREATE** |
| `src/pages/Dashboard.tsx` | **MODIFY** — add tab + render |

---

## Design Notes

- Use the existing Tailwind classes from the app (`bg-card`, `border-border`, `text-primary`, `text-secondary`, `shadow-card`, `animate-fade-in`, `rounded-2xl`).
- Use `text-secondary` (teal/ocean color) for earnings-related numbers to match the Provider Dashboard visual identity.
- Do NOT install any charting library unless the user explicitly asks — show data as tables/cards first.
- If the user wants charts later, prefer a lightweight option like `recharts` (already may be in the project) or a simple CSS progress bar for occupancy.

---

## Reference Files

- `references/data-model.md` — Full column definitions for `bookings`, `moorings`, `mooring_availability`
- `references/hook-implementation.md` — Annotated `useProviderEarnings` hook code
- `references/sql-view.md` — Server-side SQL view / RPC alternative
- `references/ui-components.md` — Full JSX snippets for all UI sections
