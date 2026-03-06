import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Initiates the Stripe Express Connect onboarding flow for a provider.
 * Calls the `create-connect-account` Edge Function and redirects the
 * provider to Stripe's Express onboarding form.
 *
 * On completion, Stripe redirects to /dashboard?stripe_return=1
 * On abandonment, Stripe redirects to /dashboard?stripe_refresh=1
 *
 * Usage:
 *   const stripeConnect = useStripeConnect();
 *   stripeConnect.mutate();
 */
export function useStripeConnect() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-connect-account');

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No onboarding URL returned from server.');

      // Redirect to Stripe Express onboarding
      window.location.href = data.url;
    },
  });
}
