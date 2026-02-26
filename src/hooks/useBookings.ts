import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface CreateBookingInput {
    mooring_id: string;
    check_in: string;
    check_out: string;
    boat_name?: string;
    boat_length?: number;
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    nights: number;
    price_per_night: number;
    total_price: number;
    payment_method?: string;
    is_now4today?: boolean;
}

export interface Booking {
    id: string;
    mooring_id: string;
    user_id: string;
    provider_id: string;
    check_in: string;
    check_out: string;
    boat_name: string | null;
    boat_length: number | null;
    guest_name: string;
    guest_email: string;
    guest_phone: string | null;
    nights: number;
    price_per_night: number;
    total_price: number;
    commission_amount: number;
    payment_method: string | null;
    payment_status: string;
    booking_status: string;
    confirmation_code: string;
    is_now4today: boolean;
    created_at: string;
    moorings?: {
        name: string;
        location: string;
        country: string;
        image_urls: string[];
    };
}

export function useUserBookings() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['bookings', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          moorings (name, location, country, image_urls)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch bookings:', error.message);
                return [];
            }
            return (data as Booking[]) || [];
        },
        enabled: !!user,
    });
}

export function useCreateBooking() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateBookingInput) => {
            const { data, error } = await supabase
                .from('bookings')
                .insert({
                    ...input,
                    user_id: user?.id || null,
                })
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Booking;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}

export function useProviderBookings() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['provider-bookings', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          moorings (name, location, country, image_urls)
        `)
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch provider bookings:', error.message);
                return [];
            }
            return (data as Booking[]) || [];
        },
        enabled: !!user,
    });
}

// Admin: fetch all bookings (requires admin role or service key)
export function useAllBookings() {
    return useQuery({
        queryKey: ['all-bookings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          moorings (name, location, country, image_urls)
        `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Failed to fetch all bookings:', error.message);
                return [];
            }
            return (data as Booking[]) || [];
        },
    });
}

export interface MooringAvailability {
    id: string;
    mooring_id: string;
    date: string;
    available: boolean;
    custom_price: number | null;
}

export function useMooringAvailability(mooringId: string) {
    return useQuery({
        queryKey: ['mooring-availability', mooringId],
        queryFn: async () => {
            if (!mooringId) return [];

            const { data, error } = await supabase
                .from('mooring_availability')
                .select('*')
                .eq('mooring_id', mooringId)
                // Only get availability from today onwards to save bandwidth
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: true });

            if (error) {
                console.error('Failed to fetch mooring availability:', error.message);
                return [];
            }
            return (data as MooringAvailability[]) || [];
        },
        enabled: !!mooringId,
    });
}

