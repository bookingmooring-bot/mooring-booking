// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@13?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // ── 1. Authenticate the calling user ────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    console.error('Auth error:', authError?.message);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // ── 2. Parse request body ────────────────────────────────────────────────────
  let body: {
    mooringId: string;
    bookingData: Record<string, unknown>;
    successPath?: string;
    cancelPath?: string;
  };

  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const {
    mooringId,
    bookingData,
    successPath = '/dashboard',
    cancelPath = '/explore',
  } = body;

  if (!mooringId || !bookingData) {
    return new Response(JSON.stringify({ error: 'Missing mooringId or bookingData' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';

  console.log('Processing booking payment for mooring:', mooringId, 'user:', user.id);

  // ── 3. Fetch mooring & owner profile ────────────────────────────────────────
  const { data: mooring, error: mooringError } = await supabase
    .from('moorings')
    .select('id, name, owner_id')
    .eq('id', mooringId)
    .single();

  if (mooringError || !mooring) {
    console.error('Mooring not found:', mooringError?.message);
    return new Response(JSON.stringify({ error: 'Mooring not found' }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const { data: providerProfile } = await supabase
    .from('profiles')
    .select('id, stripe_account_id, stripe_onboarding_complete')
    .eq('id', mooring.owner_id)
    .single();

  // ── 4. Check if provider has connected Stripe ────────────────────────────────
  const providerHasStripe =
    providerProfile?.stripe_account_id &&
    providerProfile?.stripe_onboarding_complete === true;

  console.log('Provider Stripe status:', {
    hasAccount: !!providerProfile?.stripe_account_id,
    onboardingComplete: providerProfile?.stripe_onboarding_complete,
    willUseStripe: providerHasStripe,
  });

  // ── 5a. FALLBACK: Provider not on Stripe — create booking as manual/cash ─────
  if (!providerHasStripe) {
    console.log('Provider not connected to Stripe — creating manual booking');

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id,
        provider_id: mooring.owner_id,
        mooring_id: mooringId,
        payment_method: 'cash',
        payment_status: 'pending',
        booking_status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Failed to create manual booking:', bookingError.message);
      return new Response(JSON.stringify({ error: bookingError.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    console.log('Manual booking created:', booking.id);
    return new Response(
      JSON.stringify({
        booking,
        fallback: true,
        warning: 'Provider not yet connected to Stripe — booking saved, payment manual.',
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  // ── 5b. STRIPE PATH: Create Checkout Session with Connect ────────────────────
  // Get or create guest's Stripe customer
  const { data: guestProfile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = guestProfile?.stripe_customer_id;

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
      console.log('Created new Stripe customer:', customerId);
    } catch (stripeErr) {
      console.error('Failed to create Stripe customer:', stripeErr);
      // Continue without a customer ID — Checkout still works
    }
  }

  // Amount in cents
  const totalPrice = Number(bookingData.total_price) || 0;
  const totalCents = Math.round(totalPrice * 100);
  const applicationFeeCents = Math.round(totalCents * 0.15); // 15% platform fee
  const nights = Number(bookingData.nights) || 1;
  const checkIn = String(bookingData.check_in ?? '');
  const checkOut = String(bookingData.check_out ?? '');

  console.log('Creating Stripe Checkout Session:', {
    totalCents,
    applicationFeeCents,
    nights,
    connectedAccount: providerProfile.stripe_account_id,
  });

  // Serialize the entire bookingData into metadata for the webhook to create the booking
  // Stripe metadata values must be strings, limit is 500 chars per value / 50 keys
  const bookingDataJson = JSON.stringify({
    ...bookingData,
    user_id: user.id,
    provider_id: mooring.owner_id,
    mooring_id: mooringId,
  });

  let session: Stripe.Checkout.Session;
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Mooring: ${mooring.name}`,
              description: `${nights} night(s) · ${checkIn} → ${checkOut}`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeCents,
        transfer_data: {
          destination: providerProfile.stripe_account_id,
        },
        metadata: {
          mooring_id: mooringId,
          supabase_user_id: user.id,
          provider_id: mooring.owner_id,
        },
      },
      success_url: `${appUrl}${successPath}?payment_success=1`,
      cancel_url: `${appUrl}${cancelPath}`,
      metadata: {
        booking_data: bookingDataJson,
        mooring_id: mooringId,
      },
    };

    // Attach customer only if we have one
    if (customerId) {
      sessionParams.customer = customerId;
    }

    session = await stripe.checkout.sessions.create(sessionParams);
  } catch (stripeErr) {
    console.error('Stripe Checkout Session creation failed:', stripeErr);
    return new Response(
      JSON.stringify({ error: `Stripe error: ${stripeErr.message}` }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  console.log('Stripe Checkout Session created:', session.id);

  return new Response(
    JSON.stringify({ url: session.url, sessionId: session.id }),
    { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  );
});
