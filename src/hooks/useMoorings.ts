import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Mooring } from '@/data/moorings';
import type { MooringLayer } from '@/lib/mooringLayer';
import { geocodeQuery, haversineKm, formatDistance } from '@/lib/geocoding';
import { saveMooringsOffline, getMooringsOffline } from '@/lib/offlineStorage';

export interface DbMooring {
    id: string;
    name: string;
    location: string;
    country: string;
    country_flag: string;
    description: string;
    lat: number;
    lng: number;
    price_per_night: number;
    discount_percent: number;
    wind_protection: string;
    amenities: string[];
    image_urls: string[];
    is_last_minute: boolean;
    is_now4today: boolean;
    is_premium_listing: boolean;
    marketing_tools: boolean;
    insurance_mediation: boolean;
    winter_storage: boolean;
    winter_storage_type: string | null;
    winter_price_monthly: number | null;
    winter_services: string[];
    owner_name: string;
    owner_phone: string;
    owner_whatsapp: string | null;
    rating: number;
    review_count: number;
    status: string;
    owner_id: string | null;
    created_at: string;
    mooring_layer: string | null;
    source_url: string | null;
    data_source: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    mooring_units: number | null;
    max_boat_length: number | null;
    max_draft: number | null;
    max_beam: number | null;
    vhf_channel: string | null;
    operating_hours: string | null;
}

// Convert DB mooring to the frontend Mooring interface
function dbToFrontend(m: DbMooring): Mooring {
    return {
        id: m.id,
        name: m.name,
        location: m.location,
        country: m.country,
        countryFlag: m.country_flag || '',
        rating: Number(m.rating) || 0,
        reviewCount: m.review_count || 0,
        price: Number(m.price_per_night),
        discountPercent: m.discount_percent || undefined,
        isLastMinute: m.is_last_minute || undefined,
        isNow4Today: m.is_now4today || false,
        isPremiumListing: m.is_premium_listing || false,
        isMarketingTools: m.marketing_tools || false,
        isMooringInsurance: m.insurance_mediation || false,
        windProtection: (m.wind_protection || 'good') as Mooring['windProtection'],
        amenities: m.amenities || [],
        image: m.image_urls?.[0] || '',
        distance: '', // Not stored in DB
        lat: m.lat,
        lng: m.lng,
        ownerName: m.owner_name || '',
        ownerPhone: m.owner_phone || '',
        description: m.description || '',
        winterStorage: m.winter_storage || undefined,
        winterStorageType: m.winter_storage_type as 'wet' | 'dry' | 'both' | undefined,
        winterPriceMonthly: m.winter_price_monthly ? Number(m.winter_price_monthly) : undefined,
        status: m.status,
        ownerId: m.owner_id ?? undefined,
        mooringLayer: (m.mooring_layer as MooringLayer) || 'premium',
        sourceUrl: m.source_url ?? undefined,
        dataSource: m.data_source as Mooring['dataSource'],
        contactEmail: m.contact_email ?? undefined,
        contactPhone: m.contact_phone ?? undefined,
        address: m.address ?? undefined,
        mooringUnits: m.mooring_units ?? undefined,
        maxBoatLength: m.max_boat_length ? Number(m.max_boat_length) : undefined,
        maxDraft: m.max_draft ? Number(m.max_draft) : undefined,
        maxBeam: m.max_beam ? Number(m.max_beam) : undefined,
        vhfChannel: m.vhf_channel ?? undefined,
        operatingHours: m.operating_hours ?? undefined,
        createdAt: m.created_at ?? undefined,
    };
}

const PAGE_SIZE = 1000;

async function fetchAllActive(): Promise<DbMooring[]> {
    const all: DbMooring[] = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from('moorings')
            .select('*')
            .eq('status', 'active')
            .order('mooring_layer', { ascending: true })
            .order('rating', { ascending: false })
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error('Failed to fetch moorings page:', error.message);
            break;
        }
        if (!data || data.length === 0) break;

        all.push(...data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    return all;
}

async function fetchMoorings(): Promise<Mooring[]> {
    if (!navigator.onLine) {
        const cached = await getMooringsOffline<Mooring>();
        if (cached.length > 0) return cached;
    }

    const raw = await fetchAllActive();

    if (raw.length === 0) {
        const cached = await getMooringsOffline<Mooring>();
        if (cached.length > 0) return cached;
        return [];
    }

    const moorings = raw.map(dbToFrontend);
    saveMooringsOffline(moorings).catch(() => {});
    return moorings;
}

export function useMoorings() {
    return useQuery({
        queryKey: ['moorings'],
        queryFn: fetchMoorings,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000,   // Cache for 30 minutes
    });
}

export function useMooringsByCountry(country: string) {
    return useQuery({
        queryKey: ['moorings', 'country', country],
        queryFn: async () => {
            const all: DbMooring[] = [];
            let from = 0;
            while (true) {
                const { data, error } = await supabase
                    .from('moorings')
                    .select('*')
                    .eq('status', 'active')
                    .ilike('country', country)
                    .order('mooring_layer', { ascending: true })
                    .order('rating', { ascending: false })
                    .range(from, from + PAGE_SIZE - 1);
                if (error || !data || data.length === 0) break;
                all.push(...data);
                if (data.length < PAGE_SIZE) break;
                from += PAGE_SIZE;
            }
            return all.map(dbToFrontend);
        },
        enabled: !!country,
    });
}

export function useMooringById(id: string) {
    return useQuery({
        queryKey: ['mooring', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('moorings')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                return null;
            }
            return dbToFrontend(data);
        },
        enabled: !!id,
    });
}

export function useSearchMoorings(query: string) {
    return useQuery({
        queryKey: ['moorings', 'search', query],
        queryFn: async () => {
            if (!query) return fetchMoorings();

            const all: DbMooring[] = [];
            let from = 0;
            while (true) {
                const { data, error } = await supabase
                    .from('moorings')
                    .select('*')
                    .eq('status', 'active')
                    .or(`name.ilike.%${query}%,location.ilike.%${query}%,country.ilike.%${query}%`)
                    .order('mooring_layer', { ascending: true })
                    .order('rating', { ascending: false })
                    .range(from, from + PAGE_SIZE - 1);
                if (error || !data || data.length === 0) break;
                all.push(...data);
                if (data.length < PAGE_SIZE) break;
                from += PAGE_SIZE;
            }
            return all.map(dbToFrontend);
        },
        staleTime: 2 * 60 * 1000,
    });
}

export function useProviderMoorings(providerId: string | undefined) {
    return useQuery({
        queryKey: ['moorings', 'provider', providerId],
        queryFn: async () => {
            if (!providerId) return [];

            const { data, error } = await supabase
                .from('moorings')
                .select('*')
                .eq('owner_id', providerId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch provider moorings:', error.message);
                return [];
            }

            if (!data) return [];

            return data.map(dbToFrontend);
        },
        enabled: !!providerId,
    });
}

export function useToggleMooringStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status, providerId }: { id: string; status: 'active' | 'inactive'; providerId: string }) => {
            const { error } = await supabase
                .from('moorings')
                .update({ status })
                .eq('id', id)
                .eq('owner_id', providerId);

            if (error) throw error;
            return { id, status };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['moorings', 'provider', variables.providerId] });
            queryClient.invalidateQueries({ queryKey: ['moorings'] });
        },
    });
}

export interface MooringAddonUpdate {
    id: string;
    providerId: string;
    is_now4today?: boolean;
    is_premium_listing?: boolean;
    marketing_tools?: boolean;
    insurance_mediation?: boolean;
}

export function useUpdateMooringAddons() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, providerId, ...fields }: MooringAddonUpdate) => {
            const { error } = await supabase
                .from('moorings')
                .update(fields)
                .eq('id', id)
                .eq('owner_id', providerId);

            if (error) throw error;
            return { id, providerId };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['moorings', 'provider', variables.providerId] });
            queryClient.invalidateQueries({ queryKey: ['moorings'] });
        },
    });
}

export interface AvailableMooringsParams {
    checkIn: string;     // YYYY-MM-DD
    checkOut: string;    // YYYY-MM-DD
    query?: string;
    country?: string;
}

/**
 * Fetches moorings that are confirmed available for the given date range.
 * Uses the get_available_moorings RPC which cross-checks both bookings
 * and the mooring_availability calendar to exclude blocked moorings.
 * Falls back to fetchMoorings() when dates are not provided.
 */
export function useAvailableMoorings(params: Partial<AvailableMooringsParams>) {
    const { checkIn, checkOut, query = '', country = '' } = params;
    const hasDateRange = !!checkIn && !!checkOut;

    return useQuery({
        queryKey: ['moorings', 'available', checkIn, checkOut, query, country],
        queryFn: async () => {
            if (!hasDateRange) {
                // No dates — return all active moorings (client-side text filter applied on Explorer)
                return fetchMoorings();
            }

            const { data, error } = await supabase
                .rpc('get_available_moorings', {
                    p_check_in: checkIn,
                    p_check_out: checkOut,
                    p_query: query || null,
                    p_country: country || null,
                });

            if (error) {
                console.error('get_available_moorings RPC error:', error.message);
                return [];
            }

            return (data as DbMooring[]).map(dbToFrontend);
        },
        staleTime: 1 * 60 * 1000, // 1 minute — availability changes often
    });
}

export interface LocationSearchParams {
    query: string;       // free-text city/place name, e.g. "venecia" or "Split"
    radiusKm?: number;   // default: 20 km
    checkIn?: string;    // YYYY-MM-DD (optional)
    checkOut?: string;   // YYYY-MM-DD (optional)
}

export interface MooringWithDistance extends Mooring {
    distanceKm: number;
}

/**
 * Geocodes the search query, fetches all active moorings, then filters + sorts
 * them by real geographic distance (Haversine formula).
 *
 * The result will have:
 *   - mooring.distance = "3.2 km from Venice"
 *   - mooring.distanceKm = 3.2 (numeric, for sorting)
 *
 * Works with ANY city spelling — "venecia", "Venezia", "Venice", "Venecija" all
 * resolve to the same lat/lng via OpenStreetMap Nominatim.
 */
export function useMooringsByLocation(params: LocationSearchParams) {
    const { query, radiusKm = 20, checkIn, checkOut } = params;
    const trimmed = query.trim();

    return useQuery({
        queryKey: ['moorings', 'geo', trimmed, radiusKm, checkIn, checkOut],
        queryFn: async (): Promise<MooringWithDistance[]> => {
            if (trimmed.length < 2) return [];

            // 1. Geocode the user's search query
            const geo = await geocodeQuery(trimmed);
            if (!geo) {
                console.warn('[useMooringsByLocation] Could not geocode:', trimmed);
                return [];
            }

            // 2. Fetch moorings (availability-aware when dates are given)
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
                raw = await fetchAllActive();
            }

            // 3. Calculate distance for every mooring, filter by radius, sort closest-first
            const results: MooringWithDistance[] = raw
                .filter((m) => m.lat && m.lng)  // skip nulls / 0,0
                .map((m) => {
                    const distKm = haversineKm(geo.lat, geo.lng, m.lat, m.lng);
                    const frontend = dbToFrontend(m);
                    return {
                        ...frontend,
                        distance: `${formatDistance(distKm)} from ${geo.cityName}`,
                        distanceKm: distKm,
                    };
                })
                .filter(({ distanceKm }) => distanceKm <= radiusKm)
                .sort((a, b) => a.distanceKm - b.distanceKm);

            return results;
        },
        staleTime: 3 * 60 * 1000,
        enabled: trimmed.length >= 2,
    });
}

