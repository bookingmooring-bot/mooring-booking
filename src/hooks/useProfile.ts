import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: 'user' | 'provider' | 'admin';
    subscription_tier: 'basic' | 'sailor' | 'captain' | 'charter-fleet' | 'ai-only' | 'premium-monthly' | 'premium-annual';
    subscription_expires_at: string | null;
    ai_questions_used: number;
    preferred_language: string;
    boat_name?: string | null;
    boat_length?: number | null;
    stripe_customer_id?: string | null;
    stripe_account_id?: string | null;
    stripe_onboarding_complete?: boolean | null;
    provider_tier?: 'standard' | 'white-label';
    white_label_berth_tier?: 'up-to-50' | 'over-50' | null;
    white_label_subscription_id?: string | null;
    white_label_activated_at?: string | null;
    expo_push_token?: string | null;
    last_known_lat?: number | null;
    last_known_lng?: number | null;
    storm_alerts_enabled?: boolean;
    storm_wind_threshold_kn?: number;
    storm_wave_threshold_m?: number;
    commission_rate?: number;
    provider_slug?: string | null;
    created_at: string;
}

export function useProfile() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Failed to fetch profile:', error.message);
                return null;
            }
            return data as Profile;
        },
        enabled: !!user,
    });
}

export function useUpdateProfile() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: Partial<Profile>) => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as Profile;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

export function useIncrementAIQuestions() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase.rpc('increment_ai_questions', {
                user_id: user.id,
            });

            // If RPC doesn't exist, fallback to manual update
            if (error) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('ai_questions_used')
                    .eq('id', user.id)
                    .single();

                await supabase
                    .from('profiles')
                    .update({ ai_questions_used: (profile?.ai_questions_used || 0) + 1 })
                    .eq('id', user.id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
