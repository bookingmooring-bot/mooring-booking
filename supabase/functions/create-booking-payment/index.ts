// @ts-nocheck
import Stripe from 'https://esm.sh/stripe@13?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Authenticate guest user
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      mooringId,
      bookingData,
      successPath = '/dashboard',
      cancelPath = '/explore',
    } = await req.json();

    if (!mooringId || !bookingData) {
      return new Response(JSON.stringify({ error: 'mooringId and bookingData are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';

    // Get mooring info to find provider
    const { data: mooring, error: mooringError } = await supabase
      .from('moorings')
      .select('provider_id, name, location')
      .eq('id', mooringId)
      .single();

    if (mooringError || !mooring) {
      return new Response(JSON.stringify({ error: 'Mooring not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get provider's Stripe Connect status
    const { data: providerProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', mooring.provider_id)
      .single();

    // If provider not connected → fallback: save booking as manual/cash
    if (!providerProfile?.stripe_account_id || !providerProfile?.stripe_onboarding_complete) {
      console.log('Provider not connected to Stripe, saving as manual booking');
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          user_id: user.id,
          payment_method: 'cash',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) {
        return new Response(JSON.stringify({ error: bookingError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        booking,
        fallback: true,
        warning: 'Provider not connected to Stripe. Booking saved as manual payment.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create Stripe customer for the guest
    const { data: guestProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single();

    let customerId = guestProfile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: guestProfile?.email ?? user.email ?? undefined,
        name: guestProfile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Amount in cents
    const totalCents = Math.round((bookingData.total_price ?? 0) * 100);
    // Platform keeps 15% as application fee
    const applicationFeeCents = Math.round(totalCents * 0.15);

    // Serialize booking data to store in metadata so webhook can recreate it
    const bookingMetadata = JSON.stringify({
      ...bookingData,
      mooring_id: mooringId,
      user_id: user.id,
    });

    // Create Stripe Checkout Session with destination charge (Connect)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Booking: ${mooring.name}`,
              description: `${bookingData.nights} night(s) · ${bookingData.check_in} → ${bookingData.check_out} · ${mooring.location}`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // 15% stays on platform, 85% auto-transferred to provider
        application_fee_amount: applicationFeeCents,
        transfer_data: {
          destination: providerProfile.stripe_account_id,
        },
        metadata: {
          mooring_id: mooringId,
          user_id: user.id,
          provider_id: mooring.provider_id,
        },
      },
      success_url: `${appUrl}${successPath}?payment_success=1`,
      cancel_url: `${appUrl}${cancelPath}`,
      metadata: {
        // Store full booking data so webhook can insert it to DB
        booking_data: bookingMetadata,
      },
    });

    console.log('Created booking payment session:', session.id, 'amount:', totalCents, 'fee:', applicationFeeCents);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-booking-payment error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
