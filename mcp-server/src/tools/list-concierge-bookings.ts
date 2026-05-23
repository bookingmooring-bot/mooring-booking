import { z } from 'zod';
import { supabase } from '../supabase.js';

export const listConciergeBookingsSchema = z.object({
  conciergeStatus: z.enum(['pending_marina', 'confirmed', 'declined', 'expired']).optional().describe('Filter by concierge status'),
  userId: z.string().uuid().optional().describe('Filter by guest user ID'),
  mooringId: z.string().uuid().optional().describe('Filter by mooring ID'),
  createdAfter: z.string().optional().describe('Filter bookings created after this ISO date'),
  createdBefore: z.string().optional().describe('Filter bookings created before this ISO date'),
  limit: z.number().default(20).describe('Max results (default 20)'),
});

export type ListConciergeBookingsInput = z.infer<typeof listConciergeBookingsSchema>;

export async function listConciergeBookings(input: ListConciergeBookingsInput) {
  let query = supabase
    .from('bookings')
    .select('id, mooring_id, user_id, guest_name, guest_email, check_in, check_out, concierge_status, booking_status, payment_status, concierge_expires_at, special_requests, created_at, moorings(name, location, country, contact_email)')
    .eq('booking_type', 'concierge')
    .order('created_at', { ascending: false });

  if (input.conciergeStatus) {
    query = query.eq('concierge_status', input.conciergeStatus);
  }

  if (input.userId) {
    query = query.eq('user_id', input.userId);
  }

  if (input.mooringId) {
    query = query.eq('mooring_id', input.mooringId);
  }

  if (input.createdAfter) {
    query = query.gte('created_at', input.createdAfter);
  }

  if (input.createdBefore) {
    query = query.lte('created_at', input.createdBefore);
  }

  query = query.limit(input.limit);

  const { data: bookings, error } = await query;

  if (error) throw new Error(`List failed: ${error.message}`);

  return { bookings: bookings || [], count: (bookings || []).length };
}
