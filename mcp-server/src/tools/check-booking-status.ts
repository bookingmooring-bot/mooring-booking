import { z } from 'zod';
import { supabase } from '../supabase.js';

export const checkBookingStatusSchema = z.object({
  bookingId: z.string().uuid().describe('UUID of the concierge booking'),
});

export type CheckBookingStatusInput = z.infer<typeof checkBookingStatusSchema>;

export async function checkBookingStatus(input: CheckBookingStatusInput) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, concierge_status, concierge_expires_at, booking_status, payment_status, booking_type, created_at, mooring_id, guest_name, guest_email')
    .eq('id', input.bookingId)
    .eq('booking_type', 'concierge')
    .single();

  if (error || !booking) {
    throw new Error(`Concierge booking not found: ${input.bookingId}`);
  }

  const isExpired = booking.concierge_expires_at
    ? new Date(booking.concierge_expires_at) < new Date()
    : false;

  return {
    ...booking,
    isExpired,
    isPending: booking.concierge_status === 'pending_marina' && !isExpired,
    isResolved: ['confirmed', 'declined', 'expired'].includes(booking.concierge_status),
  };
}
