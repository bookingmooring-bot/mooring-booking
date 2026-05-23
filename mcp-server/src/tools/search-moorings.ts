import { z } from 'zod';
import { supabase } from '../supabase.js';

export const searchMooringsSchema = z.object({
  location: z.string().optional().describe('Free text search: "Split", "Croatia", "Adriatic"'),
  country: z.string().optional().describe('Country name: "Croatia", "Greece"'),
  lat: z.number().optional().describe('Latitude for geo-proximity search'),
  lng: z.number().optional().describe('Longitude for geo-proximity search'),
  radiusKm: z.number().default(50).describe('Search radius in km (default 50)'),
  checkIn: z.string().optional().describe('Check-in date YYYY-MM-DD'),
  checkOut: z.string().optional().describe('Check-out date YYYY-MM-DD'),
  minBoatLength: z.number().optional().describe('Minimum max_boat_length the mooring must support'),
  maxPricePerNight: z.number().optional().describe('Maximum price per night in EUR'),
  limit: z.number().default(10).describe('Max results to return (default 10)'),
});

export type SearchMooringsInput = z.infer<typeof searchMooringsSchema>;

export async function searchMoorings(input: SearchMooringsInput) {
  let query = supabase
    .from('moorings')
    .select('id, name, location, country, lat, lng, price_per_night, max_boat_length, amenities, contact_email, contact_phone, mooring_layer, image_urls, rating, review_count')
    .eq('mooring_layer', 'concierge')
    .eq('status', 'active');

  if (input.country) {
    query = query.ilike('country', `%${input.country}%`);
  }

  if (input.location) {
    query = query.or(`name.ilike.%${input.location}%,location.ilike.%${input.location}%,country.ilike.%${input.location}%`);
  }

  if (input.minBoatLength) {
    query = query.gte('max_boat_length', input.minBoatLength);
  }

  if (input.maxPricePerNight) {
    query = query.lte('price_per_night', input.maxPricePerNight);
  }

  query = query.limit(input.limit);

  const { data: moorings, error } = await query;

  if (error) throw new Error(`Search failed: ${error.message}`);

  if (!moorings || moorings.length === 0) {
    return { moorings: [], count: 0, message: 'No concierge moorings found matching your criteria' };
  }

  // Filter by availability if dates provided
  if (input.checkIn && input.checkOut) {
    const mooringIds = moorings.map(m => m.id);

    const { data: conflicting } = await supabase
      .from('bookings')
      .select('mooring_id')
      .in('mooring_id', mooringIds)
      .neq('booking_status', 'cancelled')
      .lt('check_in', input.checkOut)
      .gt('check_out', input.checkIn);

    const conflictingIds = new Set((conflicting || []).map(b => b.mooring_id));

    const { data: blocked } = await supabase
      .from('mooring_availability')
      .select('mooring_id')
      .in('mooring_id', mooringIds)
      .gte('date', input.checkIn)
      .lt('date', input.checkOut)
      .eq('available', false);

    const blockedIds = new Set((blocked || []).map(a => a.mooring_id));

    const available = moorings.filter(m => !conflictingIds.has(m.id) && !blockedIds.has(m.id));
    return { moorings: available, count: available.length };
  }

  // Geo-distance sort if lat/lng provided
  if (input.lat && input.lng) {
    const sorted = moorings
      .filter(m => m.lat && m.lng)
      .map(m => ({
        ...m,
        distanceKm: haversine(input.lat!, input.lng!, m.lat, m.lng),
      }))
      .filter(m => m.distanceKm <= input.radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return { moorings: sorted, count: sorted.length };
  }

  return { moorings, count: moorings.length };
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
