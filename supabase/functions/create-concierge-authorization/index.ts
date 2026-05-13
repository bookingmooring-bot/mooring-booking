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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { mooringId, bookingData, serviceFeeAmount } = await req.json();

    // Fetch mooring to get contact details
    const { data: mooring, error: mooringError } = await supabase
      .from('moorings')
      .select('*')
      .eq('id', mooringId)
      .eq('mooring_layer', 'concierge')
      .single();

    if (mooringError || !mooring) {
      return new Response(
        JSON.stringify({ error: 'Mooring not found or not a concierge listing' }),
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
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

    // Create PaymentIntent with manual capture (authorization hold)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serviceFeeAmount * 100),
      currency: 'eur',
      customer: customerId,
      capture_method: 'manual',
      metadata: {
        mooring_id: mooringId,
        user_id: user.id,
        booking_type: 'concierge',
        mooring_name: mooring.name,
      },
      description: `Concierge Booking service fee — ${mooring.name}`,
    });

    // Insert booking with concierge status
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CONCIERGE_WINDOW_HOURS);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        mooring_id: mooringId,
        user_id: user.id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        boat_name: bookingData.boatName,
        boat_length: bookingData.boatLength,
        total_price: serviceFeeAmount,
        booking_status: 'pending',
        payment_status: 'pending',
        payment_method: 'card',
        booking_type: 'concierge',
        concierge_status: 'pending_marina',
        stripe_authorization_id: paymentIntent.id,
        concierge_expires_at: expiresAt.toISOString(),
        special_requests: bookingData.specialRequests || null,
      })
      .select()
      .single();

    if (bookingError) {
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw bookingError;
    }

    // Send request email to marina (if contact_email available)
    if (mooring.contact_email) {
      try {
        await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-emails`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              type: 'concierge_request',
              booking: booking,
              mooring: mooring,
              respondUrl: `${Deno.env.get('APP_URL')}/api/concierge-respond?bookingId=${booking.id}`,
            }),
          }
        );
      } catch (emailErr) {
        console.error('Failed to send concierge request email:', emailErr);
      }
    }

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
    console.error('Concierge authorization error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
