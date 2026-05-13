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

const allowedOrigin = Deno.env.get('APP_URL') || 'https://mooring-booking.com';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
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

    const { priceId, successPath, cancelPath } = await req.json();

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Missing priceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate priceId against known Stripe prices
    const validPrices = [
      Deno.env.get('STRIPE_PRICE_SAILOR_MONTHLY'),
      Deno.env.get('STRIPE_PRICE_SAILOR_ANNUAL'),
      Deno.env.get('STRIPE_PRICE_CAPTAIN_MONTHLY'),
      Deno.env.get('STRIPE_PRICE_CAPTAIN_ANNUAL'),
      Deno.env.get('STRIPE_PRICE_CHARTER_FLEET_MONTHLY'),
      Deno.env.get('STRIPE_PRICE_CHARTER_FLEET_ANNUAL'),
      Deno.env.get('STRIPE_PRICE_AI_ONLY_MONTHLY'),
      Deno.env.get('STRIPE_PRICE_AI_ONLY_ANNUAL'),
      Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY'),
      Deno.env.get('STRIPE_PRICE_PREMIUM_ANNUAL'),
      Deno.env.get('STRIPE_PRICE_WL_UP_TO_50'),
      Deno.env.get('STRIPE_PRICE_WL_OVER_50'),
    ].filter(Boolean);

    if (!validPrices.includes(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid price ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://mooring-booking.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        supabase_user_id: user.id,
      },
      success_url: `${appUrl}${successPath || '/dashboard'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${cancelPath || '/user-pricing'}`,
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
