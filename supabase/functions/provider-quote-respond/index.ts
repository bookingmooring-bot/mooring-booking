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

const GUEST_RESPONSE_HOURS: Record<string, number> = {
  now4today: 1,
  concierge: 24,
};

// Dynamic CORS allowlist (returns booking + payment data). Server-to-server
// callers (n8n / service-role) do not send an Origin header and are unaffected.
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
    'Access-Control-Allow-Headers': 'authorization, x-api-key, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

function isApiKeyAuth(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key');
  const n8nKey = Deno.env.get('N8N_API_KEY');
  if (apiKey && n8nKey && apiKey === n8nKey) return true;

  const auth = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (auth === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) return true;

  return false;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, token, price, action } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'bookingId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, moorings(name, location, country, price_per_night, contact_email, contact_phone, vhf_channel)')
      .eq('id', bookingId)
      .in('booking_type', ['concierge', 'now4today'])
      .eq('concierge_status', 'pending_marina')
      .single();

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auth: either quote_token match (web form) or API key (n8n/service role)
    if (!isApiKeyAuth(req)) {
      if (!token || token !== booking.quote_token) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check provider window hasn't expired
    if (booking.concierge_expires_at && new Date(booking.concierge_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Response window has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Provider declines
    if (action === 'decline') {
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
          quote_responded_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      const emailType = booking.booking_type === 'now4today' ? 'now4today_declined' : 'concierge_declined';
      await sendEmail(emailType, booking, booking.moorings);

      return new Response(
        JSON.stringify({ status: 'declined', message: 'Booking declined, authorization released' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Provider submits a price quote
    const quotedPrice = Number(price);
    if (!quotedPrice || quotedPrice <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valid price required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const guestWindowHours = GUEST_RESPONSE_HOURS[booking.booking_type] || 24;
    const guestExpiresAt = new Date();
    guestExpiresAt.setHours(guestExpiresAt.getHours() + guestWindowHours);

    await supabase
      .from('bookings')
      .update({
        concierge_status: 'price_quoted',
        quoted_price: quotedPrice,
        quote_responded_at: new Date().toISOString(),
        guest_response_expires_at: guestExpiresAt.toISOString(),
      })
      .eq('id', bookingId);

    // Notify guest about the quote
    const appUrl = Deno.env.get('APP_URL') || 'https://mooring-booking.com';
    await sendEmail('quote_notification', booking, booking.moorings, {
      quotedPrice,
      acceptUrl: `${appUrl}/dashboard?action=accept-quote&bookingId=${bookingId}`,
      declineUrl: `${appUrl}/dashboard?action=decline-quote&bookingId=${bookingId}`,
      guestExpiresAt: guestExpiresAt.toISOString(),
      guestWindowHours,
    });

    // Push notification for Now4Today (urgent)
    if (booking.booking_type === 'now4today' && booking.user_id) {
      const { data: guestProfile } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .eq('id', booking.user_id)
        .single();

      if (guestProfile?.expo_push_token) {
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              expoPushToken: guestProfile.expo_push_token,
              title: 'Price Quote Received!',
              body: `${booking.moorings?.name} quoted €${quotedPrice}. You have ${guestWindowHours}h to respond.`,
              data: { bookingId, type: 'quote_notification' },
            }),
          });
        } catch (pushErr) {
          console.error('Failed to send push notification:', pushErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: 'price_quoted',
        quotedPrice,
        guestExpiresAt: guestExpiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Provider quote respond error:', err);
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
