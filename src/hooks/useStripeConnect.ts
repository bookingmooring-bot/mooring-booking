import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Initiates the Stripe Express Connect onboarding flow for a provider.
 * Uses raw fetch() instead of supabase.functions.invoke() to avoid
 * client-side CORS issues caused by the SDK's request handling.
 *
 * On completion, Stripe redirects to /dashboard?stripe_return=1
 * On abandonment, Stripe redirects to /dashboard?stripe_refresh=1
 */
export function useStripeConnect() {
  return useMutation({
    mutationFn: async () => {
      // Refresh session first to ensure JWT is not expired
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !sessionData?.session) {
        throw new Error('Nisi prijavljen ili je sesija istekla. Molimo se odjavi i ponovo prijavi.');
      }

      const token = sessionData.session.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

      // Use raw fetch to bypass supabase.functions.invoke CORS issues
      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-connect-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? `Server error: ${response.status}`);
      }

      if (!data?.url) {
        throw new Error('No onboarding URL returned from server.');
      }

      // Redirect to Stripe Express onboarding
      window.location.href = data.url;
    },
  });
}
