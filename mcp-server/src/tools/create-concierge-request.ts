import { z } from 'zod';
import { supabase } from '../supabase.js';
import { config } from '../config.js';

export const createConciergeRequestSchema = z.object({
  mooringId: z.string().uuid().describe('UUID of the concierge mooring'),
  userId: z.string().uuid().describe('UUID of an existing user profile'),
  checkIn: z.string().describe('Check-in date YYYY-MM-DD'),
  checkOut: z.string().describe('Check-out date YYYY-MM-DD'),
  guestName: z.string().describe('Full name of the guest'),
  guestEmail: z.string().email().describe('Guest email address'),
  guestPhone: z.string().optional().describe('Guest phone number'),
  boatName: z.string().optional().describe('Name of the boat'),
  boatLength: z.number().optional().describe('Boat length in meters'),
  specialRequests: z.string().optional().describe('Special requests for the marina'),
  serviceFeeAmount: z.number().optional().describe('Service fee in EUR (auto-calculated if omitted)'),
});

export type CreateConciergeRequestInput = z.infer<typeof createConciergeRequestSchema>;

export async function createConciergeRequest(input: CreateConciergeRequestInput) {
  // Validate user exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, stripe_customer_id')
    .eq('id', input.userId)
    .single();

  if (profileError || !profile) {
    throw new Error(`User profile not found: ${input.userId}. The user must have an existing account.`);
  }

  // Calculate service fee if not provided
  let serviceFeeAmount = input.serviceFeeAmount;
  if (!serviceFeeAmount) {
    const { data: mooring } = await supabase
      .from('moorings')
      .select('price_per_night')
      .eq('id', input.mooringId)
      .single();

    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    serviceFeeAmount = (mooring?.price_per_night || 50) * nights;
  }

  // Call the existing edge function with service role key
  const response = await fetch(
    `${config.supabaseUrl}/functions/v1/create-concierge-authorization`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        userId: input.userId,
        mooringId: input.mooringId,
        serviceFeeAmount,
        bookingData: {
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone || null,
          boatName: input.boatName || null,
          boatLength: input.boatLength || null,
          specialRequests: input.specialRequests || null,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Concierge request failed: ${err.error || response.statusText}`);
  }

  const result = await response.json();

  // Strip clientSecret — not needed for N8N
  return {
    bookingId: result.bookingId,
    authorizationId: result.authorizationId,
    expiresAt: result.expiresAt,
    message: `Concierge request created. Marina will be notified via email. Check status with check_booking_status tool using bookingId: ${result.bookingId}`,
  };
}
