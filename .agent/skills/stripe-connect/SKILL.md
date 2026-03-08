---
name: stripe-connect
description: >
  Implements Stripe Connect for the Mooring Booking app — the payment splitting system that
  routes booking money automatically: 85% to the mooring provider, 15% to the platform.
  Use this skill whenever the user wants to:
  — Charge guests for bookings via Stripe and automatically split funds between platform and provider
  — Onboard mooring providers as Stripe Connect Express/Standard accounts
  — Build the Supabase Edge Function `create-booking-payment` that creates Payment Intents with automatic fund splitting
  — Build the Supabase Edge Function `stripe-connect-webhook` that handles Connect events
  — Add a "Connect Stripe" or "Setup Payouts" flow to the Provider Dashboard
  — Store `stripe_account_id` on provider profiles so Stripe knows where to send the 85%
  — Track Stripe payment IDs on bookings for reconciliation
  — Show providers their payout status in the Dashboard
  — Handle Stripe transfer failures (provider not yet onboarded, restricted accounts, etc.)
  — Add a "Pay Now" button to BookingModal that opens Stripe Checkout for the full booking amount
  — Replace cash/manual payment flow with real card payments
  — Allow admin to see which bookings have been paid via Stripe vs. cash
  Trigger on: "stripe connect", "split plaćanja", "booking plaćanje", "naplati booking",
  "provajder plaćanje", "payout provajderu", "naplata veza", "charging for booking",
  "podijeli pare", "automatska isplata", "stripe express", "onboarding provajdera",
  "platiti vez", "booking payment", "pay mooring", "napravi booking checkout",
  "stripe connect onboarding", "poveži stripe", "connect account", "transfer provajderu",
  "split commission", "platform fee stripe", "application fee", "stripe booking split",
  "isplata iz bookinga", "payout from booking", "pay booking amount", "book and pay",
  "card payment booking", "kreditna kartica booking", "plati kartom vez".
  ALWAYS use this skill when the user wants card payments for mooring bookings with automatic
  fund splitting — even if they describe it as "podijeli pare" or "isplati provajdera automatically".
---

# Stripe Connect Skill — Booking Payment Splitting

This skill implements **Stripe Connect** to handle real card payments for mooring bookings, with automatic splitting: the guest pays the full booking amount, Stripe deducts the platform fee (15%), and pays the remaining 85% directly to the mooring provider's Stripe account.

Two sub-flows:
1. **Provider onboarding** — provider connects their bank account via Stripe Express onboarding
2. **Booking payment** — guest pays via Stripe; funds split automatically at charge time

---

## App Architecture Context

- **Stack**: React 18 + Vite + TypeScript, TanStack Query, Supabase (PostgreSQL + RLS + Edge Functions), shadcn/ui
- **Supabase project ID**: `bblxawscmyzelinidkmb`
- **Auth**: `useAuth()` from `src/contexts/AuthContext` — `user.id` is the UUID
- **Supabase client**: imported from `@/lib/supabase`
- **Key existing files**:
  - `src/components/BookingModal.tsx` — booking form (currently no payment, just saves to DB)
  - `src/pages/Dashboard.tsx` — provider management
  - `src/hooks/useBookings.ts` — `useCreateBooking`, `CreateBookingInput`, `Booking` types
  - `src/hooks/useProfile.ts` — `Profile` type
- **Existing DB tables** (from BRAIN.md):
  - `bookings` — `id`, `total_price`, `commission_amount` (15%), `payment_status`, `payment_method`
  - `profiles` — `id`, `role` ('user' | 'provider' | 'admin'), `stripe_customer_id` (added by stripe-payments skill)
  - `commissions` — provider commission ledger
- **Commission model**: Platform takes 15%. After Stripe fee (~2.9% + €0.30), net is split.

---

## Step 1 — Database Migrations

```sql
-- Migration: add_stripe_connect_fields
-- Add provider's Stripe Connect account ID
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON profiles(stripe_account_id);

-- Add Stripe payment tracking to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent
  ON bookings(stripe_payment_intent_id);
```

Run via `mcp_supabase-mcp-server_apply_migration`.

---

## Step 2 — Environment Variables

### Supabase Edge Function secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
```

> **Note**: Use the same `STRIPE_SECRET_KEY` as the regular payments skill, but a **different** webhook secret for Connect events.

### Frontend `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # same as stripe-payments skill
VITE_APP_URL=https://your-domain.com
```

---

## Step 3 — Provider Onboarding Flow

### 3a. Edge Function: `create-connect-account`

Create `supabase/functions/create-connect-account/index.ts`:

```typescript
import Stripe from 'https://esm.sh/stripe@13?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Authenticate
  const { data: { user }, error } = await supabase.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  );
  if (error || !user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, email, full_name, role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'provider') {
    return new Response('Only providers can connect Stripe', { status: 403 });
  }

  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';

  // Create or reuse Express account
  let accountId = profile.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'HR', // Croatia — adjust if needed
      email: profile.email ?? user.email ?? undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { supabase_user_id: user.id },
    });
    accountId = account.id;
    await supabase
      .from('profiles')
      .update({ stripe_account_id: accountId })
      .eq('id', user.id);
  }

  // Create account link (onboarding URL)
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard?stripe_refresh=1`,
    return_url: `${appUrl}/dashboard?stripe_return=1`,
    type: 'account_onboarding',
  });

  return new Response(JSON.stringify({ url: accountLink.url }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
```

### 3b. Provider Dashboard Connect Button

In `src/pages/Dashboard.tsx` or `src/components/provider/ProviderSettings.tsx`, add a Stripe Connect section:

```tsx
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useProfile } from '@/hooks/useProfile';

// Inside provider settings section:
const { data: profile } = useProfile();
const stripeConnect = useStripeConnect();

const isOnboarded = profile?.stripe_onboarding_complete;

return (
  <div className="bg-card rounded-xl p-6 shadow-card">
    <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
      💳 Stripe Payouts
    </h3>
    {isOnboarded ? (
      <div className="flex items-center gap-2 text-success">
        <Check size={16} /> Connected — payouts enabled
      </div>
    ) : (
      <>
        <p className="text-muted-foreground text-sm mb-4">
          Connect your bank account to receive payouts from bookings (85% of each booking).
        </p>
        <Button
          onClick={() => stripeConnect.mutate()}
          disabled={stripeConnect.isPending}
          className="bg-gradient-ocean"
        >
          {stripeConnect.isPending ? 'Redirecting...' : 'Connect Stripe Account'}
        </Button>
      </>
    )}
  </div>
);
```

### 3c. `useStripeConnect` Hook

Create `src/hooks/useStripeConnect.ts`:

```typescript
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useStripeConnect() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No onboarding URL');
      window.location.href = data.url;
    },
  });
}
```

---

## Step 4 — Booking Payment Flow

### 4a. Edge Function: `create-booking-payment`

Create `supabase/functions/create-booking-payment/index.ts`:

```typescript
import Stripe from 'https://esm.sh/stripe@13?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const authHeader = req.headers.get('Authorization');
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '') ?? ''
  );
  if (authError || !user) return new Response('Unauthorized', { status: 401 });

  const {
    mooringId,
    bookingData,  // Full CreateBookingInput object
    successPath = '/dashboard',
    cancelPath = '/explore',
  } = await req.json();

  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';

  // Get mooring owner's Stripe account
  const { data: mooring } = await supabase
    .from('moorings')
    .select('provider_id, name')
    .eq('id', mooringId)
    .single();

  if (!mooring) return new Response('Mooring not found', { status: 404 });

  const { data: providerProfile } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', mooring.provider_id)
    .single();

  // Amount in cents (Stripe requires integer cents)
  const totalCents = Math.round(bookingData.total_price * 100);
  
  // Platform fee: 15% of total
  const applicationFeeCents = Math.round(totalCents * 0.15);

  // Get or create guest's Stripe customer
  const { data: guestProfile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = guestProfile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  // Check if provider has completed onboarding
  if (!providerProfile?.stripe_account_id || !providerProfile?.stripe_onboarding_complete) {
    // Provider not connected — create booking but mark as pending_stripe
    // Fallback: create booking with cash/manual payment
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({ ...bookingData, user_id: user.id, payment_method: 'manual', payment_status: 'pending' })
      .select()
      .single();
    
    if (bookingError) return new Response(JSON.stringify({ error: bookingError.message }), { status: 500 });
    
    return new Response(JSON.stringify({ 
      booking,
      warning: 'Provider not yet connected to Stripe — booking saved, payment manual.' 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Create Stripe Checkout Session with Connect (destination charge)
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Mooring booking: ${mooring.name}`,
          description: `${bookingData.nights} night(s) · ${bookingData.check_in} → ${bookingData.check_out}`,
        },
        unit_amount: totalCents,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: applicationFeeCents,   // 15% platform fee
      transfer_data: {
        destination: providerProfile.stripe_account_id,  // 85% goes here
      },
      metadata: {
        mooring_id: mooringId,
        supabase_user_id: user.id,
        provider_id: mooring.provider_id,
      },
    },
    success_url: `${appUrl}${successPath}?payment_success=1`,
    cancel_url: `${appUrl}${cancelPath}`,
    metadata: {
      booking_data: JSON.stringify(bookingData),
      mooring_id: mooringId,
    },
  });

  return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
```

---

## Step 5 — Stripe Connect Webhook

Create `supabase/functions/stripe-connect-webhook/index.ts`:

```typescript
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

Deno.serve(async (req: Request) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get('STRIPE_CONNECT_WEBHOOK_SECRET')!);
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== 'paid') break;

      // Parse stored booking data and insert into DB
      const meta = session.metadata;
      if (!meta?.booking_data) break;

      const bookingData = JSON.parse(meta.booking_data);
      const { data: booking, error } = await supabase
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

      if (error) {
        console.error('Failed to insert booking:', error.message);
      } else {
        console.log('Booking created:', booking.id);
      }
      break;
    }

    case 'account.updated': {
      // Provider completed onboarding
      const account = event.data.object as Stripe.Account;
      if (account.details_submitted && account.charges_enabled) {
        await supabase
          .from('profiles')
          .update({ stripe_onboarding_complete: true })
          .eq('stripe_account_id', account.id);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.warn('Payment failed:', pi.id);
      // Optionally: find booking by stripe_payment_intent_id and mark as failed
      break;
    }

    default:
      console.log('Unhandled connect event:', event.type);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

> **Register two separate webhooks in Stripe dashboard**:
> 1. Regular webhook → `stripe-webhook` (for subscription events)
> 2. Connect webhook → `stripe-connect-webhook` (for booking payment events)
>    - Enable "Listen to events on connected accounts"
>    - Events: `checkout.session.completed`, `account.updated`, `payment_intent.payment_failed`

---

## Step 6 — `BookingModal.tsx`: Add Pay with Card Option

In `src/components/BookingModal.tsx`, add a `useBookingPayment` hook call for card payments.

Create `src/hooks/useBookingPayment.ts`:

```typescript
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CreateBookingInput } from '@/hooks/useBookings';

export function useBookingPayment() {
  return useMutation({
    mutationFn: async ({
      mooringId,
      bookingData,
    }: {
      mooringId: string;
      bookingData: CreateBookingInput;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-booking-payment', {
        body: {
          mooringId,
          bookingData,
          successPath: '/dashboard',
          cancelPath: '/explore',
        },
      });

      if (error) throw new Error(error.message);

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data?.booking) {
        // Provider not connected — booking saved as manual
        return data.booking;
      }
    },
  });
}
```

In `BookingModal.tsx`, modify the payment step to offer both options:

```tsx
// In the payment method selection section:
<div className="space-y-3">
  <h4 className="font-semibold text-foreground">Način plaćanja</h4>
  
  {/* Card payment via Stripe (recommended) */}
  <Button
    onClick={() => payWithCard()}
    disabled={bookingPayment.isPending}
    className="w-full bg-gradient-ocean"
  >
    💳 {bookingPayment.isPending ? 'Preusmjeravanje...' : 'Plati karticom (preporučeno)'}
  </Button>
  
  {/* Manual / cash option */}
  <Button
    onClick={() => createBooking({ ...bookingData, payment_method: 'cash' })}
    variant="outline"
    className="w-full"
  >
    💵 Plati gotovinom / dogovor
  </Button>
</div>
```

---

## Step 7 — Provider Dashboard: Handle Stripe Return

In `Dashboard.tsx`, handle the Stripe onboarding return URL:

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('stripe_return')) {
    toast({ title: 'Stripe račun spojen!', description: 'Isplate su sada aktivne.' });
    window.history.replaceState({}, '', window.location.pathname);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  }
  
  if (params.get('stripe_refresh')) {
    toast({ title: 'Onboarding nije završen', description: 'Dovrši postavljanje Stripe računa.' });
    window.history.replaceState({}, '', window.location.pathname);
  }

  if (params.get('payment_success')) {
    toast({ title: '✅ Plaćanje uspješno!', description: 'Tvoja rezervacija je potvrđena.' });
    window.history.replaceState({}, '', window.location.pathname);
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }
}, []);
```

---

## Step 8 — Admin: Stripe Payment Status Column

In `src/pages/Admin.tsx`, the bookings table should show `payment_status` and `stripe_payment_intent_id`. Add a column:

```tsx
<td>{booking.stripe_payment_intent_id
  ? <span className="text-success text-xs">💳 Stripe</span>
  : <span className="text-warning text-xs">💵 Manual</span>
}</td>
```

---

## Step 9 — Verification Checklist

1. **Stripe Dashboard**: Create a Connect Express account (Settings → Connect → Enable). Register two webhooks.
2. **Provider onboarding**: Login as provider → Dashboard → Connect Stripe → complete Stripe Express onboarding form → return_url shows success toast → `stripe_onboarding_complete = true` in DB
3. **Guest booking payment**: Make a test booking → click "Plati karticom" → redirected to Stripe Checkout → pay with test card `4242 4242 4242 4242` → webhook fires → booking inserted in DB with `payment_status = 'paid'`
4. **Fund split**: Check Stripe Dashboard → Payments → see application fee (15%) retained, transfer (85%) sent to connected account
5. **Fallback**: Make a booking where provider is NOT connected → booking saved as manual, no redirect
6. **Admin view**: Booking shows Stripe indicator vs manual

---

## File Checklist

| File | Action |
|------|--------|
| `supabase/functions/create-connect-account/index.ts` | **CREATE** |
| `supabase/functions/create-booking-payment/index.ts` | **CREATE** |
| `supabase/functions/stripe-connect-webhook/index.ts` | **CREATE** |
| `src/hooks/useStripeConnect.ts` | **CREATE** |
| `src/hooks/useBookingPayment.ts` | **CREATE** |
| `src/components/BookingModal.tsx` | **MODIFY** — add card payment option |
| `src/pages/Dashboard.tsx` | **MODIFY** — Connect Stripe section + return URL handling |
| `src/pages/Admin.tsx` | **MODIFY** — show Stripe payment status on bookings |
| Supabase migration | **APPLY** — `add_stripe_connect_fields` |
| Stripe Dashboard | **CONFIGURE** — Connect, two webhooks |

---

## Important Notes

- **Booking creation timing**: With Connect, the booking record is created by the **webhook** (after payment confirmed), NOT by the frontend directly. This prevents duplicate or unpaid bookings. The existing `useCreateBooking` hook in `useBookings.ts` is still used for cash/manual bookings.
- **Currency**: Stripe Connect works with EUR natively. Ensure all amounts are integers in cents.
- **Country support**: Stripe Express is available in Croatia (HR). For other provider countries, adjust the `country` field in `stripe.accounts.create()`.
- **15% platform fee**: Applied as `application_fee_amount`. Stripe will keep this on the platform account; the rest goes to the connected account. This matches the current commission model.
- **Commission table**: The existing `commissions` table should still be updated (either via webhook or a DB trigger) to maintain the local ledger for admin tracking.
- **Test cards for Connect**: Use Stripe test mode. Provider's Express account must also be in test mode during development.
