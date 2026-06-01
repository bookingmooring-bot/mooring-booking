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

const CONCIERGE_WINDOW_HOURS = 48;
const N8N_WEBHOOK_URL = Deno.env.get('N8N_CONCIERGE_WEBHOOK_URL')
  || 'https://integentmatrix.app.n8n.cloud/webhook/concierge-authorized';

// Dynamic CORS allowlist. Server-to-server callers (MCP / N8N) do not send an
// Origin header and are unaffected by CORS.
const ALLOWED_ORIGINS = new Set([
  'https://mooring-booking.com', 'https://www.mooring-booking.com',
  'https://mooringbooking.com', 'https://www.mooringbooking.com',
  'https://ai-captain.app', 'https://www.ai-captain.app',
  'http://localhost:8080', 'http://localhost:5173',
]);
function isAllowedOrigin(origin: string): boolean {
  // Allow any localhost/127.0.0.1 port for local dev (Vite hops ports when busy).
  const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return ALLOWED_ORIGINS.has(origin) || isLocalhost;
}
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = isAllowedOrigin(origin) ? origin : 'https://www.mooring-booking.com';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

// Base URL the GUEST is redirected back to. Use the request Origin in local dev
// so localhost returns to localhost (not the production APP_URL).
function getRedirectBase(req: Request): string {
  const origin = req.headers.get('origin') ?? '';
  if (isAllowedOrigin(origin)) return origin;
  return Deno.env.get('APP_URL') || 'https://mooring-booking.com';
}

// Notify the marina that an authorized concierge request is waiting. Primary path
// is the n8n webhook (which sends the email + drives reminders); if it is
// unreachable we fall back to calling send-booking-emails directly so the marina
// email is never lost.
async function notifyMarina(booking: Record<string, unknown>, mooring: Record<string, unknown>, quoteToken: string) {
  const appUrl = Deno.env.get('APP_URL') || 'https://mooring-booking.com';
  const respondUrl = `${appUrl}/quote-respond?bookingId=${booking.id}&token=${quoteToken}`;
  const payload = { type: 'concierge_request', booking, mooring, respondUrl };

  try {
    const r = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (r.ok) return;
    console.error('n8n webhook returned non-2xx:', r.status);
  } catch (err) {
    console.error('n8n webhook failed:', err);
  }

  // Fallback: send the marina email directly via Resend.
  if (mooring?.contact_email) {
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (emailErr) {
      console.error('Fallback send-booking-emails failed:', emailErr);
    }
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const body = await req.json();

    let userId: string;
    if (token === serviceRoleKey) {
      // Service role call (from MCP server / N8N) — trust userId from body
      if (!body.userId) return json({ error: 'userId required for service role calls' }, 400);
      userId = body.userId;
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return json({ error: 'Unauthorized' }, 401);
      userId = user.id;
    }

    const action = body.action ?? 'create';

    // ─── FINALIZE: called on return from Stripe Checkout ──────────────────────
    if (action === 'finalize') {
      const { sessionId } = body;
      if (!sessionId) return json({ error: 'sessionId required' }, 400);

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const bookingId = session.metadata?.booking_id;
      if (!bookingId) return json({ error: 'Invalid session (no booking_id)' }, 400);

      const { data: booking, error: bErr } = await supabase
        .from('bookings')
        .select('*, moorings(*)')
        .eq('id', bookingId)
        .single();
      if (bErr || !booking) return json({ error: 'Booking not found' }, 404);
      if (booking.user_id !== userId) return json({ error: 'Forbidden' }, 403);

      // Idempotent — already finalized
      if (booking.stripe_authorization_id) {
        return json({ ok: true, bookingId, expiresAt: booking.concierge_expires_at });
      }

      const piId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
      if (!piId) return json({ error: 'Payment not completed' }, 400);

      const pi = await stripe.paymentIntents.retrieve(piId);
      if (pi.status !== 'requires_capture') {
        return json({ error: `Payment not authorized (status: ${pi.status})` }, 400);
      }

      await supabase
        .from('bookings')
        .update({ stripe_authorization_id: piId })
        .eq('id', bookingId);

      await notifyMarina(booking, booking.moorings, booking.quote_token);

      return json({ ok: true, bookingId, expiresAt: booking.concierge_expires_at });
    }

    // ─── CREATE (default): make booking + Stripe Checkout authorization ───────
    const { mooringId, bookingData, serviceFeeAmount } = body;

    const { data: mooring, error: mooringError } = await supabase
      .from('moorings')
      .select('*')
      .eq('id', mooringId)
      .eq('mooring_layer', 'concierge')
      .single();
    if (mooringError || !mooring) {
      return json({ error: 'Mooring not found or not a concierge listing' }, 404);
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CONCIERGE_WINDOW_HOURS);
    const quoteToken = crypto.randomUUID();

    // nights / price_per_night are NOT NULL on bookings — derive (informational;
    // the marina is paid on arrival).
    const nights = Math.max(
      1,
      Math.round(
        (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime())
          / (1000 * 60 * 60 * 24)
      )
    );

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        mooring_id: mooringId,
        user_id: userId,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        boat_name: bookingData.boatName,
        boat_length: bookingData.boatLength,
        nights,
        price_per_night: mooring.price_per_night,
        total_price: serviceFeeAmount ?? 0,
        booking_status: 'pending',
        payment_status: 'pending',
        payment_method: 'card',
        booking_type: 'concierge',
        concierge_status: 'pending_marina',
        concierge_expires_at: expiresAt.toISOString(),
        quote_token: quoteToken,
        special_requests: bookingData.specialRequests || null,
      })
      .select('*, moorings(*)')
      .single();
    if (bookingError) throw bookingError;

    const feeCents = Math.round((serviceFeeAmount ?? 0) * 100);

    // Free tier (no concierge fee) → nothing to authorize; notify marina now.
    if (feeCents <= 0) {
      await notifyMarina(booking, booking.moorings ?? mooring, quoteToken);
      return json({ skipPayment: true, bookingId: booking.id, expiresAt: expiresAt.toISOString() });
    }

    // Hosted Checkout with a manual-capture authorization hold for the fee.
    const base = getRedirectBase(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Concierge fee — ${mooring.name}`,
              description: 'Authorization hold — charged only if the marina confirms your booking.',
            },
            unit_amount: feeCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: 'manual',
        description: `Concierge Booking service fee — ${mooring.name}`,
        metadata: { booking_id: booking.id, type: 'concierge', mooring_id: mooringId, user_id: userId },
      },
      metadata: { booking_id: booking.id, type: 'concierge' },
      success_url: `${base}/booking/concierge-sent?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/explore`,
    });

    await supabase
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', booking.id);

    return json({ url: session.url, bookingId: booking.id, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    console.error('Concierge authorization error:', err);
    // Postgres/PostgREST errors are plain objects — String(err) would yield
    // "[object Object]". Pull out the readable fields instead.
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    const message = e?.message ?? (typeof err === 'string' ? err : JSON.stringify(err));
    return json({ error: message, code: e?.code, details: e?.details, hint: e?.hint }, 500);
  }
});
