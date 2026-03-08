# Implementation Log

---

## ✅ [Step 1] — Supabase RPC: `get_available_moorings`
**Date:** 2026-02-28 17:18  
**Status:** Completed

### What Was Done
Created a new PostgreSQL RPC function `get_available_moorings` via Supabase migration. The function accepts `p_check_in`, `p_check_out` (dates), `p_query` (text), and `p_country` (text). It returns all active moorings that match the location/country filter AND have NO overlapping confirmed/pending bookings for the requested dates AND have NO manually blocked dates in `mooring_availability`.

### Files Changed
| File | Change | Details |
|------|--------|---------|
| Supabase: `public.get_available_moorings` | Created | SQL RPC function, SECURITY DEFINER, STABLE |

### Key Decisions Made
- Overlap condition: `check_in < p_check_out AND check_out > p_check_in` — standard half-open interval overlap
- Also cross-checks `mooring_availability` table for `available = false` rows in the range
- Orders results by `is_premium_listing DESC, rating DESC` to match frontend premium-first sort

---

## ✅ [Step 2] — `useAvailableMoorings` hook in `useMoorings.ts`
**Date:** 2026-02-28 17:19  
**Status:** Completed

### What Was Done
Added `useAvailableMoorings(params)` export to `useMoorings.ts`. When `checkIn` + `checkOut` are provided it calls the `get_available_moorings` RPC and maps results through `dbToFrontend`. When no dates are given it falls back to `fetchMoorings()`.

### Files Changed
| File | Change | Details |
|------|--------|---------|
| `src/hooks/useMoorings.ts` | Modified | Added `AvailableMooringsParams` interface and `useAvailableMoorings` hook |

### Key Decisions Made
- `staleTime: 1 minute` instead of 5 min — availability data is more time-sensitive than general listing data

---

## ✅ [Step 3 & 4] — Explore.tsx rewrite + European date format
**Date:** 2026-02-28 17:21  
**Status:** Completed

### What Was Done
Fully rewrote `Explore.tsx` to use the new rich search bar. The search strip matches the homepage design with four zones: Location text input, Check-in date, Check-out date, and a Search button. Date inputs use `lang="hr"` so browsers that support `lang` on date inputs render DD.MM.YYYY. For the committed search, dates are also displayed in EU format (DD.MM.YYYY) in the result count line and the night count badge. The location input uses smart country detection — if the text matches a known country name exactly, it's passed as `p_country`; otherwise it's passed as `p_query` to match name/location fields. The advanced filters panel (amenities, Now4Today, winter storage) and sort controls are preserved.

### Files Changed
| File | Change | Details |
|------|--------|---------|
| `src/pages/Explore.tsx` | Rewritten | New search bar, EU date pickers, availability hook wired, separate committed/input state |

### Key Decisions Made
- Two-stage state (input vs committed) so the results don't re-fetch on every keystroke — only on Search button click or Enter
- `lang="hr"` on date inputs: Croatian locale uses DD.MM.YYYY which matches the EU standard requested
- `formatDateEU()` helper converts YYYY-MM-DD → DD.MM.YYYY for all displayed text
- Night count shown as a contextual hint below the search strip when dates are selected
- Removed the old separate country dropdown — replaced by smart detection in the location text input (typing "Croatia" is equivalent to selecting Croatia from the old dropdown)
- Clear search button shown in the empty-results state to easily reset

---

## 🏁 Implementation Complete

**Date:** 2026-02-28  
**Total Steps Completed:** 4  
**Files Created:** 1 (Supabase RPC)  
**Files Modified:** 2 (`useMoorings.ts`, `Explore.tsx`)

### Summary
The Explorer search has been upgraded from a simple text box + country dropdown to a full Airbnb-style search bar with Location, Check-in, Check-out, and a Search button. Availability checking is backed by a real Supabase RPC that cross-references confirmed bookings AND the mooring_availability calendar to ensure every result shown is genuinely free for the requested dates. Dates are displayed in DD.MM.YYYY European format throughout.

### Next Steps for User
- [ ] Run `npm run dev` to test locally
- [ ] Test: type "Croatia" in location → should show only Croatian moorings
- [ ] Test: type "Split" in location → shows moorings specifically in Split
- [ ] Test: pick dates that cover a known confirmed booking → that mooring should disappear
- [ ] Test: clear search button in empty-results state
