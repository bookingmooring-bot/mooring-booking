import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProviderTier } from '@/lib/providerTier';

interface ProviderTierData {
  tier: ProviderTier;
  commissionRate?: number;
}

export function useProviderTier(providerId: string | undefined) {
  return useQuery<ProviderTierData>({
    queryKey: ['provider-tier', providerId],
    queryFn: async () => {
      if (!providerId) return { tier: 'standard' as ProviderTier };
      const { data } = await supabase
        .from('profiles')
        .select('provider_tier, commission_rate')
        .eq('id', providerId)
        .single();
      return {
        tier: (data?.provider_tier as ProviderTier) ?? 'standard',
        commissionRate: data?.commission_rate ? Number(data.commission_rate) : undefined,
      };
    },
    enabled: !!providerId,
    staleTime: 10 * 60 * 1000,
  });
}
