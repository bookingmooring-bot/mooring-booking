import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CheckoutOptions {
  priceId: string;
  successPath?: string;
  cancelPath?: string;
}

/**
 * Triggers a Stripe Hosted Checkout session for a subscription plan.
 * Calls the `create-checkout-session` Supabase Edge Function and redirects
 * the user to Stripe's payment page. After payment, user is redirected back
 * to `successPath` with `?session_id=...` in the URL.
 *
 * Usage:
 *   const checkout = useStripeCheckout();
 *   checkout.mutate({ priceId: 'price_xxx', successPath: '/dashboard' });
 */
export function useStripeCheckout() {
  return useMutation({
    mutationFn: async ({ priceId, successPath, cancelPath }: CheckoutOptions) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be logged in to subscribe.');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, successPath, cancelPath },
      });

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No Stripe checkout URL returned from server.');

      // Redirect browser to Stripe Hosted Checkout
      window.location.href = data.url;
    },
  });
}
