import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Mooring } from '@/data/moorings';
import type { MooringLayer } from '@/lib/mooringLayer';
import { geocodeQuery, formatDistance } from '@/lib/geocoding';
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

// ─── Explore page: server-side filtered + paginated browse ──────────────────
//
// All filtering, sorting, date-availability and geo-radius is done by the
// get_explore_moorings RPC. The grid uses an infinite query (PAGE rows at a
// time); the map uses a single large-limit query. This replaces the old
// "fetch all 5927 active moorings + filter/sort in JS" path.

const EXPLORE_PAGE = 24;
const EXPLORE_MAP_LIMIT = 3000;

/** Row shape returned by get_explore_moorings (DbMooring + extras). */
interface ExploreRow extends DbMooring {
    distance_km: number | null;
    total_count: number;
}

export interface ExploreFilters {
    checkIn?: string;        // YYYY-MM-DD
    checkOut?: string;       // YYYY-MM-DD
    query?: string;          // free-text name/location (when not a country)
    country?: string;        // canonical English country name
    layer?: MooringLayer | 'all';
    amenities?: string[];
    lastMinute?: boolean;
    winterStorage?: boolean;
    sort?: string;           // 'rating' | 'price-low' | 'price-high' | 'reviews'
    lat?: number;            // geo search center (from geocoder)
    lng?: number;
    radiusKm?: number;
    cityName?: string;       // for the "X km from <city>" label
}

/** Maps ExploreFilters → get_explore_moorings RPC argument object. */
function exploreRpcArgs(f: ExploreFilters, limit: number, offset: number) {
    return {
        p_limit: limit,
        p_offset: offset,
        p_check_in: f.checkIn || null,
        p_check_out: f.checkOut || null,
        p_query: f.query?.trim() || null,
        p_country: f.country || null,
        p_layer: f.layer && f.layer !== 'all' ? f.layer : null,
        p_amenities: f.amenities && f.amenities.length > 0 ? f.amenities : null,
        p_last_minute: f.lastMinute ? true : null,
        p_winter_storage: f.winterStorage ? true : null,
        p_sort: f.sort || 'rating',
        p_lat: f.lat ?? null,
        p_lng: f.lng ?? null,
        p_radius_km: f.radiusKm ?? null,
    };
}

/** Converts an ExploreRow to the frontend Mooring, attaching a distance label. */
function exploreRowToFrontend(row: ExploreRow, cityName?: string): Mooring {
    const m = dbToFrontend(row);
    if (row.distance_km != null && cityName) {
        m.distance = `${formatDistance(row.distance_km)} from ${cityName}`;
    }
    return m;
}

/**
 * Infinite-scroll list for the Explore grid. Loads EXPLORE_PAGE moorings per
 * page; getNextPageParam stops once the loaded count reaches total_count.
 */
export function useExploreMoorings(filters: ExploreFilters) {
    return useInfiniteQuery({
        queryKey: ['explore', filters],
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            // Offline: serve cached first page if available
            if (pageParam === 0 && !navigator.onLine) {
                const cached = await getMooringsOffline<Mooring>();
                if (cached.length > 0) return { rows: cached, total: cached.length, offset: 0 };
            }

            const { data, error } = await supabase.rpc(
                'get_explore_moorings',
                exploreRpcArgs(filters, EXPLORE_PAGE, pageParam),
            );

            if (error) {
                console.error('get_explore_moorings RPC error:', error.message);
                return { rows: [] as Mooring[], total: 0, offset: pageParam };
            }

            const raw = (data as ExploreRow[]) ?? [];
            const total = raw.length > 0 ? Number(raw[0].total_count) : 0;
            const rows = raw.map((r) => exploreRowToFrontend(r, filters.cityName));

            // Best-effort offline cache of the first page
            if (pageParam === 0 && rows.length > 0) {
                saveMooringsOffline(rows).catch(() => {});
            }

            return { rows, total, offset: pageParam };
        },
        getNextPageParam: (lastPage) => {
            const loaded = lastPage.offset + lastPage.rows.length;
            return loaded < lastPage.total ? loaded : undefined;
        },
        staleTime: 60 * 1000,
    });
}

/**
 * Single-shot query for the map view — returns up to EXPLORE_MAP_LIMIT matching
 * moorings (ExploreMap culls to viewport and caps markers at 500). Enabled only
 * when the map view is active to avoid the larger fetch on the default grid view.
 */
export function useExploreMooringsMap(filters: ExploreFilters, enabled: boolean) {
    return useQuery({
        queryKey: ['explore-map', filters],
        queryFn: async (): Promise<Mooring[]> => {
            const { data, error } = await supabase.rpc(
                'get_explore_moorings',
                exploreRpcArgs(filters, EXPLORE_MAP_LIMIT, 0),
            );
            if (error) {
                console.error('get_explore_moorings (map) RPC error:', error.message);
                return [];
            }
            return ((data as ExploreRow[]) ?? []).map((r) => exploreRowToFrontend(r, filters.cityName));
        },
        enabled,
        staleTime: 60 * 1000,
    });
}

/**
 * Geocodes a free-text city/place query to {lat, lng, cityName} via Nominatim.
 * Cached for the session; the result feeds the geo params of useExploreMoorings.
 */
export function useGeocodedLocation(query: string, enabled: boolean) {
    const trimmed = query.trim();
    return useQuery({
        queryKey: ['geocode', trimmed.toLowerCase()],
        queryFn: () => geocodeQuery(trimmed),
        enabled: enabled && trimmed.length >= 2,
        staleTime: Infinity,
        gcTime: 60 * 60 * 1000,
    });
}

