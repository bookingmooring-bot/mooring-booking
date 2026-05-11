import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/hooks/useProfile';
import type { Mooring } from '@/data/moorings';

interface ProviderProfileData {
  profile: Profile;
  moorings: Mooring[];
}

export function useProviderBySlug(slug: string | undefined) {
  return useQuery<ProviderProfileData | null>({
    queryKey: ['provider-profile', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('provider_slug', slug)
        .single();

      if (error || !profile) return null;

      const { data: moorings } = await supabase
        .from('moorings')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('status', 'active');

      return {
        profile: profile as Profile,
        moorings: (moorings ?? []) as unknown as Mooring[],
      };
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
