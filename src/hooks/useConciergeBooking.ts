import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ConciergeRequestData {
  mooringId: string;
  bookingData: {
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    boatName: string;
    boatLength: number | null;
    specialRequests?: string;
  };
  serviceFeeAmount: number;
}

interface ConciergeRequestResult {
  bookingId: string;
  authorizationId: string;
  clientSecret: string;
  expiresAt: string;
}

export function useCreateConciergeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConciergeRequestData): Promise<ConciergeRequestResult> => {
      const { data: result, error } = await supabase.functions.invoke(
        'create-concierge-authorization',
        { body: data }
      );

      if (error) throw new Error(error.message || 'Failed to create concierge request');
      if (result?.error) throw new Error(result.error);
      return result as ConciergeRequestResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['concierge-bookings'] });
    },
  });
}

export function useConciergeBookingStatus(bookingId: string | null) {
  return useQuery({
    queryKey: ['concierge-status', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;

      const { data, error } = await supabase
        .from('bookings')
        .select('id, concierge_status, concierge_expires_at, booking_status, payment_status, quoted_price, guest_response_expires_at, booking_type')
        .eq('id', bookingId)
        .in('booking_type', ['concierge', 'now4today'])
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
    refetchInterval: 30_000,
  });
}

export function useUserConciergeBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['concierge-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select('*, moorings(name, location, country, image_urls)')
        .eq('user_id', user.id)
        .in('booking_type', ['concierge', 'now4today'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
