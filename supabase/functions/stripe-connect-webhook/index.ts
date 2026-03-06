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

async function notifyAdminStripeAlert(
  stripeEvent: string,
  stripeEventId: string,
  amount?: number,
  customerEmail?: string
) {
  try {
    await fetch(
      'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
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
          console.log('Booking created from payment:', booking.id, 'confirmation:', booking.confirmation_code);
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
