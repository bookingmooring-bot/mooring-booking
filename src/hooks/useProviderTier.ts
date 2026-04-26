import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProviderTier } from '@/lib/providerTier';

export function useProviderTier(providerId: string | undefined) {
  return useQuery<ProviderTier>({
    queryKey: ['provider-tier', providerId],
    queryFn: async () => {
      if (!providerId) return 'standard';
      const { data } = await supabase
        .from('profiles')
        .select('provider_tier')
        .eq('id', providerId)
        .single();
      return (data?.provider_tier as ProviderTier) ?? 'standard';
    },
    enabled: !!providerId,
    staleTime: 10 * 60 * 1000,
  });
}
