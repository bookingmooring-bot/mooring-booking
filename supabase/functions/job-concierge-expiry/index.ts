// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@13?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (_req: Request) => {
  const now = new Date().toISOString();

  // Find all expired concierge bookings still pending
  const { data: expired, error } = await supabase
    .from('bookings')
    .select('id, stripe_authorization_id, user_id, mooring_id')
    .eq('booking_type', 'concierge')
    .eq('concierge_status', 'pending_marina')
    .lt('concierge_expires_at', now);

  if (error) {
    console.error('Failed to fetch expired concierge bookings:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let processed = 0;

  for (const booking of expired) {
    try {
      // Cancel Stripe authorization hold
      if (booking.stripe_authorization_id) {
        try {
          await stripe.paymentIntents.cancel(booking.stripe_authorization_id);
        } catch (stripeErr) {
          console.warn(
            `Stripe cancel failed for ${booking.stripe_authorization_id}:`,
            stripeErr.message
          );
        }
      }

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          concierge_status: 'expired',
          booking_status: 'cancelled',
          payment_status: 'pending',
        })
        .eq('id', booking.id);

      // Notify user
      try {
        await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-emails`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              type: 'concierge_expired',
              bookingId: booking.id,
              userId: booking.user_id,
              mooringId: booking.mooring_id,
            }),
          }
        );
      } catch (emailErr) {
        console.error('Failed to send expiry notification:', emailErr);
      }

      processed++;
    } catch (err) {
      console.error(`Failed to process expired booking ${booking.id}:`, err);
    }
  }

  console.log(`Processed ${processed} expired concierge bookings`);

  return new Response(
    JSON.stringify({ processed, total: expired.length }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
