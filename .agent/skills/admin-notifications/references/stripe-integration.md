# Stripe Integration for Admin Alerts

## Overview

The existing `stripe-webhook` and `stripe-connect-webhook` functions should call
`send-admin-notification` when critical payment events occur.

---

## Events That Should Alert Admin

| Stripe Event | alert_type | When |
|-------------|-----------|------|
| `payment_intent.payment_failed` | `stripe_alert` | Guest payment fails |
| `charge.dispute.created` | `stripe_alert` | Dispute/chargeback opened |
| `charge.refunded` | `stripe_alert` | Refund issued |
| `transfer.failed` | `stripe_alert` | Provider payout fails |
| `account.application.deauthorized` | `stripe_alert` | Provider disconnects Stripe |

---

## Code to Add to `stripe-webhook/index.ts`

Add this helper function at the top of the file:

```typescript
// Helper: notify admin of Stripe events
async function notifyAdminStripeAlert(
  stripeEvent: string,
  stripeEventId: string,
  amount?: number,
  customerEmail?: string
) {
  try {
    await fetch(
      "https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_type:      "stripe_alert",
          stripe_event:    stripeEvent,
          stripe_event_id: stripeEventId,
          stripe_amount:   amount,
          customer_email:  customerEmail,
        }),
      }
    );
  } catch (err) {
    console.error("Failed to notify admin:", err);
    // Don't throw — admin notification failure should not break webhook
  }
}
```

Then call it inside the relevant `switch` cases:

```typescript
switch (event.type) {
  case "payment_intent.payment_failed": {
    const pi = event.data.object as Stripe.PaymentIntent;
    await notifyAdminStripeAlert(
      "payment_failed",
      event.id,
      pi.amount / 100,
      pi.receipt_email || undefined
    );
    break;
  }

  case "charge.dispute.created": {
    const dispute = event.data.object as Stripe.Dispute;
    await notifyAdminStripeAlert(
      "dispute_opened",
      event.id,
      dispute.amount / 100
    );
    break;
  }

  case "charge.refunded": {
    const charge = event.data.object as Stripe.Charge;
    await notifyAdminStripeAlert(
      "refund_created",
      event.id,
      charge.amount_refunded / 100,
      charge.billing_details?.email || undefined
    );
    break;
  }
}
```

---

## Same pattern for `stripe-connect-webhook/index.ts`

```typescript
case "transfer.failed": {
  const transfer = event.data.object as Stripe.Transfer;
  await notifyAdminStripeAlert(
    "transfer_failed",
    event.id,
    transfer.amount / 100
  );
  break;
}
```

---

## Testing Stripe Alerts

Manually call the admin function to test:

```sql
SELECT net.http_post(
  url     := 'https://bblxawscmyzelinidkmb.supabase.co/functions/v1/send-admin-notification',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body    := '{
    "alert_type": "stripe_alert",
    "stripe_event": "payment_failed",
    "stripe_event_id": "evt_test_12345",
    "stripe_amount": 150,
    "customer_email": "hernausa96@gmail.com"
  }'::jsonb
);
```
