# Hook Implementation — `useProviderEarnings`

Full annotated implementation of `src/hooks/useProviderEarnings.ts`.

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RawProviderBooking {
  id: string;
  mooring_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  commission_amount: number;
  guest_name: string;
  guest_email: string;
  boat_name: string | null;
  boat_length: number | null;
  booking_status: string;
  payment_status: string;
  confirmation_code: string;
  created_at: string;
  moorings?: {
    name: string;
    location: string;
    country: string;
  };
}

export interface MooringEarning {
  mooringId: string;
  mooringName: string;
  location: string;
  country: string;
  totalBookings: number;
  totalNights: number;
  grossRevenue: number;
  commissionPaid: number;
  netEarnings: number;
  avgNightsPerBooking: number;
  occupancyRate: number | null; // 0–100 percentage, null if no availability data
}

export interface ProviderEarningsSummary {
  totalBookings: number;
  totalNights: number;
  grossRevenue: number;
  totalCommission: number;
  netEarnings: number;
  bestMooring: MooringEarning | null;
  byMooring: MooringEarning[]; // sorted by netEarnings DESC
  recentBookings: RawProviderBooking[];
}

// ─── Occupancy fetcher ───────────────────────────────────────────────────────

/** Fetches booked-day counts for all mooring IDs in a single query. */
async function fetchOccupancy(
  mooringIds: string[]
): Promise<Record<string, number>> {
  if (!mooringIds.length) return {};

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const fromDate = oneYearAgo.toISOString().split('T')[0];
  const toDate = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('mooring_availability')
    .select('mooring_id')
    .in('mooring_id', mooringIds)
    .eq('available', false)
    .gte('date', fromDate)
    .lte('date', toDate);

  if (error) {
    console.warn('Could not fetch occupancy data:', error.message);
    return {};
  }

  // Count blocked days per mooring
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.mooring_id] = (counts[row.mooring_id] ?? 0) + 1;
  }
  return counts;
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

/**
 * useProviderEarnings
 *
 * @param filterPaid  - if true, only count bookings where payment_status = 'paid'
 *                      (defaults to false, shows all non-cancelled bookings)
 */
export function useProviderEarnings(filterPaid = false) {
  const { user } = useAuth();

  return useQuery<ProviderEarningsSummary>({
    queryKey: ['provider-earnings', user?.id, filterPaid],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // 1. Fetch all provider bookings (exclude cancelled)
      let query = supabase
        .from('bookings')
        .select(`
          id, mooring_id, check_in, check_out, nights,
          total_price, commission_amount, guest_name, guest_email,
          boat_name, boat_length, booking_status, payment_status,
          confirmation_code, created_at,
          moorings (name, location, country)
        `)
        .eq('provider_id', user.id)
        .neq('booking_status', 'cancelled')
        .order('created_at', { ascending: false });

      if (filterPaid) {
        query = query.eq('payment_status', 'paid');
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const bookings = (data as unknown as RawProviderBooking[]) || [];

      // 2. Group bookings by mooring
      const mooringMap = new Map<string, RawProviderBooking[]>();
      for (const b of bookings) {
        const list = mooringMap.get(b.mooring_id) ?? [];
        list.push(b);
        mooringMap.set(b.mooring_id, list);
      }

      // 3. Fetch occupancy data for all distinct moorings
      const mooringIds = Array.from(mooringMap.keys());
      const occupancy = await fetchOccupancy(mooringIds);
      const DAYS_IN_YEAR = 365;

      // 4. Build per-mooring stats
      const byMooring: MooringEarning[] = Array.from(mooringMap.entries()).map(
        ([mooringId, mBookings]) => {
          const gross = mBookings.reduce(
            (sum, b) => sum + Number(b.total_price ?? 0),
            0
          );
          const commission = mBookings.reduce(
            (sum, b) => sum + Number(b.commission_amount ?? 0),
            0
          );
          const nights = mBookings.reduce(
            (sum, b) => sum + Number(b.nights ?? 0),
            0
          );
          const sample = mBookings[0];
          const bookedDays = occupancy[mooringId] ?? null;
          const occupancyRate =
            bookedDays !== null
              ? Math.round((bookedDays / DAYS_IN_YEAR) * 100)
              : null;

          return {
            mooringId,
            mooringName: sample.moorings?.name ?? 'Unknown',
            location: sample.moorings?.location ?? '',
            country: sample.moorings?.country ?? '',
            totalBookings: mBookings.length,
            totalNights: nights,
            grossRevenue: gross,
            commissionPaid: commission,
            netEarnings: gross - commission,
            avgNightsPerBooking:
              mBookings.length > 0
                ? Math.round((nights / mBookings.length) * 10) / 10
                : 0,
            occupancyRate,
          };
        }
      );

      // 5. Sort by net earnings descending
      byMooring.sort((a, b) => b.netEarnings - a.netEarnings);

      // 6. Aggregate totals
      const totalBookings = bookings.length;
      const totalNights = bookings.reduce(
        (sum, b) => sum + Number(b.nights ?? 0),
        0
      );
      const grossRevenue = bookings.reduce(
        (sum, b) => sum + Number(b.total_price ?? 0),
        0
      );
      const totalCommission = bookings.reduce(
        (sum, b) => sum + Number(b.commission_amount ?? 0),
        0
      );

      return {
        totalBookings,
        totalNights,
        grossRevenue,
        totalCommission,
        netEarnings: grossRevenue - totalCommission,
        bestMooring: byMooring[0] ?? null,
        byMooring,
        recentBookings: bookings.slice(0, 10),
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes — earnings data doesn't need to be real-time
  });
}
```

## Usage in Component

```typescript
const { data: earnings, isLoading, error } = useProviderEarnings();

// With paid-only filter:
const [filterPaid, setFilterPaid] = useState(false);
const { data: earnings } = useProviderEarnings(filterPaid);
```

## Notes on N+1 Avoidance

The hook avoids N+1 queries by:
1. Fetching all bookings in **one** Supabase call with a joined `moorings(...)` sub-select.
2. Fetching occupancy for **all** mooring IDs in **one** single `IN` query.
3. Computing all aggregations client-side — no separate query per mooring.

This keeps the total round-trips at **2** regardless of how many moorings the provider owns.
