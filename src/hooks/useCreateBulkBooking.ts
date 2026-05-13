import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Vessel } from './useVesselProfile';

export interface BulkBookingInput {
  mooringId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  commissionAmount: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  vessels: Vessel[];
}

export interface BulkBookingResult {
  succeeded: { vesselId: string; vesselName: string; bookingId: string }[];
  failed: { vesselId: string; vesselName: string; error: string }[];
}

export function useCreateBulkBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BulkBookingInput): Promise<BulkBookingResult> => {
      const result: BulkBookingResult = { succeeded: [], failed: [] };

      for (const vessel of input.vessels) {
        const confirmationCode = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const { data, error } = await supabase
          .from('bookings')
          .insert({
            mooring_id: input.mooringId,
            user_id: user?.id ?? null,
            check_in: input.checkIn,
            check_out: input.checkOut,
            boat_name: vessel.name,
            boat_length: vessel.length_m,
            guest_name: input.guestName,
            guest_email: input.guestEmail,
            guest_phone: input.guestPhone ?? null,
            nights: input.nights,
            price_per_night: input.pricePerNight,
            total_price: input.pricePerNight * input.nights,
            commission_amount: input.commissionAmount,
            payment_method: 'platform',
            payment_status: 'pending',
            booking_status: 'pending',
            confirmation_code: confirmationCode,
            is_now4today: false,
            vessel_id: vessel.id,
          })
          .select('id')
          .single();

        if (error) {
          result.failed.push({ vesselId: vessel.id, vesselName: vessel.name ?? 'Unknown', error: error.message });
        } else {
          result.succeeded.push({ vesselId: vessel.id, vesselName: vessel.name ?? 'Unknown', bookingId: data.id });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-bookings'] });
    },
  });
}
