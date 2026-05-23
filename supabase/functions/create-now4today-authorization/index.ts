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

const NOW4TODAY_WINDOW_HOURS = 3;
const allowedOrigin = Deno.env.get('APP_URL') || 'https://mooring-booking.com';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    let userId: string;

    const body = await req.json();

    if (token === serviceRoleKey) {
      if (!body.userId) {
        return new Response(JSON.stringify({ error: 'userId required for service role calls' }), { status: 400 });
      }
      userId = body.userId;
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      userId = user.id;
    }

    const { mooringId, bookingData, totalAmount } = body;

    // Fetch mooring (premium layer — no mooring_layer filter)
    const { data: mooring, error: mooringError } = await supabase
      .from('moorings')
      .select('*')
      .eq('id', mooringId)
      .single();

    if (mooringError || !mooring) {
      return new Response(
        JSON.stringify({ error: 'Mooring not found' }),
        { status: 404 }
      );
    }

    // Fetch provider profile
    const { data: provider } = await supabase
      .from('profiles')
      .select('id, email, full_name, stripe_account_id, stripe_onboarding_complete, provider_tier, commission_rate, expo_push_token')
      .eq('id', mooring.owner_id)
      .single();

    const hasStripe = provider?.stripe_account_id && provider?.stripe_onboarding_complete;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + NOW4TODAY_WINDOW_HOURS);

    const confirmationCode = 'MB-' + Date.now().toString(36).toUpperCase();
    const quoteToken = crypto.randomUUID();

    if (!hasStripe) {
      // Cash fallback — no Stripe hold, but still requires provider confirmation
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          mooring_id: mooringId,
          user_id: userId,
          provider_id: mooring.owner_id,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guest_name: bookingData.guestName,
          guest_email: bookingData.guestEmail,
          guest_phone: bookingData.guestPhone,
          boat_name: bookingData.boatName,
          boat_length: bookingData.boatLength,
          nights: bookingData.nights,
          price_per_night: bookingData.pricePerNight,
          total_price: totalAmount,
          commission_amount: bookingData.commissionAmount,
          transaction_fee: bookingData.transactionFee,
          service_fee: bookingData.serviceFee,
          booking_status: 'pending',
          payment_status: 'pending',
          payment_method: 'cash',
          booking_type: 'now4today',
          concierge_status: 'pending_marina',
          concierge_expires_at: expiresAt.toISOString(),
          is_now4today: true,
          confirmation_code: confirmationCode,
          quote_token: quoteToken,
          special_requests: bookingData.specialRequests || null,
          referral_code: bookingData.referralCode || null,
          affiliate_commission: bookingData.affiliateCommission || null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      await sendProviderNotifications(booking, mooring, provider, quoteToken);

      return new Response(
        JSON.stringify({
          bookingId: booking.id,
          expiresAt: expiresAt.toISOString(),
          cashFallback: true,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Provider HAS Stripe — create authorization hold for full amount
    const { data: guestProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', userId)
      .single();

    let customerId = guestProfile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: guestProfile?.email,
        name: guestProfile?.full_name || undefined,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Commission calculation
    const tier = provider.provider_tier ?? 'standard';
    const rate = provider.commission_rate
      ? Number(provider.commission_rate)
      : (tier === 'white-label' ? 0.10 : 0.12);
    const txFee = tier === 'white-label' ? 5 : 0;
    const commissionAmount = parseFloat((totalAmount * rate).toFixed(2));
    const platformFee = Math.round((commissionAmount + txFee) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'eur',
      customer: customerId,
      capture_method: 'manual',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: provider.stripe_account_id,
      },
      metadata: {
        mooring_id: mooringId,
        user_id: userId,
        booking_type: 'now4today',
        mooring_name: mooring.name,
      },
      description: `Now4Today Booking — ${mooring.name}`,
    });

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        mooring_id: mooringId,
        user_id: userId,
        provider_id: mooring.owner_id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        boat_name: bookingData.boatName,
        boat_length: bookingData.boatLength,
        nights: bookingData.nights,
        price_per_night: bookingData.pricePerNight,
        total_price: totalAmount,
        commission_amount: commissionAmount,
        transaction_fee: txFee,
        service_fee: bookingData.serviceFee,
        booking_status: 'pending',
        payment_status: 'pending',
        payment_method: 'card',
        booking_type: 'now4today',
        concierge_status: 'pending_marina',
        stripe_authorization_id: paymentIntent.id,
        concierge_expires_at: expiresAt.toISOString(),
        is_now4today: true,
        confirmation_code: confirmationCode,
        quote_token: quoteToken,
        special_requests: bookingData.specialRequests || null,
        referral_code: bookingData.referralCode || null,
        affiliate_commission: bookingData.affiliateCommission || null,
      })
      .select()
      .single();

    if (bookingError) {
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw bookingError;
    }

    await sendProviderNotifications(booking, mooring, provider, quoteToken);

    return new Response(
      JSON.stringify({
        bookingId: booking.id,
        authorizationId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        expiresAt: expiresAt.toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Now4Today authorization error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function sendProviderNotifications(booking: any, mooring: any, provider: any, quoteToken: string) {
  const baseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const appUrl = Deno.env.get('APP_URL') || 'https://mooring-booking.com';

  // Send urgent email with quote form link
  try {
    await fetch(`${baseUrl}/functions/v1/send-booking-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        type: 'now4today_request',
        booking,
        mooring,
        providerEmail: provider?.email,
        respondUrl: `${appUrl}/quote-respond?bookingId=${booking.id}&token=${quoteToken}`,
      }),
    });
  } catch (emailErr) {
    console.error('Failed to send Now4Today request email:', emailErr);
  }

  // Send push notification if provider has Expo token
  if (provider?.expo_push_token) {
    try {
      await fetch(`${baseUrl}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          expoPushToken: provider.expo_push_token,
          title: 'URGENT: Same-Day Booking Request',
          body: `${booking.guest_name} needs a berth at ${mooring.name} today. Submit your price quote within 3 hours.`,
          data: { bookingId: booking.id, type: 'now4today_request' },
        }),
      });
    } catch (pushErr) {
      console.error('Failed to send Now4Today push notification:', pushErr);
    }
  }
}
