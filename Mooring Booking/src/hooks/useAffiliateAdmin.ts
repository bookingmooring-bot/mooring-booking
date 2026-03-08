import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AffiliateMemberWithProfile {
    id: string;
    user_id: string;
    referral_code: string;
    status: 'pending' | 'approved' | 'rejected' | 'banned';
    commission_rate: number;
    total_clicks: number;
    total_referrals: number;
    total_earned: number;
    created_at: string;
    approved_at: string | null;
    notes: string | null;
    profiles: { full_name: string | null; email: string | null } | null;
}

/** Fetch all affiliate members with profile info (admin only — relies on admin RLS) */
export function useAllAffiliates() {
    return useQuery<AffiliateMemberWithProfile[]>({
        queryKey: ['admin-affiliates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('affiliate_members')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data ?? []) as AffiliateMemberWithProfile[];
        },
    });
}

/** Update an affiliate's status. Automatically sets approved_at when approving. */
export function useUpdateAffiliateStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            status,
            notes,
        }: {
            id: string;
            status: 'pending' | 'approved' | 'rejected' | 'banned';
            notes?: string;
        }) => {
            const update: Record<string, unknown> = { status };
            if (notes !== undefined) update.notes = notes;
            if (status === 'approved') update.approved_at = new Date().toISOString();
            const { error } = await supabase
                .from('affiliate_members')
                .update(update)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
        },
    });
}
