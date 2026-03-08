import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { generateReferralCode } from '@/lib/affiliateUtils';

export interface AffiliateMember {
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
}

/** Fetch the current user's affiliate record (null if not applied yet) */
export function useAffiliate() {
    const { user } = useAuth();
    return useQuery<AffiliateMember | null>({
        queryKey: ['affiliate', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('affiliate_members')
                .select('*')
                .eq('user_id', user!.id)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
    });
}

/** Submit an affiliate application for the current user */
export function useApplyAffiliate() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Not authenticated');
            const code = generateReferralCode(user.id);
            const { data, error } = await supabase
                .from('affiliate_members')
                .insert({ user_id: user.id, referral_code: code })
                .select()
                .single();
            if (error) throw error;
            return data as AffiliateMember;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['affiliate', user?.id] });
        },
    });
}

export interface AffiliateBooking {
    id: string;
    total_price: number;
    affiliate_commission: number;
    booking_status: string;
    created_at: string;
}

/** Fetch bookings attributed to this affiliate's referral code */
export function useAffiliateBookings(referralCode: string | undefined) {
    return useQuery<AffiliateBooking[]>({
        queryKey: ['affiliate-bookings', referralCode],
        enabled: !!referralCode,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('id, total_price, affiliate_commission, booking_status, created_at')
                .eq('referral_code', referralCode!)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data ?? []) as AffiliateBooking[];
        },
    });
}
