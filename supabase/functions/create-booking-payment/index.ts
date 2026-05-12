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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { mooringId, bookingData, successPath, cancelPath } = await req.json();

    if (!mooringId || !bookingData) {
      return new Response(JSON.stringify({ error: 'Missing mooringId or bookingData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch mooring + owner
    const { data: mooring, error: mooringError } = await supabase
      .from('moorings')
      .select('id, name, owner_id, price')
      .eq('id', mooringId)
      .single();

    if (mooringError || !mooring) {
      return new Response(JSON.stringify({ error: 'Mooring not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get provider profile (Stripe Connect ID + tier)
    const { data: provider } = await supabase
      .from('profiles')
      .select('id, stripe_account_id, stripe_onboarding_complete, provider_tier, commission_rate')
      .eq('id', mooring.owner_id)
      .single();

    const hasStripe = provider?.stripe_account_id && provider?.stripe_onboarding_complete;

    // If provider has NOT connected Stripe → fallback to cash booking
    if (!hasStripe) {
      const confirmation_code = 'MB-' + Date.now().toString(36).toUpperCase();
      const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          user_id: user.id,
          provider_id: mooring.owner_id,
          mooring_id: mooringId,
          payment_method: 'cash',
          payment_status: 'pending',
          booking_status: 'confirmed',
          booking_type: 'instant',
          confirmation_code,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create fallback booking: ${insertError.message}`);
      }

      return new Response(
        JSON.stringify({
          booking,
          fallback: true,
          warning: 'Provider has not connected Stripe. Booking saved as cash payment.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Provider HAS Stripe → create Checkout Session with Connect split
    const appUrl = Deno.env.get('APP_URL') || 'https://mooring-booking.com';
    const totalPrice = Number(bookingData.total_price ?? 0);
    const tier = provider.provider_tier ?? 'standard';
    const rate = provider.commission_rate
      ? Number(provider.commission_rate)
      : (tier === 'white-label' ? 0.10 : 0.12);
    const txFee = tier === 'white-label' ? 5 : 0;
    const commissionAmount = parseFloat((totalPrice * rate).toFixed(2));
    const platformFee = Math.round((commissionAmount + txFee) * 100);

    // Get or create Stripe customer for the guest
    const { data: guestProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single();

    let customerId = guestProfile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: guestProfile?.full_name || bookingData.guest_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Store full booking data in metadata for the webhook to insert
    const bookingPayload = {
      ...bookingData,
      user_id: user.id,
      provider_id: mooring.owner_id,
      mooring_id: mooringId,
      booking_status: 'confirmed',
      booking_type: 'instant',
      confirmation_code: 'MB-' + Date.now().toString(36).toUpperCase(),
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Mooring: ${mooring.name}`,
              description: `${bookingData.nights || 1} night(s) — ${bookingData.check_in} to ${bookingData.check_out}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: provider.stripe_account_id,
        },
      },
      metadata: {
        booking_data: JSON.stringify(bookingPayload),
        mooring_id: mooringId,
        user_id: user.id,
      },
      success_url: `${appUrl}${successPath || '/dashboard'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${cancelPath || '/explore'}`,
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('create-booking-payment error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
