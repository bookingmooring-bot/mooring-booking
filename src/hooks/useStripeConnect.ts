import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

/**
 * Initiates Stripe Connect (Express) onboarding for a provider.
 * Calls the `create-connect-account` Edge Function which returns an onboarding URL,
 * then redirects the provider's browser to that URL.
 */
export function useStripeConnect() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("create-connect-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No onboarding URL returned");

      // Redirect to Stripe Express onboarding
      window.location.href = data.url;
    },
    onError: (err: Error) => {
      toast({
        title: "Stripe greška",
        description: err.message || "Nije moguće pokrenuti Stripe onboarding. Pokušaj ponovo.",
        variant: "destructive",
      });
    },
  });
}
