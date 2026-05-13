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

async function notifyAdminStripeAlert(
  stripeEvent: string,
  stripeEventId: string,
  amount?: number,
  customerEmail?: string
) {
  try {
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-admin-notification`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type:      'stripe_alert',
          stripe_event:    stripeEvent,
          stripe_event_id: stripeEventId,
          stripe_amount:   amount,
          customer_email:  customerEmail,
        }),
      }
    );
  } catch (err) {
    console.error('Failed to notify admin of Stripe Connect event:', err);
  }
}

Deno.serve(async (req: Request) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_CONNECT_WEBHOOK_SECRET')!
    );
  } catch (err) {
    console.error('Connect webhook signature failed:', err);
    return new Response(`Signature failed: ${err}`, { status: 400 });
  }

  console.log('Processing Connect event:', event.type, event.id);

  try {
    switch (event.type) {
      // ── Booking payment confirmed ──────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process one-time payment sessions (not subscription ones)
        if (session.mode !== 'payment') break;
        if (session.payment_status !== 'paid') break;

        const meta = session.metadata;
        if (!meta?.booking_data) {
          console.error('No booking_data in session metadata:', session.id);
          break;
        }

        let bookingData: Record<string, unknown>;
        try {
          bookingData = JSON.parse(meta.booking_data);
        } catch {
          console.error('Failed to parse booking_data JSON for session:', session.id);
          break;
        }

        // Server-side price validation: re-verify against mooring
        const mooringId = bookingData.mooring_id as string | undefined;
        if (mooringId) {
          const { data: mooring } = await supabase
            .from('moorings')
            .select('price')
            .eq('id', mooringId)
            .single();
          if (mooring) {
            const expectedTotal = Number(mooring.price) * Math.max(1, Number(bookingData.nights ?? 1));
            const clientTotal = Number(bookingData.total_price ?? 0);
            if (Math.abs(clientTotal - expectedTotal) > 1) {
              bookingData.total_price = expectedTotal;
              console.warn('Price mismatch corrected:', clientTotal, '->', expectedTotal, 'session:', session.id);
            }
          }
        }

        // Server-side commission recalculation based on provider tier
        const providerId = bookingData.provider_id as string | undefined;
        if (providerId) {
          const { data: providerProfile } = await supabase
            .from('profiles')
            .select('provider_tier, commission_rate')
            .eq('id', providerId)
            .single();

          const tier = providerProfile?.provider_tier ?? 'standard';
          const totalPrice = Number(bookingData.total_price ?? 0);
          const rate = providerProfile?.commission_rate
            ? Number(providerProfile.commission_rate)
            : (tier === 'white-label' ? 0.10 : 0.12);
          const txFee = tier === 'white-label' ? 5 : 0;

          bookingData.commission_amount = parseFloat((totalPrice * rate).toFixed(2));
          bookingData.transaction_fee = txFee;
        }

        // Insert the booking now that payment is confirmed
        const { data: booking, error: insertError } = await supabase
          .from('bookings')
          .insert({
            ...bookingData,
            payment_status: 'paid',
            payment_method: 'card',
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Failed to insert booking after payment:', insertError.message, 'session:', session.id);
        } else {
          console.log('Booking created from payment:', booking.id, 'confirmation:', booking.confirmation_code, 'tier:', providerId ? 'checked' : 'unknown');

          // WhatsApp notification (non-blocking, Sailor+ tier only)
          try {
            if (providerId) {
              const { data: provProfile } = await supabase
                .from('profiles')
                .select('subscription_tier, phone, full_name')
                .eq('id', providerId)
                .single();

              const sailorTiers = ['sailor', 'captain', 'charter-fleet'];
              if (provProfile && sailorTiers.includes(provProfile.subscription_tier ?? '')) {
                const whatsappUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp-notification`;
                fetch(whatsappUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  },
                  body: JSON.stringify({
                    booking_id: booking.id,
                    guest_phone: booking.guest_phone,
                    guest_name: booking.guest_name,
                    mooring_name: bookingData.mooring_name ?? 'Mooring',
                    check_in: booking.check_in,
                    check_out: booking.check_out,
                    total_price: booking.total_price,
                    confirmation_code: booking.confirmation_code,
                    owner_phone: provProfile.phone,
                    owner_name: provProfile.full_name,
                  }),
                }).catch((e) => console.error('WhatsApp notification fire-and-forget error:', e));
              }
            }
          } catch (waErr) {
            console.error('WhatsApp notification setup error (non-blocking):', waErr);
          }
        }
        break;
      }

      // ── Provider onboarding completed ──────────────────────────────────────
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;

        if (account.details_submitted && account.charges_enabled) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ stripe_onboarding_complete: true })
            .eq('stripe_account_id', account.id);

          if (updateError) {
            console.error('Failed to mark onboarding complete for account:', account.id, updateError.message);
          } else {
            console.log('Provider onboarding complete for account:', account.id);
          }
        }
        break;
      }

      // ── Payment failure ────────────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn('Booking payment failed:', pi.id, '— reason:', pi.last_payment_error?.message);
        await notifyAdminStripeAlert(
          'payment_failed',
          event.id,
          pi.amount ? pi.amount / 100 : undefined,
          pi.receipt_email || undefined
        );
        break;
      }

      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer;
        console.warn('Transfer to provider failed:', transfer.id);
        await notifyAdminStripeAlert(
          'transfer_failed',
          event.id,
          transfer.amount ? transfer.amount / 100 : undefined
        );
        break;
      }

      default:
        console.log('Unhandled Connect event (ignored):', event.type);
    }
  } catch (err) {
    console.error('Error handling Connect event:', event.type, err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
