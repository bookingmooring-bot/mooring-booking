import { useState } from 'react';
import { useAffiliate, useApplyAffiliate, useAffiliateBookings } from '@/hooks/useAffiliate';
import { buildReferralLink } from '@/lib/affiliateUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Link2, Copy, CheckCircle, Clock, XCircle, TrendingUp,
    MousePointer, ShoppingCart, DollarSign, Share2, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AffiliateDashboard() {
    const { data: affiliate, isLoading } = useAffiliate();
    const applyMutation = useApplyAffiliate();
    const { data: referredBookings = [] } = useAffiliateBookings(
        affiliate?.status === 'approved' ? affiliate.referral_code : undefined
    );
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: '✅ Copied!', description: 'Referral link copied to clipboard.' });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApply = async () => {
        try {
            await applyMutation.mutateAsync();
            toast({ title: '🎉 Application Submitted!', description: 'Your affiliate application is pending review.' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast({
                title: 'Error',
                description: msg.includes('duplicate') ? 'You already have an application.' : msg,
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    /* ─── NOT APPLIED YET ─── */
    if (!affiliate) {
        return (
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border animate-fade-in">
                <div className="max-w-xl mx-auto text-center">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Share2 className="text-gold" size={32} />
                    </div>
                    <h2 className="font-heading text-2xl font-bold mb-2">Join the Affiliate Program</h2>
                    <p className="text-muted-foreground mb-6">
                        Earn commissions by referring sailors to Mooring Booking. Share your unique
                        referral link and get paid every time someone books a mooring through it.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                        {[
                            { label: 'Commission Rate', value: '10%' },
                            { label: 'Free to Join', value: '✓' },
                            { label: 'Cookie Duration', value: '30 Days' },
                        ].map((item) => (
                            <div key={item.label} className="bg-muted rounded-xl p-4">
                                <div className="text-xl font-bold text-secondary">{item.value}</div>
                                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={handleApply}
                        disabled={applyMutation.isPending}
                        size="lg"
                        className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-10"
                    >
                        {applyMutation.isPending ? 'Applying...' : '🔗 Apply Now — It\'s Free'}
                    </Button>
                </div>
            </div>
        );
    }

    /* ─── PENDING ─── */
    if (affiliate.status === 'pending') {
        const link = buildReferralLink(affiliate.referral_code);
        return (
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="text-warning" size={24} />
                    <div>
                        <h2 className="font-heading text-xl font-bold">Application Under Review</h2>
                        <p className="text-muted-foreground text-sm">You'll be notified once approved. You can start sharing your link now.</p>
                    </div>
                    <Badge className="ml-auto bg-warning/20 text-warning border-warning/30">Pending</Badge>
                </div>
                <div className="bg-muted rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl font-bold text-foreground tracking-widest">
                            {affiliate.referral_code}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 mb-2">Your Referral Link</p>
                    <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                        <span className="text-sm text-muted-foreground truncate flex-1">{link}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(link)}>
                            {copied ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── REJECTED / BANNED ─── */
    if (affiliate.status === 'rejected' || affiliate.status === 'banned') {
        return (
            <div className="bg-card rounded-2xl p-8 shadow-card border border-destructive/30 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                    <XCircle className="text-destructive" size={24} />
                    <div>
                        <h2 className="font-heading text-xl font-bold">
                            Application {affiliate.status === 'rejected' ? 'Rejected' : 'Banned'}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {affiliate.notes || 'Please contact support for more information.'}
                        </p>
                    </div>
                </div>
                <a href="/contact" className="text-primary underline text-sm">Contact Support</a>
            </div>
        );
    }

    /* ─── APPROVED — FULL DASHBOARD ─── */
    const link = buildReferralLink(affiliate.referral_code);
    const kpis = [
        { label: 'Referral Code', value: affiliate.referral_code, icon: Link2, color: 'text-primary', mono: true },
        { label: 'Total Clicks', value: affiliate.total_clicks.toString(), icon: MousePointer, color: 'text-secondary' },
        { label: 'Bookings Referred', value: affiliate.total_referrals.toString(), icon: ShoppingCart, color: 'text-secondary' },
        { label: 'Total Earned', value: `€${Number(affiliate.total_earned).toFixed(2)}`, icon: DollarSign, color: 'text-gold' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-gold" size={22} />
                    <h2 className="font-heading text-xl font-bold">Affiliate Dashboard</h2>
                </div>
                <Badge className="bg-success/20 text-success border-success/30">✓ Approved</Badge>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-card rounded-xl p-5 shadow-card border border-border">
                        <div className={`${kpi.color} mb-2`}>
                            <kpi.icon size={20} />
                        </div>
                        <p className={`font-bold text-xl ${kpi.mono ? 'font-mono tracking-widest' : ''}`}>{kpi.value}</p>
                        <p className="text-muted-foreground text-xs mt-1">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Referral Link */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Share2 size={18} className="text-primary" /> Your Shareable Link
                </h3>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3 border border-border">
                    <span className="text-sm truncate flex-1 text-foreground">{link}</span>
                    <Button onClick={() => handleCopy(link)} size="sm" variant="outline" className="shrink-0">
                        {copied ? <CheckCircle size={16} className="text-success mr-1" /> : <Copy size={16} className="mr-1" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Share this link on social media, blogs, or directly with sailors. Commission is 10% of booking value.
                </p>
            </div>

            {/* Referred Bookings */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="font-semibold mb-4">Referred Bookings</h3>
                {referredBookings.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertTriangle className="mx-auto text-muted-foreground mb-2" size={32} />
                        <p className="text-muted-foreground text-sm">No bookings via your referral link yet. Start sharing!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Booking ID</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Your Commission</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {referredBookings.map((b) => (
                                    <tr key={b.id}>
                                        <td className="py-3">{format(new Date(b.created_at), 'MMM d, yyyy')}</td>
                                        <td className="py-3 font-mono text-xs text-muted-foreground">{b.id.substring(0, 8)}…</td>
                                        <td className="py-3 font-semibold">€{Number(b.total_price).toFixed(2)}</td>
                                        <td className="py-3 font-semibold text-gold">€{Number(b.affiliate_commission).toFixed(2)}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${b.booking_status === 'confirmed' || b.booking_status === 'completed'
                                                    ? 'bg-success/20 text-success'
                                                    : b.booking_status === 'pending'
                                                        ? 'bg-warning/20 text-warning'
                                                        : 'bg-muted text-muted-foreground'}`}>
                                                {b.booking_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
