import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from './useProfile';
import { Mooring } from '@/data/moorings';
import { DbMooring } from './useMoorings';

export interface Commission {
    id: string;
    provider_id: string;
    booking_id: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    due_date: string;
    paid_at: string | null;
    created_at: string;
    profiles?: {
        full_name: string;
        email: string;
        country?: string; // We might not have country in profile, maybe address or we join moorings
    };
    bookings?: {
        id: string;
        total_price: number;
        mooring_id: string;
    };
}

export interface ProviderStats extends Profile {
    mooringCount: number;
    totalBookings: number;
    totalRevenue: number;
    totalCommission: number;
}

export function useAdminProviders() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['admin', 'providers'],
        queryFn: async () => {
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'provider');

            if (profileError) throw profileError;

            // Get moorings count
            const { data: moorings, error: mooringsError } = await supabase
                .from('moorings')
                .select('owner_id');

            if (mooringsError) throw mooringsError;

            // Get bookings stats
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('provider_id, total_price, commission_amount')
                .eq('payment_status', 'paid');

            if (bookingsError) throw bookingsError;

            const providerStats: ProviderStats[] = profiles.map((profile) => {
                const providerMoorings = moorings.filter(m => m.owner_id === profile.id);
                const providerBookings = bookings.filter(b => b.provider_id === profile.id);

                const totalRevenue = providerBookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0);
                const totalCommission = providerBookings.reduce((sum, b) => sum + Number(b.commission_amount || 0), 0);

                return {
                    ...profile,
                    mooringCount: providerMoorings.length,
                    totalBookings: providerBookings.length,
                    totalRevenue,
                    totalCommission
                };
            });

            return providerStats;
        },
        enabled: !!user,
    });
}

export function useAdminCommissions() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['admin', 'commissions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('commissions')
                .select(`
                    *,
                    profiles:provider_id(full_name, email),
                    bookings:booking_id(id, total_price, mooring_id)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Commission[];
        },
        enabled: !!user,
    });
}

export function useAdminPendingMoorings() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['admin', 'pending-moorings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('moorings')
                .select(`
                    *,
                    owner:profiles!owner_id(full_name, email, phone)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
}

export function useUpdateMooringStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'active' | 'rejected' }) => {
            const { data, error } = await supabase
                .from('moorings')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pending-moorings'] });
            queryClient.invalidateQueries({ queryKey: ['moorings'] });
        },
    });
}

// ─── Admin: All Users (with auth provider, fb lead, mooring layers) ───

export interface AdminUser {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    subscription_tier: string;
    provider_tier: string | null;
    auth_provider: 'google' | 'apple' | 'email' | 'fb_lead';
    fb_lead_status: string | null;
    fb_campaign_name: string | null;
    mooring_layers: string[] | null;
    mooring_count: number;
    created_at: string;
}

export function useAdminAllUsers() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['admin', 'all-users'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('admin_get_all_users');
            if (error) throw error;
            return (data ?? []) as AdminUser[];
        },
        enabled: !!user,
    });
}

// ─── Admin: FB Leads ───

export interface FbLead {
    id: string;
    fb_lead_id: string | null;
    fb_form_id: string | null;
    fb_ad_id: string | null;
    fb_campaign_name: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    has_mooring: boolean;
    mooring_type: string | null;
    mooring_quantities: any;
    status: string;
    user_id: string | null;
    invite_email_sent: boolean;
    invite_email_sent_at: string | null;
    created_at: string;
    updated_at: string;
}

export function useAdminFbLeads() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['admin', 'fb-leads'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('admin_get_fb_leads');
            if (error) throw error;
            return (data ?? []) as FbLead[];
        },
        enabled: !!user,
    });
}

export function useUpdateCommissionStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const { data, error } = await supabase
                .from('commissions')
                .update({
                    status: 'paid',
                    paid_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'commissions'] });
        },
    });
}
