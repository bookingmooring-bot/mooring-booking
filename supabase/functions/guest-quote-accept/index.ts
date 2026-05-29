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

// Dynamic CORS allowlist (returns booking + marina contact details). Server-to-server
// callers do not send an Origin header and are unaffected by CORS.
const ALLOWED_ORIGINS = new Set([
  'https://mooring-booking.com', 'https://www.mooring-booking.com',
  'https://mooringbooking.com', 'https://www.mooringbooking.com',
  'https://ai-captain.app', 'https://www.ai-captain.app',
  'http://localhost:8080', 'http://localhost:5173',
]);
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.mooring-booking.com';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const body = await req.json();
    const { bookingId, action } = body;

    if (!bookingId || !['accept', 'decline'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'bookingId and action (accept/decline) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch booking with quote
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, moorings(name, location, country, contact_email, contact_phone, vhf_channel, image_urls)')
      .eq('id', bookingId)
      .in('booking_type', ['concierge', 'now4today'])
      .eq('concierge_status', 'price_quoted')
      .single();

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found or not in quoted state' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auth: JWT user matches booking owner, or service role
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const token = authHeader?.replace('Bearer ', '');

    if (token !== serviceRoleKey) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token || '');
      if (authError || !user || user.id !== booking.user_id) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check guest response window
    if (booking.guest_response_expires_at && new Date(booking.guest_response_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Response window has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    if (action === 'accept') {
      // Capture Stripe payment at quoted price
      if (booking.stripe_authorization_id) {
        const captureAmount = Math.round(booking.quoted_price * 100);
        await stripe.paymentIntents.capture(booking.stripe_authorization_id, {
          amount_to_capture: captureAmount,
        });
      }

      await supabase
        .from('bookings')
        .update({
          concierge_status: 'confirmed',
          booking_status: 'confirmed',
          payment_status: booking.stripe_authorization_id ? 'completed' : 'pending',
          total_price: booking.quoted_price,
          guest_responded_at: now,
        })
        .eq('id', bookingId);

      // Send confirmation to guest (with provider details)
      await sendEmail('quote_accepted_guest', booking, booking.moorings);

      // Send confirmation to provider (with FULL guest details — first time they see email/phone)
      if (booking.provider_id) {
        const { data: provider } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', booking.provider_id)
          .single();

        if (provider?.email) {
          await sendEmail('quote_accepted_provider', booking, booking.moorings, {
            providerEmail: provider.email,
          });
        }
      }

      return new Response(
        JSON.stringify({
          status: 'confirmed',
          message: 'Booking confirmed, payment captured',
          totalPrice: booking.quoted_price,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'decline') {
      // Cancel Stripe authorization
      if (booking.stripe_authorization_id) {
        try {
          await stripe.paymentIntents.cancel(booking.stripe_authorization_id);
        } catch (stripeErr) {
          console.warn('Stripe cancel failed:', stripeErr);
        }
      }

      await supabase
        .from('bookings')
        .update({
          concierge_status: 'declined',
          booking_status: 'cancelled',
          payment_status: 'pending',
          guest_responded_at: now,
        })
        .eq('id', bookingId);

      // Notify guest
      await sendEmail('quote_declined_guest', booking, booking.moorings);

      // Notify provider that guest declined
      if (booking.provider_id) {
        const { data: provider } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', booking.provider_id)
          .single();

        if (provider?.email) {
          await sendEmail('quote_declined_by_guest', booking, booking.moorings, {
            providerEmail: provider.email,
          });
        }
      }

      return new Response(
        JSON.stringify({ status: 'declined', message: 'Quote declined, authorization released' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('Guest quote accept error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendEmail(type: string, booking: any, mooring: any, extra?: Record<string, unknown>) {
  try {
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ type, booking, mooring, ...extra }),
    });
  } catch (emailErr) {
    console.error(`Failed to send ${type} email:`, emailErr);
  }
}
