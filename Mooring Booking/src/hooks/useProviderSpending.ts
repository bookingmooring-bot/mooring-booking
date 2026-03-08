import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ─── Pricing constants (single source of truth) ──────────────────────────────

export const ADDON_PRICES: Record<string, { label: string; price: number; cycle: string; icon: string }> = {
    marketing_tools: { label: 'Marketing Tools', price: 5.00, cycle: 'monthly', icon: '📣' },
    premium_listing: { label: 'Premium Listing', price: 9.99, cycle: 'monthly', icon: '⭐' },
    now4today: { label: 'Now4Today', price: 0, cycle: 'per_booking', icon: '🔥' },
    insurance: { label: 'Mooring Insurance', price: 9.99, cycle: 'yearly', icon: '🛡️' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddonCostRecord {
    id: string;
    addon_type: string;
    amount: number;
    billing_cycle: string;
    activated_at: string;
    notes: string | null;
    mooring_name: string;
    location: string;
}

export interface AddonBreakdown {
    addon_type: string;
    activation_count: number;
    total_amount: number;
    billing_cycle: string;
}

export interface MooringCostBreakdown {
    mooring_id: string;
    mooring_name: string;
    location: string;
    addon_count: number;
    total_cost: number;
}

export interface ProviderSpendingSummary {
    totalSpent: number;
    monthlyRecurring: number;
    yearlyRecurring: number;
    now4todaySurcharge: number;
    twelveMonthProjection: number;
    byAddon: AddonBreakdown[];
    byMooring: MooringCostBreakdown[];
    recentCosts: AddonCostRecord[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProviderSpending() {
    const { user } = useAuth();

    return useQuery<ProviderSpendingSummary>({
        queryKey: ['provider-spending', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase.rpc('get_provider_spending', {
                p_provider_id: user.id,
            });

            if (error) throw new Error(error.message);
            if (!data) throw new Error('No spending data returned');

            // The RPC returns a single jsonb object
            const raw = data as {
                total_spent: number;
                monthly_recurring: number;
                yearly_recurring: number;
                now4today_surcharge: number;
                twelve_month_projection: number;
                by_addon: AddonBreakdown[];
                by_mooring: MooringCostBreakdown[];
                recent_costs: AddonCostRecord[];
            };

            return {
                totalSpent: Number(raw.total_spent ?? 0),
                monthlyRecurring: Number(raw.monthly_recurring ?? 0),
                yearlyRecurring: Number(raw.yearly_recurring ?? 0),
                now4todaySurcharge: Number(raw.now4today_surcharge ?? 0),
                twelveMonthProjection: Number(raw.twelve_month_projection ?? 0),
                byAddon: Array.isArray(raw.by_addon) ? raw.by_addon : [],
                byMooring: Array.isArray(raw.by_mooring) ? raw.by_mooring : [],
                recentCosts: Array.isArray(raw.recent_costs) ? raw.recent_costs : [],
            };
        },
        enabled: !!user,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
