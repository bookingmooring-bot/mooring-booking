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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function updateProfileTier(
  customerId: string,
  tier: 'basic' | 'premium-monthly' | 'premium-annual',
  expiresAt: string | null
) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !profile) {
    console.error('No profile found for Stripe customer:', customerId, error?.message);
    return;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_expires_at: expiresAt,
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Failed to update profile tier:', updateError.message);
  } else {
    console.log(`Updated profile ${profile.id} to tier: ${tier}, expires: ${expiresAt}`);
  }
}

function tierFromPriceId(priceId: string): 'premium-monthly' | 'premium-annual' {
  const annualPriceId = Deno.env.get('STRIPE_PRICE_PREMIUM_ANNUAL');
  if (priceId === annualPriceId) return 'premium-annual';
  return 'premium-monthly'; // default to monthly for any other paid price
}

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
    console.error('Failed to notify admin of Stripe event:', err);
    // Non-blocking: admin notification failure must not break webhook
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook signature failed: ${err}`, { status: 400 });
  }

  console.log('Processing webhook event:', event.type, event.id);

  try {
    switch (event.type) {
      // ── Subscription lifecycle ──────────────────────────────────────────────

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id ?? '';
        const tier = tierFromPriceId(priceId);
        const expiresAt =
          sub.status === 'active' || sub.status === 'trialing'
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null;
        await updateProfileTier(sub.customer as string, tier, expiresAt);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await updateProfileTier(sub.customer as string, 'basic', null);
        break;
      }

      // ── Payment failures ────────────────────────────────────────────────────

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          'Payment failed for customer:',
          invoice.customer,
          '— attempt:',
          invoice.attempt_count
        );
        await notifyAdminStripeAlert(
          'payment_failed',
          event.id,
          invoice.amount_due ? invoice.amount_due / 100 : undefined,
          invoice.customer_email || undefined
        );
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.warn('Dispute opened:', dispute.id, 'amount:', dispute.amount);
        await notifyAdminStripeAlert(
          'dispute_opened',
          event.id,
          dispute.amount ? dispute.amount / 100 : undefined
        );
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);
        await notifyAdminStripeAlert(
          'refund_created',
          event.id,
          charge.amount_refunded ? charge.amount_refunded / 100 : undefined,
          charge.billing_details?.email || undefined
        );
        break;
      }

      case 'checkout.session.completed': {
        // For subscriptions: subscription.created will also fire — handled above.
        // Log for tracing purposes.
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id, 'mode:', session.mode);
        break;
      }

      default:
        console.log('Unhandled event type (ignored):', event.type);
    }
  } catch (err) {
    console.error('Error processing webhook event:', event.type, err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
