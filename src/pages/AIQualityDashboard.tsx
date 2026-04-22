import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import { TrendingUp, ShieldAlert, ThumbsUp, Siren, Loader2 } from "lucide-react";

interface DailyRow {
    day: string;
    total_calls: number;
    low_confidence_calls: number;
    flagged_calls: number;
    thumbs_up: number;
    thumbs_down: number;
    paywall_hits: number;
    emergency_calls: number;
    avg_confidence: string | null;
    avg_latency_ms: string | null;
    intent_breakdown: Record<string, number> | null;
}

const useDailyQuality = () =>
    useQuery({
        queryKey: ["ai-quality-daily"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("ai_quality_daily")
                .select("*")
                .order("day", { ascending: true })
                .limit(60);
            if (error) throw new Error(error.message);
            return (data ?? []) as DailyRow[];
        },
        staleTime: 60_000,
    });

const KPICard = ({
    icon: Icon,
    label,
    value,
    hint,
    accent,
}: {
    icon: typeof TrendingUp;
    label: string;
    value: string;
    hint?: string;
    accent: string;
}) => (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="text-xl font-bold text-foreground">{value}</div>
                {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
            </div>
        </div>
    </div>
);

const AIQualityDashboard = () => {
    const { data: rows = [], isLoading, error } = useDailyQuality();

    const kpis = useMemo(() => {
        const total = rows.reduce((sum, r) => sum + Number(r.total_calls || 0), 0);
        const up = rows.reduce((sum, r) => sum + Number(r.thumbs_up || 0), 0);
        const down = rows.reduce((sum, r) => sum + Number(r.thumbs_down || 0), 0);
        const flagged = rows.reduce((sum, r) => sum + Number(r.flagged_calls || 0), 0);
        const lowConf = rows.reduce((sum, r) => sum + Number(r.low_confidence_calls || 0), 0);
        const paywall = rows.reduce((sum, r) => sum + Number(r.paywall_hits || 0), 0);
        const emergency = rows.reduce((sum, r) => sum + Number(r.emergency_calls || 0), 0);
        const ratings = up + down;
        const positivePct = ratings > 0 ? Math.round((up / ratings) * 100) : 0;
        const flagRate = total > 0 ? Math.round((flagged / total) * 100) : 0;
        const lowConfRate = total > 0 ? Math.round((lowConf / total) * 100) : 0;
        return { total, up, down, flagged, lowConf, paywall, emergency, positivePct, flagRate, lowConfRate };
    }, [rows]);

    const chartData = useMemo(
        () =>
            rows.map((r) => ({
                day: r.day.slice(0, 10),
                calls: Number(r.total_calls || 0),
                up: Number(r.thumbs_up || 0),
                down: Number(r.thumbs_down || 0),
                flagged: Number(r.flagged_calls || 0),
                lowConf: Number(r.low_confidence_calls || 0),
                avgConfidence: r.avg_confidence ? Number(r.avg_confidence) : 0,
            })),
        [rows]
    );

    const intentTotals = useMemo(() => {
        const acc: Record<string, number> = {};
        for (const r of rows) {
            if (!r.intent_breakdown) continue;
            for (const [intent, count] of Object.entries(r.intent_breakdown)) {
                acc[intent] = (acc[intent] ?? 0) + Number(count);
            }
        }
        return Object.entries(acc)
            .map(([intent, count]) => ({ intent, count }))
            .sort((a, b) => b.count - a.count);
    }, [rows]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">AI Captain — Quality Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Daily signal quality from <code>ai_quality_daily</code>: ratings, low-confidence rate, intent mix, latency.
                    </p>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={16} /> Loading quality metrics…
                    </div>
                )}
                {error && (
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                        Failed to load metrics: {(error as Error).message}
                    </div>
                )}

                {!isLoading && !error && rows.length === 0 && (
                    <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
                        No AI Captain responses logged yet. Send a few test messages and come back.
                    </div>
                )}

                {rows.length > 0 && (
                    <>
                        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                            <KPICard icon={TrendingUp} label="Total calls (60d)" value={kpis.total.toLocaleString()} accent="bg-sky-600" />
                            <KPICard
                                icon={ThumbsUp}
                                label="Positive rating"
                                value={`${kpis.positivePct}%`}
                                hint={`${kpis.up} up · ${kpis.down} down`}
                                accent="bg-emerald-600"
                            />
                            <KPICard
                                icon={ShieldAlert}
                                label="Flagged / low-conf"
                                value={`${kpis.flagRate}% / ${kpis.lowConfRate}%`}
                                hint={`${kpis.flagged} flagged · ${kpis.lowConf} low-conf`}
                                accent="bg-amber-600"
                            />
                            <KPICard
                                icon={Siren}
                                label="EMERGENCY / paywall"
                                value={`${kpis.emergency} / ${kpis.paywall}`}
                                hint="quota-bypassed + blocked"
                                accent="bg-rose-600"
                            />
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card p-4">
                                <h2 className="mb-2 text-sm font-semibold text-foreground">Daily calls</h2>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="calls" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Total" />
                                        <Line type="monotone" dataKey="up" stroke="#10b981" strokeWidth={2} dot={false} name="Thumbs up" />
                                        <Line type="monotone" dataKey="down" stroke="#f43f5e" strokeWidth={2} dot={false} name="Thumbs down" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-4">
                                <h2 className="mb-2 text-sm font-semibold text-foreground">Confidence vs flagged</h2>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 1]} />
                                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="avgConfidence" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Avg confidence" />
                                        <Line yAxisId="right" type="monotone" dataKey="flagged" stroke="#f59e0b" strokeWidth={2} dot={false} name="Flagged" />
                                        <Line yAxisId="right" type="monotone" dataKey="lowConf" stroke="#ef4444" strokeWidth={2} dot={false} name="Low-conf" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4">
                            <h2 className="mb-2 text-sm font-semibold text-foreground">Top intents (60d)</h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={intentTotals} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                    <YAxis type="category" dataKey="intent" stroke="hsl(var(--muted-foreground))" fontSize={11} width={130} />
                                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AIQualityDashboard;
