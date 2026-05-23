import { z } from 'zod';
import { supabase } from '../supabase.js';
import { config } from '../config.js';

export const cancelConciergeRequestSchema = z.object({
  bookingId: z.string().uuid().describe('UUID of the concierge booking to cancel'),
});

export type CancelConciergeRequestInput = z.infer<typeof cancelConciergeRequestSchema>;

export async function cancelConciergeRequest(input: CancelConciergeRequestInput) {
  // Verify booking exists and is still pending
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, concierge_status, booking_type')
    .eq('id', input.bookingId)
    .eq('booking_type', 'concierge')
    .single();

  if (error || !booking) {
    throw new Error(`Concierge booking not found: ${input.bookingId}`);
  }

  if (booking.concierge_status !== 'pending_marina') {
    throw new Error(`Booking already resolved with status: ${booking.concierge_status}. Cannot cancel.`);
  }

  // Call the existing concierge-respond edge function with decline action
  const response = await fetch(
    `${config.supabaseUrl}/functions/v1/concierge-respond`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        bookingId: input.bookingId,
        action: 'decline',
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Cancel failed: ${err.error || response.statusText}`);
  }

  const result = await response.json();

  return {
    bookingId: input.bookingId,
    status: 'cancelled',
    message: `Booking ${input.bookingId} cancelled. Stripe authorization hold released. Guest notified.`,
    ...result,
  };
}
