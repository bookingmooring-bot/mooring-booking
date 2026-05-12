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

    // Get provider profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, stripe_account_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile.role !== 'provider' && profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Only providers can connect Stripe' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://mooring-booking.com';
    let accountId = profile.stripe_account_id;

    // Create a new Express account if one doesn't exist yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email || profile.email,
        metadata: { supabase_user_id: user.id },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          mcc: '4468', // Marinas
          product_description: 'Mooring berth bookings via Mooring Booking platform',
        },
      });
      accountId = account.id;

      await supabase
        .from('profiles')
        .update({
          stripe_account_id: accountId,
          stripe_onboarding_complete: false,
        })
        .eq('id', user.id);
    }

    // Create an Account Link for onboarding (or re-onboarding)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard?stripe=refresh`,
      return_url: `${appUrl}/dashboard?stripe=complete`,
      type: 'account_onboarding',
    });

    return new Response(
      JSON.stringify({ url: accountLink.url, accountId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('create-connect-account error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
