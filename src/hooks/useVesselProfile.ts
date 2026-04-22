import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Vessel {
    id: string;
    user_id: string;
    name: string | null;
    boat_type: 'sailboat' | 'motorboat' | 'rib' | 'catamaran' | 'yacht' | 'other' | null;
    length_m: number | null;
    beam_m: number | null;
    draft_m: number | null;
    mmsi: string | null;
    call_sign: string | null;
    insurance_expiry: string | null;
    engine_make: string | null;
    engine_model: string | null;
    engine_hours: number | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export type VesselInput = Partial<Omit<Vessel, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export function useVessels() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['vessel-profiles', user?.id],
        queryFn: async () => {
            if (!user) return [] as Vessel[];
            const { data, error } = await supabase
                .from('user_vessel_profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Failed to fetch vessel profiles:', error.message);
                return [] as Vessel[];
            }
            return (data ?? []) as Vessel[];
        },
        enabled: !!user,
    });
}

export function useDefaultVessel() {
    const { data: vessels } = useVessels();
    return vessels?.find((v) => v.is_default) ?? vessels?.[0] ?? null;
}

export function useCreateVessel() {
    const { user } = useAuth();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (input: VesselInput) => {
            if (!user) throw new Error('Not authenticated');
            const { data, error } = await supabase
                .from('user_vessel_profiles')
                .insert({ ...input, user_id: user.id })
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data as Vessel;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['vessel-profiles'] });
        },
    });
}

export function useUpdateVessel() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: VesselInput }) => {
            const { data, error } = await supabase
                .from('user_vessel_profiles')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data as Vessel;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['vessel-profiles'] });
        },
    });
}

export function useDeleteVessel() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('user_vessel_profiles').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['vessel-profiles'] });
        },
    });
}

export function useSetDefaultVessel() {
    const { user } = useAuth();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            if (!user) throw new Error('Not authenticated');
            // Clear existing default first to avoid unique-index collision
            await supabase
                .from('user_vessel_profiles')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .eq('is_default', true);

            const { data, error } = await supabase
                .from('user_vessel_profiles')
                .update({ is_default: true })
                .eq('id', id)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data as Vessel;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['vessel-profiles'] });
        },
    });
}
