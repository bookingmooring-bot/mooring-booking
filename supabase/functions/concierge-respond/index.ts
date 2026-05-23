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
    const { bookingId, action } = await req.json();

    if (!bookingId || !['confirm', 'decline'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'bookingId and action (confirm/decline) required' }),
        { status: 400 }
      );
    }

    // Fetch the concierge booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, moorings(*)')
      .eq('id', bookingId)
      .in('booking_type', ['concierge', 'now4today'])
      .eq('concierge_status', 'pending_marina')
      .single();

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found or already processed' }),
        { status: 404 }
      );
    }

    if (action === 'confirm') {
      // Capture the Stripe authorization
      await stripe.paymentIntents.capture(booking.stripe_authorization_id);

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          concierge_status: 'confirmed',
          booking_status: 'confirmed',
          payment_status: 'completed',
        })
        .eq('id', bookingId);

      // Notify user with marina contact details
      const confirmEmailType = booking.booking_type === 'now4today' ? 'now4today_confirmed' : 'concierge_confirmed';
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
              type: confirmEmailType,
              booking: booking,
              mooring: booking.moorings,
            }),
          }
        );
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }

      return new Response(
        JSON.stringify({ status: 'confirmed', message: 'Booking confirmed, payment captured' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'decline') {
      // Cancel the Stripe authorization — no charge
      await stripe.paymentIntents.cancel(booking.stripe_authorization_id);

      await supabase
        .from('bookings')
        .update({
          concierge_status: 'declined',
          booking_status: 'cancelled',
          payment_status: 'pending',
        })
        .eq('id', bookingId);

      // Notify user
      const declineEmailType = booking.booking_type === 'now4today' ? 'now4today_declined' : 'concierge_declined';
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
              type: declineEmailType,
              booking: booking,
              mooring: booking.moorings,
            }),
          }
        );
      } catch (emailErr) {
        console.error('Failed to send decline email:', emailErr);
      }

      return new Response(
        JSON.stringify({ status: 'declined', message: 'Booking declined, authorization released' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('Concierge respond error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
