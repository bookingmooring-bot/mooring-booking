---
name: geo-mooring-search
description: |
  Implements geolocation-based mooring search for the Mooring Booking app.
  Use this skill whenever the user wants to:
  — Fix the Explore page so typing ANY city/town/port name (even misspelled or in another language) finds nearby moorings within a given radius (default 20 km)
  — Replace or upgrade the current text-based ilike search with geocoding + Haversine distance calculation
  — Show moorings sorted by actual distance from the searched location (closest first)
  — Display "X km from Venice" labels on mooring cards instead of text location strings
  — Add a `useMooringsByLocation` hook that geocodes a query string and returns moorings sorted by distance
  — Fix the "no results found" problem when users type city names in different languages, alternative spellings, or local variants (e.g. "venecia", "Venezia", "Venice", "Venecija" all resolve to the same coordinates)
  — Add radius filtering to the Explore page (e.g. show only moorings within 10 km, 20 km, 50 km)
  — Add distance badges to MooringCardWithBooking showing how far the mooring is from the searched location

  ALWAYS use this skill when the user reports that searching by city gives no results, when they want distance-sorted results, or when they use phrases like:
  "sortiranje po udaljenosti", "udaljenost od lokacije", "grad search", "pretraži po gradu", "pronaći vez blizu",
  "nearest mooring", "moorings near Venice", "sort by distance", "show distance", "km from city",
  "geocoding", "geolokacija", "geocode grad", "radius pretraga", "search by location",
  "ne nalazi grad", "ne prepoznaje grad", "upiše grad nema rezultata", "venecia nema rezultata",
  "ne nalazi venice", "samo po lokaciji", "ne po tekstu", "udaljen vez", "koliko daleko".
---

# Geolocation-Based Mooring Search

## Overview

The current search in `Explore.tsx` works with simple text-based `ilike` matching on `name`, `location`, and `country` columns. This fails completely when users type:
- Alternative language spelling: "venecia", "Venezia", "Venecia", "Venecia"
- Informal names: "Split harbor", "Dubrovnik center", "Hvar old town"
- Coordinates or fuzzy location references

**The correct approach:** Geocode → Distance filter → Sort by distance.

## Architecture

```
User types "venecia"
    ↓
Geocoding API (Nominatim / OpenCage) → { lat: 45.4408, lng: 12.3155 }
    ↓
Haversine formula → distance from each mooring's (lat, lng) to Venice coordinates
    ↓
Filter: keep only moorings within radius (default: 20 km)
    ↓
Sort: closest first
    ↓
Display: "3.2 km from Venice" badge on each card
```

## Step-by-Step Implementation

### Step 1 — Create the geocoding utility

Create `src/lib/geocoding.ts`:

```typescript
/**
 * Geocodes a free-text location query to { lat, lng, displayName }.
 * Uses the OpenStreetMap Nominatim API — free, no API key required.
 * For production, consider OpenCage (opencagedata.com, free tier: 2500 req/day).
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string; // e.g. "Venice, Veneto, Italy"
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode a query string.
 * Returns null if the location was not found.
 */
export async function geocodeQuery(query: string): Promise<GeoLocation | null> {
  if (!query || query.trim().length < 2) return null;

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: '1',
      addressdetails: '0',
    });

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        // Nominatim requires a User-Agent that identifies your app
        'User-Agent': 'MooringBooking/1.0 (mooring-booking.com)',
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    const first = data[0];
    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch (err) {
    console.error('[geocodeQuery] failed:', err);
    return null;
  }
}
```

**Important Nominatim usage rules:**
- Max 1 request/second — add debounce of at least 600ms before geocoding
- Identify your app with a User-Agent header
- Cache results so the same city isn't re-geocoded on every keystroke

### Step 2 — Create the Haversine distance utility

Add to `src/lib/geocoding.ts`:

```typescript
/** Earth's radius in kilometers */
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — great-circle distance between two lat/lng points in km.
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format a distance nicely: "0.8 km" or "12 km" */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
```

### Step 3 — Add `useMooringsByLocation` hook

Add to `src/hooks/useMoorings.ts`:

```typescript
import { geocodeQuery, haversineKm, formatDistance } from '@/lib/geocoding';

export interface LocationSearchParams {
  query: string;          // free text, e.g. "venecia" or "Split"
  radiusKm?: number;      // default: 20
  checkIn?: string;       // YYYY-MM-DD, optional
  checkOut?: string;      // YYYY-MM-DD, optional
}

/**
 * Geocodes the query, loads all active moorings, then filters + sorts by distance.
 * Returns moorings with a populated `distance` field ("3.2 km from Venice").
 */
export function useMooringsByLocation(params: LocationSearchParams) {
  const { query, radiusKm = 20, checkIn, checkOut } = params;

  return useQuery({
    queryKey: ['moorings', 'geo', query, radiusKm, checkIn, checkOut],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return [];

      // 1. Geocode the search query
      const geo = await geocodeQuery(query);
      if (!geo) {
        console.warn('[useMooringsByLocation] Could not geocode:', query);
        return [];
      }

      // 2. Fetch all active moorings (or available for date range)
      let raw: DbMooring[] = [];
      if (checkIn && checkOut) {
        const { data, error } = await supabase.rpc('get_available_moorings', {
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_query: null,
          p_country: null,
        });
        if (!error && data) raw = data as DbMooring[];
      } else {
        const { data, error } = await supabase
          .from('moorings')
          .select('*')
          .eq('status', 'active');
        if (!error && data) raw = data as DbMooring[];
      }

      // 3. Calculate distance for each mooring and filter by radius
      const withDistance = raw
        .map((m) => {
          const distKm = haversineKm(geo.lat, geo.lng, m.lat, m.lng);
          return { m, distKm };
        })
        .filter(({ distKm }) => distKm <= radiusKm)
        .sort((a, b) => a.distKm - b.distKm);

      // 4. Convert to frontend format with distance label
      const cityName = geo.displayName.split(',')[0].trim();
      return withDistance.map(({ m, distKm }) => ({
        ...dbToFrontend(m),
        distance: `${formatDistance(distKm)} from ${cityName}`,
        distanceKm: distKm,
      }));
    },
    staleTime: 3 * 60 * 1000,
    enabled: query.trim().length >= 2,
  });
}
```

### Step 4 — Integrate into Explore.tsx

In `Explore.tsx`, upgrade the search logic:

```typescript
import { useMooringsByLocation } from '@/hooks/useMoorings';
import { useDebounce } from '@/hooks/useDebounce'; // standard debounce hook

// ── In the component ──────────────────────────────────────────────────
const [useGeoSearch, setUseGeoSearch] = useState(false);
const debouncedLocation = useDebounce(committedLocation, 600);

// Geo search — try this first when the query doesn't match a known country
const geoSearchEnabled = useGeoSearch && committedLocation.length >= 2;

const { data: geoData, isLoading: geoLoading } = useMooringsByLocation({
  query: debouncedLocation,
  radiusKm: 20,
  checkIn: committedCheckIn || undefined,
  checkOut: committedCheckOut || undefined,
});

// After the normal hook returns 0 results, auto-switch to geo search:
useEffect(() => {
  if (!mooringsLoading && allMoorings.length === 0 && committedLocation.length >= 2) {
    setUseGeoSearch(true);
  } else {
    setUseGeoSearch(false);
  }
}, [mooringsLoading, allMoorings.length, committedLocation]);

// Use geo results when text search returned nothing
const displayMoorings = useGeoSearch ? (geoData || []) : filteredMoorings;
const isLoadingDisplay = mooringsLoading || (useGeoSearch && geoLoading);
```

**Alternative (simpler):** Always use `useMooringsByLocation` for any query >= 2 chars, and fall back to text search only when location is empty.

### Step 5 — Add `useDebounce` hook (if missing)

Create `src/hooks/useDebounce.ts` if it doesn't exist:

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
```

### Step 6 — Show distance on mooring cards

The `MooringCardWithBooking` component already accepts a `distance` prop and the `Mooring` interface has a `distance: string` field (currently always empty). After this change, it will be populated automatically with "3.2 km from Venice".

Check `src/components/MooringCardWithBooking.tsx` to confirm the distance prop is rendered. If it's not shown in the UI, find where the card renders location info and add:

```tsx
{distance && (
  <span className="text-xs text-muted-foreground flex items-center gap-1">
    <MapPin size={10} />
    {distance}
  </span>
)}
```

### Step 7 — Verify moorings have lat/lng populated

Before testing, confirm moorings in DB have valid coordinates:

```sql
SELECT id, name, location, lat, lng
FROM moorings
WHERE status = 'active'
  AND (lat IS NULL OR lng IS NULL OR lat = 0 OR lng = 0);
```

If rows have `lat = 0` or `lng = 0`, those moorings need their coordinates populated first. You can geocode them using the `geocoding.ts` utility or via a one-time admin script.

### Step 8 — Optional: Supabase PostGIS approach (advanced)

If the app has the `postgis` extension enabled, you can do radius filtering entirely server-side:

```sql
-- Enable PostGIS (once, in Supabase SQL editor)
create extension if not exists postgis;

-- Add a geography column to moorings
alter table moorings add column if not exists geolocation geography(Point, 4326);

-- Populate from existing lat/lng
update moorings
set geolocation = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
where lat is not null and lng is not null;

-- Create an RPC for radius search
create or replace function get_moorings_near_point(
  p_lat float8,
  p_lng float8,
  p_radius_km float8 default 20
)
returns setof moorings as $$
  select *
  from moorings
  where status = 'active'
    and geolocation is not null
    and ST_DWithin(geolocation, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
  order by ST_Distance(geolocation, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography);
$$ language sql stable;
```

Use this approach when mooring count grows large (>10,000) and client-side filtering becomes slow.

## Key Design Decisions

- **Nominatim first, OpenCage as upgrade:** Nominatim is free with no API key. If the app needs higher reliability or rate limits, use OpenCage (environment variable: `VITE_OPENCAGE_API_KEY`).
- **Graceful fallback:** If geocoding fails (network error, unknown location), fall back to the existing text search — never show a broken state.
- **Debouncing:** Geocode requests fire at most once every 600ms to respect Nominatim's 1 req/s limit.
- **Client-side Haversine:** For current mooring counts (<1000), client-side distance filtering is instant. For scale, use PostGIS (Step 8).

## Common Issues

| Problem | Fix |
|---------|-----|
| Nominatim returns no results | Query is too short or very local — try appending ", Mediterranean" or country name |
| All moorings show 0 km | `lat`/`lng` DB columns are 0 or NULL — populate them first |
| Distance shows "Infinity" | One mooring has invalid lat/lng — add a `.filter(m => m.lat && m.lng)` guard |
| Search is slow | Add debounce (600ms), cache geocoded coordinates in `sessionStorage` |
| Too many Nominatim requests | Cache: `sessionStorage.setItem('geo:venice', JSON.stringify({lat,lng,displayName}))` |
