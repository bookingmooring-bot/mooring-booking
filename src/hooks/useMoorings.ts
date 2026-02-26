import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { allMoorings as hardcodedMoorings, Mooring } from '@/data/moorings';

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
        windProtection: m.wind_protection as Mooring['windProtection'],
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
    };
}

async function fetchMoorings(): Promise<Mooring[]> {
    const { data, error } = await supabase
        .from('moorings')
        .select('*')
        .eq('status', 'active')
        .order('rating', { ascending: false });

    if (error) {
        console.error('Failed to fetch moorings from Supabase:', error.message);
        return [];
    }

    if (!data || data.length === 0) {
        return [];
    }

    return data.map(dbToFrontend);
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
            const { data, error } = await supabase
                .from('moorings')
                .select('*')
                .eq('status', 'active')
                .ilike('country', country)
                .order('rating', { ascending: false });

            if (error || !data) {
                return [];
            }
            return data.map(dbToFrontend);
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

            const { data, error } = await supabase
                .from('moorings')
                .select('*')
                .eq('status', 'active')
                .or(`name.ilike.%${query}%,location.ilike.%${query}%,country.ilike.%${query}%`)
                .order('rating', { ascending: false });

            if (error || !data) {
                return [];
            }
            return data.map(dbToFrontend);
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
