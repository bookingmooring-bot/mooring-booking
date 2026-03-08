---
name: affiliate-program-admin
description: >
  Builds and manages the complete Affiliate Program system for the Mooring Booking app.
  Use this skill whenever the user wants to:
  — Build or improve the affiliate (partner) program backend and frontend
  — Let any logged-in user apply/register to become an affiliate and get a unique referral code + link
  — Show an affiliate their personal stats: clicks, bookings referred, total commissions earned
  — Build an Admin view that lists ALL affiliates with their codes, stats, approval status, and total payouts
  — Approve or reject pending affiliate applications from the admin panel
  — Track which bookings came via a referral code/link and credit the right affiliate
  — Create the `affiliate_members` Supabase table, RLS policies, and RPC functions
  — Build the `useAffiliate` and `useAffiliateAdmin` React Query hooks
  — Add an "Affiliate" tab to the user Dashboard and an "Affiliates" tab to the Admin panel
  — Generate unique referral codes automatically on sign-up
  — Show affiliate link that can be copied (e.g. mooring-booking.com/explore?ref=ABC123)
  Trigger on: "affiliate", "affiliat", "referral", "referal", "kod za preporuku", "referral kod",
  "affiliate program", "affiliate admin", "ko je na affilietu", "prijava za affiliate",
  "postani affiliate", "affiliate link", "affiliate commission", "affiliate zarada",
  "provizija affiliatera", "referral link", "partner program admin", "odobri affiliate",
  "affiliate aplikacija", "affiliate tablica", "affiliate dashboard", "tracking kod",
  "referral tracking", "ko je preporučio", "bookings po kodu".
  ALWAYS use this skill when the user asks about the affiliate/referral system, admin oversight of affiliates,
  or how a user earns money by referring others — even if they describe it casually.
---

# Affiliate Program Admin Skill

This skill guides you through building the **complete affiliate/referral system** for the Mooring Booking app. The result includes:

1. **Database layer** — `affiliate_members` table + RLS + referral tracking on `bookings`
2. **User flow** — any logged-in user registers, gets a unique code and shareable link
3. **Affiliate dashboard** — the affiliate sees their stats (clicks, bookings, commission)
4. **Admin panel** — admin sees + manages all affiliates (approve, ban, see totals)
5. **Referral tracking** — when someone books via a referral link, the booking is credited to that affiliate

---

## App Architecture Context

- **Stack**: React 18 + Vite + TypeScript, TanStack Query, Supabase (PostgreSQL + RLS), shadcn/ui
- **Supabase project ID**: `bblxawscmyzelinidkmb`
- **Auth**: `useAuth()` from `src/contexts/AuthContext` — `user.id` is the UUID
- **Supabase client**: imported from `@/lib/supabase`
- **Existing pages**: `src/pages/Affiliate.tsx` (marketing page — do NOT replace it, extend it)
- **Admin panel**: `src/pages/Admin.tsx` — add a new tab here
- **Dashboard**: `src/pages/Dashboard.tsx` — add a new tab for affiliate members
- **Key tables**:
  - `profiles` — `id`, `full_name`, `email`, `role` (`'user' | 'provider' | 'admin'`)
  - `bookings` — `id`, `total_price`, `commission_amount`, `booking_status`, `payment_status`, `created_at`

---

## Step 1 — Database: Create `affiliate_members` Table

Apply this migration via `mcp_supabase-mcp-server_apply_migration`:

```sql
-- Migration: create_affiliate_members
CREATE TABLE IF NOT EXISTS public.affiliate_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code   TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'banned')),
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- percentage, e.g. 10.00 = 10%
  total_clicks    INTEGER NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_earned    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at     TIMESTAMPTZ,
  notes           TEXT
);

-- Index for fast lookups by referral code (used on every booking with ?ref=)
CREATE INDEX IF NOT EXISTS idx_affiliate_members_referral_code ON affiliate_members(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_members_user_id ON affiliate_members(user_id);

-- Add referral tracking to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS affiliate_commission NUMERIC(10,2) DEFAULT 0;

-- RLS
ALTER TABLE public.affiliate_members ENABLE ROW LEVEL SECURITY;

-- Affiliate can read their own record
CREATE POLICY "Affiliates can read own record"
  ON affiliate_members FOR SELECT
  USING (user_id = auth.uid());

-- Any authenticated user can INSERT their own application (once)
CREATE POLICY "Users can apply to become affiliate"
  ON affiliate_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Affiliates can update only their referral code (if approved)
-- Admin updates happen via service role key in edge functions or admin RPC

-- Admin can read all
CREATE POLICY "Admins can read all affiliates"
  ON affiliate_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Step 2 — Referral Code Generation Utility

Create `src/lib/affiliateUtils.ts`:

```typescript
// Generate a unique 8-character alphanumeric referral code
export function generateReferralCode(userId: string): string {
  // Use first 4 chars of userId (without dashes) + 4 random chars
  const userPart = userId.replace(/-/g, '').substring(0, 4).toUpperCase();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${userPart}${random}`;
}

// Build the full shareable referral URL
export function buildReferralLink(code: string): string {
  return `${window.location.origin}/explore?ref=${code}`;
}
```

---

## Step 3 — React Query Hooks

### 3a. `useAffiliate` — for the logged-in affiliate user

Create `src/hooks/useAffiliate.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { generateReferralCode } from '@/lib/affiliateUtils';

export interface AffiliateMember {
  id: string;
  user_id: string;
  referral_code: string;
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  commission_rate: number;
  total_clicks: number;
  total_referrals: number;
  total_earned: number;
  created_at: string;
  approved_at: string | null;
  notes: string | null;
}

// Get the current user's affiliate record
export function useAffiliate() {
  const { user } = useAuth();
  return useQuery<AffiliateMember | null>({
    queryKey: ['affiliate', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_members')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// Apply to become an affiliate (insert row)
export function useApplyAffiliate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const code = generateReferralCode(user.id);
      const { data, error } = await supabase
        .from('affiliate_members')
        .insert({ user_id: user.id, referral_code: code })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate', user?.id] });
    },
  });
}

// Get bookings that came through this affiliate's referral code
export function useAffiliateBookings(referralCode: string | undefined) {
  return useQuery({
    queryKey: ['affiliate-bookings', referralCode],
    enabled: !!referralCode,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, total_price, affiliate_commission, booking_status, created_at')
        .eq('referral_code', referralCode!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
```

### 3b. `useAffiliateAdmin` — for the admin panel

Create `src/hooks/useAffiliateAdmin.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AffiliateMemberWithProfile {
  id: string;
  user_id: string;
  referral_code: string;
  status: string;
  commission_rate: number;
  total_clicks: number;
  total_referrals: number;
  total_earned: number;
  created_at: string;
  approved_at: string | null;
  notes: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
}

// List all affiliates (admin only — relies on admin RLS policy)
export function useAllAffiliates() {
  return useQuery<AffiliateMemberWithProfile[]>({
    queryKey: ['admin-affiliates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_members')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AffiliateMemberWithProfile[];
    },
  });
}

// Update an affiliate's status (approve / reject / ban)
export function useUpdateAffiliateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const update: Record<string, unknown> = { status, notes };
      if (status === 'approved') update.approved_at = new Date().toISOString();
      const { error } = await supabase
        .from('affiliate_members')
        .update(update)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
    },
  });
}
```

---

## Step 4 — Referral Tracking: Capture `?ref=` on Booking

In `src/pages/Explore.tsx` (or wherever `?ref=` first lands), capture the code and store in `sessionStorage`:

```typescript
// In Explore.tsx or main App router:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) sessionStorage.setItem('referral_code', ref);
}, []);
```

When a booking is **created** (in `BookingModal.tsx` or the booking mutation), read and attach the code:

```typescript
const referralCode = sessionStorage.getItem('referral_code') ?? null;

// Include in booking insert:
await supabase.from('bookings').insert({
  ...bookingData,
  referral_code: referralCode,
  affiliate_commission: referralCode
    ? parseFloat((bookingData.total_price * 0.10).toFixed(2))
    : 0,
});

// Clear after use so it doesn't double-count
if (referralCode) sessionStorage.removeItem('referral_code');
```

> **Note**: The commission rate should ideally be fetched from `affiliate_members` for that code before inserting, to use the affiliate's actual `commission_rate` (not always 10%). Keep it simple first; optimize later.

---

## Step 5 — Affiliate Dashboard Component (User Side)

Create `src/components/affiliate/AffiliateDashboard.tsx`:

**UI Sections:**

### 5a. Not Yet Applied
If `useAffiliate()` returns `null`, show an **Apply Now** card:
- Short explanation of the program (commissions, free to join)
- **"Apply to Become an Affiliate"** button → calls `useApplyAffiliate()`
- On success: show the new referral code and link with a copy button

### 5b. Pending Approval
If `status === 'pending'`, show a waiting state:
- "Your application is under review"
- Show the referral code and link (they can share it already, but commissions only credit if approved)

### 5c. Approved — Full Dashboard
Four KPI cards:
- 🔗 **Your Referral Code** — with one-click copy button
- 👁️ **Total Clicks** — `total_clicks`
- 🛒 **Bookings Referred** — `total_referrals`
- 💰 **Total Earned** — `total_earned` formatted as `€X,XXX.XX`

Shareable link input:
```tsx
<input readOnly value={buildReferralLink(affiliate.referral_code)} />
<button onClick={() => navigator.clipboard.writeText(buildReferralLink(affiliate.referral_code))}>
  Copy Link
</button>
```

Recent referred bookings table (from `useAffiliateBookings`):
| Date | Booking ID | Amount | Your Commission | Status |

### 5d. Rejected / Banned
Show a message explaining the status with a support contact link.

---

## Step 6 — Add "Affiliate" Tab to User Dashboard

In `src/pages/Dashboard.tsx`:

1. Add `'affiliate'` to the `activeTab` state union.
2. Add a tab button (visible to all logged-in users, providers and regular users):
   ```tsx
   <button onClick={() => setActiveTab('affiliate')} ...>
     🔗 Affiliate
   </button>
   ```
3. Render `<AffiliateDashboard />` when tab is active.

---

## Step 7 — Admin Panel: Affiliates Tab

In `src/pages/Admin.tsx`, add an **"Affiliates"** tab that renders `src/components/admin/AffiliateAdminTable.tsx`.

### `AffiliateAdminTable.tsx` UI:

A filterable table with columns:
| Name | Email | Code | Status | Clicks | Referrals | Total Earned | Applied | Actions |

**Filters** (top bar):
- Status filter: All / Pending / Approved / Rejected / Banned
- Search by name or code

**Actions per row**:
- `status === 'pending'` → **Approve** (green) + **Reject** (red) buttons
- `status === 'approved'` → **Ban** button
- Click row to expand notes field

**Summary stats** (top):
- Total affiliates | Pending approval | Total commissions paid | Active affiliates

---

## Step 8 — RLS Verification

After migration, verify with `mcp_supabase-mcp-server_execute_sql`:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'affiliate_members';
```

Run `mcp_supabase-mcp-server_get_advisors` (type: `security`) to catch any RLS gaps.

---

## Step 9 — Verification Checklist

1. **Regular user** visits `/explore?ref=TESTCODE` → `sessionStorage` stores the code
2. **Regular user** logs in → Dashboard → Affiliate tab → applies → gets code
3. **After applying**: referral code and link shown
4. **Admin** logs in → Admin panel → Affiliates tab → sees all entries
5. **Admin approves** → user's status changes to `approved`
6. **New booking** created after landing via referral link → `bookings.referral_code` is set
7. Check browser console for Supabase errors
8. Confirm `total_referrals` and `total_earned` update when an attributed booking is confirmed

---

## File Checklist

| File | Action |
|------|--------|
| `src/lib/affiliateUtils.ts` | **CREATE** |
| `src/hooks/useAffiliate.ts` | **CREATE** |
| `src/hooks/useAffiliateAdmin.ts` | **CREATE** |
| `src/components/affiliate/AffiliateDashboard.tsx` | **CREATE** |
| `src/components/admin/AffiliateAdminTable.tsx` | **CREATE** |
| `src/pages/Dashboard.tsx` | **MODIFY** — add Affiliate tab |
| `src/pages/Admin.tsx` | **MODIFY** — add Affiliates tab |
| `src/pages/Explore.tsx` | **MODIFY** — capture `?ref=` param |
| Booking creation code | **MODIFY** — attach `referral_code` + `affiliate_commission` |
| Supabase migration | **APPLY** — `create_affiliate_members` |

---

## Design Notes

- Use existing Tailwind tokens: `bg-card`, `text-secondary`, `border-border`, `shadow-card`, `animate-fade-in`
- **Gold color** (`text-gold`, `bg-gold`) for commission/earnings numbers — matches the affiliate page branding
- The `Affiliate.tsx` marketing page stays untouched — the new feature lives inside Dashboard and Admin
- Commission crediting happens client-side at booking time (simple) — a Supabase trigger or Edge Function can enforce this server-side if needed later
- Do NOT store the referral code in `localStorage` (persists too long) — `sessionStorage` expires with the tab, which is the intended behavior
