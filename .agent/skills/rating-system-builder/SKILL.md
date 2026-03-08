---
name: rating-system-builder
description: >
  Builds and tests the complete bidirectional Rating & Review system for the Mooring Booking app.
  Use this skill whenever the user wants to:
  — Let sailors/guests rate the mooring (vez) they stayed at (1–5 stars + comment)
  — Let providers rate the guest/user who made a booking
  — Let users leave feedback on another user they interacted with via a booking
  — Show star ratings on mooring cards, mooring detail modals, or the Explore page
  — Show a "Rate & Review" prompt after a booking is completed or checked out
  — Build or fix the `reviews` table, RLS policies, or the `review_ratings` user-to-user table
  — Implement frontend rating UI (star picker, review modal, rating display)
  — Implement backend hooks/mutations for creating, reading, and validating reviews
  — Run automated or manual tests on the rating flow end-to-end
  Trigger on: "ocijeni vez", "ocijeni korisnika", "rating", "recenzija", "review", "zvjezdice",
  "rate mooring", "rate user", "reviews", "ostavi ocjenu", "korisnik ocjeni", "provider ocjeni",
  "mooring rating", "user rating", "napravi rating", "dodaj recenziju", "rating sistem",
  "star rating", "review after booking", "ocjena", "feedback", "after stay review".
  ALWAYS use this skill when the user asks about any form of rating, review, or feedback
  system in the app — even if they use only Croatian words or informal phrasing.
---

# Rating System Builder — Mooring Booking App

You are a senior full-stack engineer. Your job is to build, extend, and test the complete
**bidirectional rating system** for the Mooring Booking application in one coordinated pass:
DB migrations → backend hooks → frontend components → integration tests.

> **Key principle:** Build frontend and backend in parallel where possible, then run tests.
> Never leave either side half-done before verifying the other compiles.

---

## 🏗️ App Stack (Quick Reference)

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, shadcn/ui |
| State / server data | TanStack React Query v5 |
| Backend / DB | Supabase (PostgreSQL + RLS + Edge Functions) |
| Auth | Supabase Auth via `AuthContext` (`src/contexts/AuthContext.tsx`) |
| Forms | react-hook-form + zod |
| Project root | `c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking\` |
| Supabase project ID | `bblxawscmyzelinidkmb` |

---

## 📐 Rating System Design

There are **two rating directions**:

### Direction 1 — Guest → Mooring (Mooring Review)
A logged-in user who has a **completed booking** rates the mooring they visited.

- Table: **`reviews`** (already exists)
- Columns: `id`, `mooring_id`, `user_id`, `booking_id`, `rating (int 1–5)`, `comment`, `created_at`
- A DB trigger **already exists** that auto-updates `moorings.rating` (avg) and `moorings.review_count`
- Add `UNIQUE (booking_id)` so each booking can only have one mooring review

### Direction 2 — Provider → Guest (User Rating) — **NEW TABLE NEEDED**
A provider who hosted a guest rates that guest after checkout (trust/reputation system).

- Table: **`user_ratings`** (new)
- Columns: `id`, `booking_id (unique)`, `reviewer_id`, `reviewed_user_id`, `rating (int 1–5)`, `comment`, `created_at`
- A DB trigger auto-updates `profiles.guest_rating` (avg) and `profiles.guest_rating_count`

---

## 🗄️ Step 1 — Database Migrations

**Use `mcp_supabase-mcp-server_apply_migration` for all DDL.** Never use `execute_sql` for schema changes.

### Migration 1A — Create `user_ratings` table + trigger

```sql
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         uuid UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating             integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment            text,
  created_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_reviewed ON public.user_ratings(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_reviewer ON public.user_ratings(reviewer_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS guest_rating       numeric(3,2),
  ADD COLUMN IF NOT EXISTS guest_rating_count integer DEFAULT 0;

CREATE OR REPLACE FUNCTION update_guest_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    guest_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.user_ratings
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    guest_rating_count = (
      SELECT COUNT(*)
      FROM public.user_ratings
      WHERE reviewed_user_id = NEW.reviewed_user_id
    )
  WHERE id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_rating_inserted ON public.user_ratings;
CREATE TRIGGER on_user_rating_inserted
  AFTER INSERT ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION update_guest_rating();
```

### Migration 1B — RLS Policies for `user_ratings`

```sql
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider can rate their guest"
ON public.user_ratings FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.moorings m ON m.id = b.mooring_id
    WHERE b.id = booking_id AND m.owner_id = auth.uid()
  )
);

CREATE POLICY "Public read user ratings"
ON public.user_ratings FOR SELECT USING (true);
```

### Migration 1C — Unique constraint on `reviews` per booking

```sql
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_booking_id_unique;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_booking_id_unique UNIQUE (booking_id);
```

---

## 🪝 Step 2 — Backend Hook: `useReviews.ts`

Create `src/hooks/useReviews.ts` with these exports:

| Export | Purpose |
|---|---|
| `useMooringReviews(mooringId)` | Fetch all reviews for a mooring |
| `useHasReviewedBooking(bookingId)` | Check if current user already reviewed |
| `useUserRatings(userId)` | Fetch provider-submitted ratings for a guest |
| `useCreateMooringReview()` | Mutation: guest submits mooring review |
| `useCreateUserRating()` | Mutation: provider submits guest rating |

Key patterns to follow:
- All queries use `useQuery` from `@tanstack/react-query`, respecting `enabled: !!param`
- All mutations `invalidateQueries` for affected query keys on success
- Auth comes from `useAuth()` — never read from `localStorage` directly
- Duplicate errors (Supabase error code `23505`) should throw a user-friendly message:
  `"Već ste ostavili ocjenu za ovu rezervaciju."`

---

## 🎨 Step 3 — Frontend Components

Create these files in `src/components/rating/`:

### `StarRating.tsx`
Reusable interactive or read-only star display.
Props: `value: number`, `onChange?: (v: number) => void`, `readonly?: boolean`, `size?: 'sm' | 'md' | 'lg'`

- Fill stars in yellow (`fill-yellow-400 text-yellow-400`) up to `value`
- Hover highlight when interactive; scale on hover for tactile feel
- Use Lucide `Star` icon from `lucide-react`

### `ReviewMooringModal.tsx`
Dialog for a guest to rate the mooring after their stay.

- Uses `Dialog` from `src/components/ui/dialog`
- `react-hook-form` + `zod` validation (rating required 1–5, comment optional)
- On success: `toast({ title: 'Hvala na recenziji! ⭐' })` and close modal
- On duplicate error: `toast({ description: 'Već ste ostavili recenziju...', variant: 'destructive' })`

### `RateGuestModal.tsx`
Same structure as `ReviewMooringModal` but for providers rating a guest.

- Title: "Ocijeni gosta"
- Prompt label: "Kako ocjenjuješ gosta koji je boravio kod tebe?"
- Uses `useCreateUserRating` mutation

### `ReviewList.tsx`
Displays a scrollable list of mooring reviews.

- Uses `useMooringReviews(mooringId)`
- Each card: reviewer name (`profiles.full_name`), `StarRating` readonly, comment, date
- Loading state + empty state: "Nema još recenzija."

---

## 🔗 Step 4 — Page Integration

### `src/pages/Dashboard.tsx`
Find the booking cards section. Add rating buttons for **completed bookings only**:

```tsx
// State at top of component:
const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
const [rateGuestTarget, setRateGuestTarget] = useState<Booking | null>(null);

// Inside each booking card:
{booking.booking_status === 'completed' && user?.role === 'user' && (
  <Button variant="outline" size="sm" onClick={() => setReviewTarget(booking)}>
    ⭐ Ocijeni vez
  </Button>
)}
{booking.booking_status === 'completed' && user?.role === 'provider' && (
  <Button variant="outline" size="sm" onClick={() => setRateGuestTarget(booking)}>
    ⭐ Ocijeni gosta
  </Button>
)}

// After the booking list, render modals:
{reviewTarget && (
  <ReviewMooringModal
    open={!!reviewTarget}
    onOpenChange={(open) => !open && setReviewTarget(null)}
    mooringId={reviewTarget.mooring_id}
    bookingId={reviewTarget.id}
    mooringName={reviewTarget.moorings?.name ?? 'Vez'}
  />
)}
{rateGuestTarget && (
  <RateGuestModal
    open={!!rateGuestTarget}
    onOpenChange={(open) => !open && setRateGuestTarget(null)}
    bookingId={rateGuestTarget.id}
    guestUserId={rateGuestTarget.user_id}
    guestName={rateGuestTarget.guest_name}
  />
)}
```

### `src/pages/Explore.tsx` or mooring cards
Wherever a mooring card renders, display the avg rating badge:

```tsx
{mooring.rating && (
  <div className="flex items-center gap-1">
    <StarRating value={mooring.rating} readonly size="sm" />
    <span className="text-xs text-muted-foreground">({mooring.review_count})</span>
  </div>
)}
```

---

## ✅ Step 5 — Verification & Testing

Run in this exact order. Do not skip any step.

### 5A. TypeScript check (run first, fix before anything else)
```powershell
cd "c:\Users\User\Desktop\Aplikacije1\Mooring Booking\Mooring Booking"
npx tsc --noEmit
```
**Expected:** zero errors.

### 5B. Dev server
```powershell
npm run dev
```
**Expected:** Vite starts on `http://localhost:5173` with no build errors in terminal.

### 5C. DB health check (via `mcp_supabase-mcp-server_execute_sql`)
```sql
-- 1) user_ratings table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_ratings';

-- 2) New profile columns exist
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('guest_rating', 'guest_rating_count');

-- 3) Unique constraint on reviews exists
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'reviews'
  AND constraint_name = 'reviews_booking_id_unique';

-- 4) RLS policies on user_ratings
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_ratings';
```

### 5D. Browser Integration Test (use `browser_subagent` tool)
1. Open `http://localhost:5173` → log in as a guest with a completed booking.
2. Dashboard → find completed booking → click **"Ocijeni vez"**.
3. `ReviewMooringModal` opens → pick 4 stars → type comment → submit.
4. Toast **"Hvala na recenziji!"** appears; modal closes.
5. Open Explore — find the mooring — star rating badge now visible.
6. Try submitting same review again → error toast appears (duplicate prevention).
7. Log out → log in as the mooring's provider.
8. Dashboard → find same booking → click **"Ocijeni gosta"** → pick 5 stars → submit.
9. Verify with SQL: `SELECT * FROM user_ratings LIMIT 5;`
10. Verify trigger fired: `SELECT guest_rating, guest_rating_count FROM profiles WHERE id = '<guest_user_id>';`

---

## ⚠️ Critical Rules

- **One review per booking** — `UNIQUE (booking_id)` in both tables. Catch Supabase error code `23505` and show user-friendly Croatian message.
- **Rating only after stay** — buttons visible only when `booking_status === 'completed'`.
- **Never bypass RLS** — always use Supabase client with user session; never use the service role key on the frontend.
- **IDs are UUIDs** — never pass legacy string IDs like `'hr-1'` to Supabase.
- **TypeScript strict** — no `any` casts. Define proper interfaces for all Supabase return types.
- **Query invalidation** — after each mutation, invalidate relevant React Query keys so UI updates instantly.

---

## 📁 Files Created / Modified

| Action | Path |
|---|---|
| NEW | `src/hooks/useReviews.ts` |
| NEW | `src/components/rating/StarRating.tsx` |
| NEW | `src/components/rating/ReviewMooringModal.tsx` |
| NEW | `src/components/rating/RateGuestModal.tsx` |
| NEW | `src/components/rating/ReviewList.tsx` |
| MODIFY | `src/pages/Dashboard.tsx` — rating buttons on completed bookings |
| MODIFY | `src/pages/Explore.tsx` or mooring cards — show avg star rating |
| DB | `user_ratings` table + RLS policies + trigger |
| DB | `profiles.guest_rating` + `profiles.guest_rating_count` columns |
| DB | `reviews` unique constraint on `booking_id` |

---

## 🔁 Recommended Execution Order

1. **Migrations 1A → 1B → 1C** (DB must exist before hooks can be tested)
2. **`src/hooks/useReviews.ts`** (no UI dependencies)
3. **`src/components/rating/StarRating.tsx`** (base, no hook dependencies)
4. **`ReviewMooringModal.tsx` + `RateGuestModal.tsx` + `ReviewList.tsx`** (parallel)
5. **Dashboard.tsx** + **Explore.tsx** page integration
6. **`npx tsc --noEmit`** → fix any type errors
7. **`npm run dev`** + browser test via `browser_subagent`
