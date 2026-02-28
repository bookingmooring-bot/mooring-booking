import { useState } from 'react';
import {
    CreditCard,
    TrendingDown,
    Calendar,
    Loader2,
    Anchor,
    Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProviderSpending, ADDON_PRICES, AddonCostRecord, AddonBreakdown, MooringCostBreakdown } from '@/hooks/useProviderSpending';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: number) {
    return value.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cycleBadge(cycle: string) {
    const map: Record<string, string> = {
        monthly: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        yearly: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        per_booking: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    const labels: Record<string, string> = {
        monthly: '/mo', yearly: '/yr', per_booking: 'per booking',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[cycle] ?? ''}`}>
            {labels[cycle] ?? cycle}
        </span>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
    icon, title, value, subtitle, highlight = false,
}: {
    icon: React.ReactNode; title: string; value: string;
    subtitle: string; highlight?: boolean;
}) {
    return (
        <Card className={`${highlight ? 'border-destructive/30 bg-destructive/5' : ''} transition-shadow hover:shadow-hover`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold ${highlight ? 'text-destructive' : ''}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

// ─── Active Add-ons Panel ─────────────────────────────────────────────────────

function ActiveAddonsPanel({ byAddon }: { byAddon: AddonBreakdown[] }) {
    return (
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span>🧩</span> Active Add-Ons
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add-ons currently enabled across your moorings
                    </p>
                </div>
            </div>

            {byAddon.length === 0 ? (
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">No add-ons activated yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Enable add-ons when submitting a new mooring.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {byAddon.map((addon) => {
                        const meta = ADDON_PRICES[addon.addon_type];
                        return (
                            <div key={addon.addon_type} className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{meta?.icon ?? '📦'}</span>
                                    <div>
                                        <p className="font-medium">{meta?.label ?? addon.addon_type}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {cycleBadge(addon.billing_cycle)}
                                            <span className="text-xs text-muted-foreground">
                                                {addon.activation_count} mooring{addon.activation_count !== 1 ? 's' : ''} active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                    <p className="font-bold">
                                        {addon.addon_type === 'now4today'
                                            ? '+20% on guest'
                                            : `€${fmt(meta?.price ?? addon.total_amount)}`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {cycleLabel(addon.billing_cycle)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function cycleLabel(cycle: string) {
    if (cycle === 'monthly') return 'per mooring / month';
    if (cycle === 'yearly') return 'per mooring / year';
    if (cycle === 'per_booking') return 'surcharge on guest';
    return cycle;
}

// ─── Per-Mooring Cost Table ───────────────────────────────────────────────────

function MooringCostTable({ byMooring }: { byMooring: MooringCostBreakdown[] }) {
    return (
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Anchor className="text-secondary" size={20} />
                    Cost by Mooring
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Total add-on spend per mooring, sorted by highest cost
                </p>
            </div>

            {byMooring.length === 0 ? (
                <p className="text-muted-foreground text-center p-8">No data yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 text-left">
                                <th className="px-4 py-3 font-semibold">Mooring</th>
                                <th className="px-4 py-3 font-semibold text-right">Add-ons</th>
                                <th className="px-4 py-3 font-semibold text-right">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {byMooring.map((m, i) => (
                                <tr key={m.mooring_id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium flex items-center gap-1">
                                            {i === 0 && <span className="text-red-400">💸</span>}
                                            {m.mooring_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{m.location}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right">{m.addon_count}</td>
                                    <td className="px-4 py-3 text-right font-bold text-destructive">
                                        €{fmt(m.total_cost)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Cost History Table ───────────────────────────────────────────────────────

function CostHistoryList({ costs }: { costs: AddonCostRecord[] }) {
    return (
        <div className="bg-card rounded-2xl shadow-card border border-border">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold">Cost History</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Last {costs.length} add-on activation records
                </p>
            </div>

            {costs.length === 0 ? (
                <p className="text-muted-foreground text-center p-8">No history yet.</p>
            ) : (
                <div className="divide-y divide-border">
                    {costs.map((c) => {
                        const meta = ADDON_PRICES[c.addon_type];
                        return (
                            <div
                                key={c.id}
                                className="px-6 py-4 flex flex-col sm:flex-row justify-between gap-2 hover:bg-muted/20 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium flex items-center gap-1">
                                        <span>{meta?.icon ?? '📦'}</span>
                                        {meta?.label ?? c.addon_type}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {c.mooring_name} · {c.location}
                                    </p>
                                    {c.notes && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{c.notes}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(c.activated_at).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                                    {cycleBadge(c.billing_cycle)}
                                    <p className={`font-bold ${c.amount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        {c.amount > 0 ? `€${fmt(c.amount)}` : 'Feature'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProviderSpendingDashboard() {
    const { data: spending, isLoading, error } = useProviderSpending();

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
        );
    }

    if (error || !spending) {
        return (
            <p className="text-destructive text-center py-8 bg-card rounded-2xl border border-border p-6">
                Failed to load spending data. Please try again later.
            </p>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ── Header ── */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="text-destructive" />
                    My Spending
                </h2>
                <p className="text-muted-foreground mt-1">
                    Overview of all marketing &amp; add-on costs across your moorings
                </p>
            </div>

            {/* ── Stripe note ── */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                    <strong>Payment processing</strong> will be enabled in an upcoming release.
                    This dashboard shows your current add-on costs so you're always informed of your spend.
                </span>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard
                    icon={<TrendingDown className="text-destructive" size={20} />}
                    title="Total Spent (All Time)"
                    value={`€${fmt(spending.totalSpent)}`}
                    subtitle="All add-on activation costs"
                    highlight={spending.totalSpent > 0}
                />
                <KpiCard
                    icon={<Calendar className="text-primary" size={20} />}
                    title="Monthly Recurring"
                    value={`€${fmt(spending.monthlyRecurring)}/mo`}
                    subtitle="Active monthly subscriptions"
                />
                <KpiCard
                    icon={<CreditCard className="text-secondary" size={20} />}
                    title="12-Month Projection"
                    value={`€${fmt(spending.twelveMonthProjection)}`}
                    subtitle="Monthly × 12 + yearly add-ons"
                />
            </div>

            {/* ── Now4Today info card (if applicable) ── */}
            {spending.now4todaySurcharge > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span>🔥</span>
                        <p className="font-semibold text-orange-800 dark:text-orange-300">
                            Now4Today — Guest Surcharge Volume
                        </p>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                        Your Now4Today moorings generated <strong>€{fmt(spending.now4todaySurcharge)}</strong> in
                        +20% surcharges. This amount is paid by guests — not deducted from your earnings.
                    </p>
                </div>
            )}

            {/* ── Active Add-Ons Panel ── */}
            <ActiveAddonsPanel byAddon={spending.byAddon} />

            {/* ── Per-Mooring Costs ── */}
            <MooringCostTable byMooring={spending.byMooring} />

            {/* ── Cost History ── */}
            <CostHistoryList costs={spending.recentCosts} />
        </div>
    );
}
