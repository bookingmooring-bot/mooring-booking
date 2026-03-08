import { useState } from 'react';
import {
    TrendingUp,
    Anchor,
    Moon,
    Trophy,
    Users,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProviderEarnings, MooringEarning, RawProviderBooking } from '@/hooks/useProviderEarnings';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeRange = 'all' | 'month' | 'year';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function filterByRange<T extends { created_at: string }>(
    items: T[],
    range: TimeRange
): T[] {
    if (range === 'all') return items;
    const now = new Date();
    const cutoff =
        range === 'month'
            ? new Date(now.getFullYear(), now.getMonth(), 1)
            : new Date(now.getFullYear(), 0, 1);
    return items.filter((item) => new Date(item.created_at) >= cutoff);
}

function fmt(value: number) {
    return value.toLocaleString('en-EU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
    icon,
    title,
    value,
    subtitle,
    highlight = false,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    highlight?: boolean;
}) {
    return (
        <Card className={`${highlight ? 'border-secondary/40 bg-secondary/5' : ''} transition-shadow hover:shadow-hover`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold truncate ${highlight ? 'text-secondary' : ''}`}>
                    {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

function OccupancyBadge({ rate }: { rate: number | null }) {
    if (rate === null)
        return <span className="text-muted-foreground text-sm">—</span>;

    const color =
        rate >= 70
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : rate >= 40
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
        >
            {rate}%
        </span>
    );
}

function BookingStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        confirmed:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        completed:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        cancelled:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-muted text-muted-foreground'
                }`}
        >
            {status}
        </span>
    );
}

// ─── Per-Mooring Table ───────────────────────────────────────────────────────

function MooringBreakdownTable({ moorings }: { moorings: MooringEarning[] }) {
    return (
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Anchor className="text-secondary" size={20} />
                    Earnings by Mooring
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Sorted by net earnings — top mooring highlighted
                </p>
            </div>

            {moorings.length === 0 ? (
                <p className="text-muted-foreground text-center p-8">
                    No booking data available yet.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 text-left">
                                <th className="px-4 py-3 font-semibold">Mooring</th>
                                <th className="px-4 py-3 font-semibold text-right">Bookings</th>
                                <th className="px-4 py-3 font-semibold text-right">Nights</th>
                                <th className="px-4 py-3 font-semibold text-right">Gross</th>
                                <th className="px-4 py-3 font-semibold text-right">Commission</th>
                                <th className="px-4 py-3 font-semibold text-right text-secondary">Net</th>
                                <th className="px-4 py-3 font-semibold text-center">Occupancy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {moorings.map((m, i) => (
                                <tr
                                    key={m.mooringId}
                                    className={`hover:bg-muted/30 transition-colors ${i === 0 ? 'border-l-4 border-l-yellow-400' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-medium flex items-center gap-1">
                                            {i === 0 && (
                                                <span className="text-yellow-500">🏆</span>
                                            )}
                                            {m.mooringName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {m.location}{m.country ? `, ${m.country}` : ''}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">{m.totalBookings}</td>
                                    <td className="px-4 py-3 text-right">{m.totalNights}</td>
                                    <td className="px-4 py-3 text-right">€{fmt(m.grossRevenue)}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                        −€{fmt(m.commissionPaid)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-secondary">
                                        €{fmt(m.netEarnings)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <OccupancyBadge rate={m.occupancyRate} />
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

// ─── Recent Bookings List ─────────────────────────────────────────────────────

function RecentBookingsList({ bookings }: { bookings: RawProviderBooking[] }) {
    return (
        <div className="bg-card rounded-2xl shadow-card border border-border">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold">Recent Guest Activity</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Last {bookings.length} booking{bookings.length !== 1 ? 's' : ''} in selected period
                </p>
            </div>

            {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center p-8">
                    No bookings in this period.
                </p>
            ) : (
                <div className="divide-y divide-border">
                    {bookings.map((b) => (
                        <div
                            key={b.id}
                            className="px-6 py-4 flex flex-col sm:flex-row justify-between gap-3 hover:bg-muted/20 transition-colors"
                        >
                            {/* Left side — booking details */}
                            <div className="min-w-0">
                                <p className="font-medium truncate">
                                    {b.moorings?.name ?? 'Mooring'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Guest: <span className="text-foreground">{b.guest_name}</span>{' '}
                                    · {b.guest_email}
                                </p>
                                {b.boat_name && (
                                    <p className="text-xs text-muted-foreground">
                                        Boat: {b.boat_name}{b.boat_length ? ` (${b.boat_length}m)` : ''}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(b.check_in).toLocaleDateString()} →{' '}
                                    {new Date(b.check_out).toLocaleDateString()} · {b.nights} night
                                    {b.nights !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs font-mono text-muted-foreground">
                                    #{b.confirmation_code}
                                </p>
                            </div>

                            {/* Right side — status + net earnings */}
                            <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                                <BookingStatusBadge status={b.booking_status} />
                                <div className="text-right">
                                    <p className="text-secondary font-bold">
                                        €{fmt(Number(b.total_price) - Number(b.commission_amount))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">net</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProviderEarningsDashboard() {
    const [timeRange, setTimeRange] = useState<TimeRange>('all');
    const [filterPaid, setFilterPaid] = useState(false);

    const { data: earnings, isLoading, error } = useProviderEarnings(filterPaid);

    // ── Loading state ──
    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
        );
    }

    // ── Error state ──
    if (error || !earnings) {
        return (
            <p className="text-destructive text-center py-8 bg-card rounded-2xl border border-border p-6">
                Failed to load earnings data. Please try again later.
            </p>
        );
    }

    // Client-side time-range filter on recent bookings list
    const filteredRecent = filterByRange(earnings.recentBookings, timeRange);

    // Re-compute summary KPIs from filtered bookings when time range is applied
    const displayNetEarnings =
        timeRange === 'all'
            ? earnings.netEarnings
            : filteredRecent.reduce(
                (s, b) => s + Number(b.total_price) - Number(b.commission_amount),
                0
            );
    const displayTotalBookings =
        timeRange === 'all' ? earnings.totalBookings : filteredRecent.length;
    const displayTotalNights =
        timeRange === 'all'
            ? earnings.totalNights
            : filteredRecent.reduce((s, b) => s + Number(b.nights ?? 0), 0);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ── Header + filter controls ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-secondary" />
                        Earnings &amp; Analytics
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Revenue overview across all your moorings
                    </p>
                </div>

                {/* Filter controls */}
                <div className="flex gap-2 flex-wrap items-center">
                    {/* Paid-only toggle */}
                    <button
                        onClick={() => setFilterPaid(!filterPaid)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${filterPaid
                                ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
                                : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {filterPaid ? '✓ Paid Only' : 'All Statuses'}
                    </button>

                    {/* Time range pills */}
                    <div className="bg-muted p-1 rounded-lg flex">
                        {(['all', 'month', 'year'] as TimeRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${timeRange === r
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {r === 'all' ? 'All Time' : r === 'month' ? 'This Month' : 'This Year'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<TrendingUp className="text-secondary" size={20} />}
                    title="Net Earnings"
                    value={`€${fmt(displayNetEarnings)}`}
                    subtitle="After 15% platform fee"
                    highlight
                />
                <KpiCard
                    icon={<Users className="text-primary" size={20} />}
                    title="Total Bookings"
                    value={displayTotalBookings.toString()}
                    subtitle="Non-cancelled reservations"
                />
                <KpiCard
                    icon={<Moon className="text-primary" size={20} />}
                    title="Nights Sold"
                    value={displayTotalNights.toString()}
                    subtitle="Total booked nights"
                />
                <KpiCard
                    icon={<Trophy className="text-yellow-500" size={20} />}
                    title="Best Mooring"
                    value={earnings.bestMooring?.mooringName ?? '—'}
                    subtitle={
                        earnings.bestMooring
                            ? `€${fmt(earnings.bestMooring.netEarnings)} net`
                            : 'No bookings yet'
                    }
                />
            </div>

            {/* ── Per-Mooring Breakdown Table ── */}
            <MooringBreakdownTable moorings={earnings.byMooring} />

            {/* ── Recent Guest Activity ── */}
            <RecentBookingsList bookings={filteredRecent} />
        </div>
    );
}
