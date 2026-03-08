---
name: stripe-payments
description: >
  Implements regular Stripe Checkout for the Mooring Booking app — covering user/captain
  subscription plans AND the AI Captain paywall after the 5th free attempt.
  Use this skill whenever the user wants to:
  — Integrate Stripe Checkout for captain subscription plans (Basic free, Premium Monthly €19.99, Premium Annual €9.99/mo)
  — Charge users for the AI Captain after they exceed their free question limit
  — Build the Supabase Edge Function `create-checkout-session` that creates a Stripe session
  — Build the Supabase Edge Function `stripe-webhook` that handles events (payment_intent.succeeded, checkout.session.completed, customer.subscription.*)
  — Update `profiles.subscription_tier` and `profiles.subscription_expires_at` after successful payment
  — Add real "Subscribe Now" buttons to `UserPricing.tsx` instead of the current "Coming Soon" placeholder
  — Gate the AI Captain so that after the 5th question (for free users) a Stripe Checkout modal or redirect appears
  — Store a `stripe_customer_id` on the profile for recurring billing
  — Handle subscription cancellations, renewals, and expirations via webhooks
  — Show the current subscription status clearly in the Dashboard Settings tab
  Trigger on: "stripe", "naplata", "plaćanje", "pretplata", "subscription", "checkout",
  "premium plan", "kupi pretplatu", "integriraj stripe", "ai kapetan plaćanje",
  "ai paywall", "ai limit", "premium pretplata", "plaćaj pretplatu", "platiti za AI",
  "uključi stripe", "user subscription stripe", "checkout session", "stripe webhook",
  "kupovina plana", "napravi checkout", "stripe customer", "subscription expires",
  "subscribe now", "naplati korisnika", "billing", "recurring payment",
  "platiti za kapetana", "5 pitanja besplatno", "AI limit plaćanje".
  ALWAYS use this skill when the user wants to charge sailors/captains for premium features,
  AI access, or subscription plans — even if Stripe is not explicitly mentioned.
---

# Stripe Payments Skill — Subscriptions & AI Paywall

This skill implements **regular Stripe** (not Connect) for charging **users/captains** money that goes entirely to the platform. Two payment flows:

1. **Subscription plans** — Users subscribe to Premium Monthly (€19.99/mo) or Premium Annual (€9.99/mo billed yearly).
2. **AI Captain paywall** — Free users get 10 questions. After that, they see a Stripe Checkout to upgrade.

---

## App Architecture Context

- **Stack**: React 18 + Vite + TypeScript, TanStack Query, Supabase (PostgreSQL + RLS + Edge Functions), shadcn/ui
- **Supabase project ID**: `bblxawscmyzelinidkmb`
- **Auth**: `useAuth()` from `src/contexts/AuthContext` — `user.id` is the UUID
- **Supabase client**: imported from `@/lib/supabase`
- **Key files to modify**:
  - `src/pages/UserPricing.tsx` — add real Stripe buttons (currently shows "Coming Soon" toast)
  - `src/components/AIChatWidget.tsx` — redirect to Stripe checkout instead of dead-end message
  - `src/lib/subscription.ts` — `AI_BASIC_LIMIT = 10` (note: user said "after the 5th attempt" — clarify with them whether limit should be 5 or 10)
  - `src/hooks/useProfile.ts` — `Profile` interface (add `stripe_customer_id`)
- **Environment variables** needed:
  - `STRIPE_SECRET_KEY` — Supabase Edge Function secret (set in Supabase Dashboard → Settings → Edge Functions)
  - `STRIPE_WEBHOOK_SECRET` — from Stripe webhook endpoint config
  - `VITE_STRIPE_PUBLISHABLE_KEY` — frontend env var (add to `.env` and `.env.example`)
  - `VITE_APP_URL` — base URL for success/cancel redirects
- **Stripe Price IDs** (create in Stripe dashboard, then store as secrets):
  - `STRIPE_PRICE_PREMIUM_MONTHLY` — for the €19.99/mo plan
  - `STRIPE_PRICE_PREMIUM_ANNUAL` — for the €9.99/mo × 12 plan
  - `STRIPE_PRICE_AI_UNLOCK` (optional one-time) — if you want a one-time AI Captain top-up option

---

## Step 1 — Database: Add `stripe_customer_id` to Profiles

```sql
-- Migration: add_stripe_customer_id_to_profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON profiles(stripe_customer_id);
```

Run via `mcp_supabase-mcp-server_apply_migration`.

---

## Step 2 — Environment Variables

### Frontend (`.env` and `.env.example`):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=https://your-app-domain.com
```

### Supabase Edge Function secrets (via Supabase Dashboard or CLI):
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_PREMIUM_MONTHLY=price_...
supabase secrets set STRIPE_PRICE_PREMIUM_ANNUAL=price_...
```

---

## Step 3 — Supabase Edge Function: `create-checkout-session`

Create `supabase/functions/create-checkout-session/index.ts`:

```typescript
import Stripe from 'https://esm.sh/stripe@13?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get authenticated user from JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (authError || !user) return new Response('Unauthorized', { status: 401 });

  const { priceId, successPath = '/dashboard', cancelPath = '/user-pricing' } = await req.json();
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';

  // Fetch or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${cancelPath}`,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    allow_promotion_codes: true,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
```

---

## Step 4 — Supabase Edge Function: `stripe-webhook`

Create `supabase/functions/stripe-webhook/index.ts`:

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
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return new Response('Bad signature', { status: 400 });
  }

  // Helper: update profile tier by stripe customer id
  async function updateProfileTier(
    customerId: string,
    tier: 'basic' | 'premium-monthly' | 'premium-annual',
    expiresAt: string | null
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    if (!profile) {
      console.error('No profile found for customer', customerId);
      return;
    }
    await supabase
      .from('profiles')
      .update({ subscription_tier: tier, subscription_expires_at: expiresAt })
      .eq('id', profile.id);
  }

  // Helper: determine tier from Stripe price ID
  function tierFromPriceId(priceId: string): 'premium-monthly' | 'premium-annual' {
    if (priceId === Deno.env.get('STRIPE_PRICE_PREMIUM_ANNUAL')) return 'premium-annual';
    return 'premium-monthly';
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // Subscription starts — subscription.created will also fire, handle there
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id ?? '';
      const tier = tierFromPriceId(priceId);
      const expiresAt = sub.status === 'active'
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

    case 'invoice.payment_failed': {
      // Optionally: send email or downgrade profile
      console.warn('Payment failed for customer:', (event.data.object as Stripe.Invoice).customer);
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

> **Important**: Register this webhook URL in the Stripe dashboard:
> `https://<project-id>.supabase.co/functions/v1/stripe-webhook`
> Events to listen for: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

---

## Step 5 — Frontend: `useStripeCheckout` Hook

Create `src/hooks/useStripeCheckout.ts`:

```typescript
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CheckoutOptions {
  priceId: string;
  successPath?: string;
  cancelPath?: string;
}

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async ({ priceId, successPath, cancelPath }: CheckoutOptions) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, successPath, cancelPath },
      });

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe Hosted Checkout
      window.location.href = data.url;
    },
  });
}
```

---

## Step 6 — Update `UserPricing.tsx`: Real Stripe Buttons

Replace the current `handleSelectPlan` toast placeholder with real Stripe calls.

```typescript
// At the top of UserPricingPage:
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useToast } from '@/hooks/use-toast';

const checkout = useStripeCheckout();
const { toast } = useToast();

const PRICE_IDS: Record<string, string> = {
  'premium-monthly': import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY,
  'premium-annual': import.meta.env.VITE_STRIPE_PRICE_PREMIUM_ANNUAL,
};

const handleSelectPlan = async (planId: string) => {
  if (planId === currentTier && user) return;
  if (planId === 'basic') return; // free plan, no action needed

  if (!user) {
    toast({ title: t('userPricing.loginRequired'), description: t('userPricing.loginRequiredDesc') });
    navigate('/auth');
    return;
  }

  const priceId = PRICE_IDS[planId];
  if (!priceId) {
    toast({ title: 'Configuration error', description: 'Price ID not set. Contact support.' });
    return;
  }

  checkout.mutate({ priceId, successPath: '/dashboard', cancelPath: '/user-pricing' });
};
```

Add loading state to the button:
```tsx
<Button
  onClick={() => handleSelectPlan(plan.id)}
  disabled={(plan.id === currentTier && !!user) || checkout.isPending}
  ...
>
  {checkout.isPending ? 'Redirecting...' : plan.cta}
</Button>
```

Also add these to `.env`:
```
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_...
VITE_STRIPE_PRICE_PREMIUM_ANNUAL=price_...
```

---

## Step 7 — AI Captain Paywall: Stripe Checkout After Limit

In `src/components/AIChatWidget.tsx`, replace the hard-stop message when `!premium && !hasRemaining` with:

```typescript
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

// Inside component:
const checkout = useStripeCheckout();
const PRICE_PREMIUM_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY;

// Replace the paywall block (around line 83–90) with:
if (!premium && !hasRemaining) {
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: `⭐ Iskoristio si svih ${AI_BASIC_LIMIT} besplatnih pitanja AI Kapetana.\n\nNadogradi na **Premium** za neograničen pristup, 7-dnevne prognoze, upozorenja na oluje i još mnogo toga!\n\n_Klikni gumb ispod za pretplatu._ 🚢`
  }]);
  setIsLoading(false);
  // Trigger Stripe checkout automatically or show a button
  if (user && PRICE_PREMIUM_MONTHLY) {
    setTimeout(() => {
      checkout.mutate({ priceId: PRICE_PREMIUM_MONTHLY, successPath: '/dashboard', cancelPath: '/' });
    }, 2000); // give user 2s to read the message
  }
  return;
}
```

> **Note**: Discuss with user whether to auto-redirect after 2s or show an in-chat upgrade button. Auto-redirect is more aggressive but higher conversion. In-chat button is friendlier. Consider adding a "Upgrade to Premium" button rendered in the chat as an `<a>` or by navigating to `/user-pricing`.

---

## Step 8 — Profile Type Update

In `src/hooks/useProfile.ts`, add `stripe_customer_id` to the `Profile` interface:

```typescript
export interface Profile {
  // ... existing fields ...
  stripe_customer_id?: string | null;
}
```

---

## Step 9 — Success & Return Handling

When a user returns from Stripe with `?session_id=...` in the URL, the webhook has already updated the profile. But as a UX improvement, add a success notification in `Dashboard.tsx`:

```typescript
// In Dashboard.tsx useEffect:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('session_id')) {
    toast({ title: '🎉 Pretplata aktivirana!', description: 'Dobrodošao u Premium!' });
    // Remove the param from URL without page reload
    window.history.replaceState({}, '', window.location.pathname);
    // Refetch profile to get updated tier
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  }
}, []);
```

---

## Step 10 — Verification Checklist

1. **Stripe Dashboard**: Create two products (Premium Monthly, Premium Annual) with correct prices. Copy the Price IDs to your secrets.
2. **Webhook**: Register `stripe-webhook` URL in Stripe Dashboard. Test with Stripe CLI: `stripe listen --forward-to https://<project>.supabase.co/functions/v1/stripe-webhook`
3. **Test flow**: Click "Subscribe Now" → redirected to Stripe Checkout → complete with test card `4242 4242 4242 4242` → redirected to `/dashboard` → profile shows `premium-monthly`
4. **AI Captain**: Use up 10 (or 5, confirm with user) questions → paywall message appears → Stripe Checkout opens → subscribe → AI questions work again
5. **Expiry**: Simulate `customer.subscription.deleted` event → profile reverts to `basic`
6. **RLS**: Profile `stripe_customer_id` must NOT be readable by other users — covered by existing RLS.

---

## File Checklist

| File | Action |
|------|--------|
| `supabase/functions/create-checkout-session/index.ts` | **CREATE** |
| `supabase/functions/stripe-webhook/index.ts` | **CREATE** |
| `src/hooks/useStripeCheckout.ts` | **CREATE** |
| `src/hooks/useProfile.ts` | **MODIFY** — add `stripe_customer_id` |
| `src/pages/UserPricing.tsx` | **MODIFY** — real Stripe buttons |
| `src/components/AIChatWidget.tsx` | **MODIFY** — Stripe paywall |
| `src/pages/Dashboard.tsx` | **MODIFY** — success toast on return |
| `.env` | **MODIFY** — add Stripe keys |
| `.env.example` | **MODIFY** — add placeholder keys |
| Supabase migration | **APPLY** — `add_stripe_customer_id` |
| Stripe Dashboard | **CONFIGURE** — products, prices, webhook |

---

## Design Notes

- Use the existing `bg-gradient-ocean` and shadcn `Button` components — keep the UI consistent.
- The `useStripeCheckout` hook redirects to Stripe Hosted Checkout (no Stripe.js needed on frontend). This is simpler and more PCI-compliant.
- **AI limit**: Confirm with user whether the paywall triggers at 5 questions (`AI_BASIC_LIMIT = 5`) or 10 (current). Change the constant in `src/lib/subscription.ts`.
- Stripe test mode: Use `pk_test_...` / `sk_test_...` during development. Switch to live keys on deploy.
- For subscription management (cancel, update payment method), use the Stripe Customer Portal: call `stripe.billingPortal.sessions.create()` in a new edge function `create-portal-session`.
