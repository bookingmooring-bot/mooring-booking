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

interface ConciergeCreateResult {
  /** Stripe Checkout URL to redirect to (present when a concierge fee is due). */
  url?: string;
  /** True when no fee is due (free tier) — no payment step, request already sent. */
  skipPayment?: boolean;
  bookingId: string;
  expiresAt: string;
}

interface ConciergeFinalizeResult {
  ok: boolean;
  bookingId: string;
  expiresAt: string;
}

/**
 * Invoke create-concierge-authorization with the user's access token and surface
 * the real error from the function's JSON body (supabase-js otherwise returns a
 * generic "non-2xx status code" message).
 */
async function invokeConcierge<T>(body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  const { data: result, error } = await supabase.functions.invoke(
    'create-concierge-authorization',
    { body, headers: { Authorization: `Bearer ${session.access_token}` } }
  );

  if (error) {
    let message = error.message || 'Concierge request failed';
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      try {
        const b = await ctx.json();
        if (b?.error) message = b.error;
      } catch {
        // response body wasn't JSON — keep the generic message
      }
    }
    throw new Error(message);
  }
  if ((result as { error?: string })?.error) throw new Error((result as { error: string }).error);
  return result as T;
}

export function useCreateConciergeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConciergeRequestData) =>
      invokeConcierge<ConciergeCreateResult>(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['concierge-bookings'] });
    },
  });
}

/** Finalize after returning from Stripe Checkout: attaches the hold + notifies the marina. */
export function useFinalizeConciergeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      invokeConcierge<ConciergeFinalizeResult>({ action: 'finalize', sessionId }),
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
