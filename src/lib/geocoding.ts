/**
 * Geocoding utilities for the Mooring Booking app.
 *
 * Uses OpenStreetMap Nominatim — free, no API key required.
 * Rate limit: 1 req/second — always debounce before calling geocodeQuery.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;  // e.g. "Venice, Veneto, Italy"
  cityName: string;     // e.g. "Venice" (first segment of displayName)
}

// ─── Simple in-memory cache to avoid re-geocoding the same query ──────────────

const geoCache = new Map<string, GeoLocation | null>();

// ─── Geocoding ────────────────────────────────────────────────────────────────

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode a free-text location query to {lat, lng, displayName}.
 * Returns null if the location was not found or the request failed.
 *
 * Results are cached in memory for the session lifetime.
 */
export async function geocodeQuery(query: string): Promise<GeoLocation | null> {
  const key = query.trim().toLowerCase();
  if (!key || key.length < 2) return null;

  // Return cached result (even if null — don't retry failed queries)
  if (geoCache.has(key)) return geoCache.get(key) ?? null;

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: '1',
      addressdetails: '0',
    });

    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        // Nominatim requires a descriptive User-Agent
        'User-Agent': 'MooringBooking/1.0 (mooring-booking.com)',
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) {
      geoCache.set(key, null);
      return null;
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      geoCache.set(key, null);
      return null;
    }

    const first = data[0];
    const displayName: string = first.display_name || query;
    const cityName = displayName.split(',')[0].trim();

    const result: GeoLocation = {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      displayName,
      cityName,
    };

    geoCache.set(key, result);
    return result;
  } catch (err) {
    console.error('[geocodeQuery] Request failed:', err);
    geoCache.set(key, null);
    return null;
  }
}

// ─── Distance calculation ─────────────────────────────────────────────────────

/** Earth's mean radius in kilometres */
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — returns the great-circle distance in km
 * between two points given their latitude and longitude in decimal degrees.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Formats a distance value into a human-readable string.
 * Examples: "800 m", "3.2 km", "15 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
