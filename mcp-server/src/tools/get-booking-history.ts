import { z } from 'zod';
import { supabase } from '../supabase.js';

export const getBookingHistorySchema = z.object({
  userId: z.string().uuid().optional().describe('User ID to look up'),
  guestEmail: z.string().email().optional().describe('Alternative: look up by guest email'),
  limit: z.number().default(20).describe('Max results (default 20)'),
});

export type GetBookingHistoryInput = z.infer<typeof getBookingHistorySchema>;

export async function getBookingHistory(input: GetBookingHistoryInput) {
  if (!input.userId && !input.guestEmail) {
    throw new Error('Either userId or guestEmail is required');
  }

  let query = supabase
    .from('bookings')
    .select('id, mooring_id, check_in, check_out, booking_type, booking_status, payment_status, concierge_status, total_price, guest_name, guest_email, created_at, moorings(name, location, country)')
    .order('created_at', { ascending: false })
    .limit(input.limit);

  if (input.userId) {
    query = query.eq('user_id', input.userId);
  } else if (input.guestEmail) {
    query = query.eq('guest_email', input.guestEmail);
  }

  const { data: bookings, error } = await query;

  if (error) throw new Error(`History lookup failed: ${error.message}`);

  return { bookings: bookings || [], count: (bookings || []).length };
}
