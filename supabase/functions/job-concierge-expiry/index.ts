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

const baseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function sendEmail(type: string, data: Record<string, unknown>) {
  try {
    await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ type, ...data }),
    });
  } catch (emailErr) {
    console.error(`Failed to send ${type} email:`, emailErr);
  }
}

async function cancelStripeHold(authorizationId: string) {
  if (!authorizationId) return;
  try {
    await stripe.paymentIntents.cancel(authorizationId);
  } catch (stripeErr) {
    console.warn(`Stripe cancel failed for ${authorizationId}:`, stripeErr.message);
  }
}

Deno.serve(async (_req: Request) => {
  const now = new Date().toISOString();
  let processedProviderExpiry = 0;
  let processedGuestExpiry = 0;

  // ── Stage 1: Provider never quoted (pending_marina expired) ──
  const { data: providerExpired, error: err1 } = await supabase
    .from('bookings')
    .select('id, stripe_authorization_id, user_id, mooring_id, booking_type, provider_id')
    .in('booking_type', ['concierge', 'now4today'])
    .eq('concierge_status', 'pending_marina')
    .lt('concierge_expires_at', now);

  if (err1) {
    console.error('Failed to fetch provider-expired bookings:', err1.message);
  }

  for (const booking of (providerExpired || [])) {
    try {
      await cancelStripeHold(booking.stripe_authorization_id);

      await supabase
        .from('bookings')
        .update({
          concierge_status: 'expired',
          booking_status: 'cancelled',
          payment_status: 'pending',
        })
        .eq('id', booking.id);

      const emailType = booking.booking_type === 'now4today'
        ? 'quote_expired_provider'
        : 'quote_expired_provider';

      await sendEmail(emailType, {
        bookingId: booking.id,
        userId: booking.user_id,
        mooringId: booking.mooring_id,
      });

      processedProviderExpiry++;
    } catch (err) {
      console.error(`Failed to process provider-expired booking ${booking.id}:`, err);
    }
  }

  // ── Stage 2: Guest never responded to quote (price_quoted expired) ──
  const { data: guestExpired, error: err2 } = await supabase
    .from('bookings')
    .select('id, stripe_authorization_id, user_id, mooring_id, booking_type, provider_id, guest_name, guest_email')
    .in('booking_type', ['concierge', 'now4today'])
    .eq('concierge_status', 'price_quoted')
    .lt('guest_response_expires_at', now);

  if (err2) {
    console.error('Failed to fetch guest-expired bookings:', err2.message);
  }

  for (const booking of (guestExpired || [])) {
    try {
      await cancelStripeHold(booking.stripe_authorization_id);

      await supabase
        .from('bookings')
        .update({
          concierge_status: 'expired',
          booking_status: 'cancelled',
          payment_status: 'pending',
        })
        .eq('id', booking.id);

      // Notify guest
      await sendEmail('quote_expired_guest', {
        bookingId: booking.id,
        userId: booking.user_id,
        mooringId: booking.mooring_id,
      });

      // Notify provider
      if (booking.provider_id) {
        const { data: provider } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', booking.provider_id)
          .single();

        if (provider?.email) {
          await sendEmail('quote_expired_guest_provider', {
            bookingId: booking.id,
            providerEmail: provider.email,
            guestName: booking.guest_name,
            mooringId: booking.mooring_id,
          });
        }
      }

      processedGuestExpiry++;
    } catch (err) {
      console.error(`Failed to process guest-expired booking ${booking.id}:`, err);
    }
  }

  const total = processedProviderExpiry + processedGuestExpiry;
  console.log(`Processed ${total} expired bookings (provider: ${processedProviderExpiry}, guest: ${processedGuestExpiry})`);

  return new Response(
    JSON.stringify({
      processed: total,
      providerExpired: processedProviderExpiry,
      guestExpired: processedGuestExpiry,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
