import { useState, useMemo } from 'react';
import { useAllAffiliates, useUpdateAffiliateStatus, AffiliateMemberWithProfile } from '@/hooks/useAffiliateAdmin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Check, X, Ban, Search, Users, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'banned';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: 'bg-warning/20 text-warning border-warning/30',
        approved: 'bg-success/20 text-success border-success/30',
        rejected: 'bg-destructive/20 text-destructive border-destructive/30',
        banned: 'bg-muted text-muted-foreground',
    };
    return (
        <Badge className={`capitalize ${map[status] ?? ''}`}>{status}</Badge>
    );
}

export default function AffiliateAdminTable() {
    const { data: affiliates = [], isLoading } = useAllAffiliates();
    const updateStatus = useUpdateAffiliateStatus();
    const { toast } = useToast();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const filtered = useMemo(() => {
        return affiliates.filter((a) => {
            const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                a.profiles?.full_name?.toLowerCase().includes(q) ||
                a.profiles?.email?.toLowerCase().includes(q) ||
                a.referral_code.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [affiliates, search, statusFilter]);

    const summary = useMemo(() => ({
        total: affiliates.length,
        pending: affiliates.filter((a) => a.status === 'pending').length,
        approved: affiliates.filter((a) => a.status === 'approved').length,
        totalEarned: affiliates.reduce((s, a) => s + Number(a.total_earned || 0), 0),
    }), [affiliates]);

    const handleUpdate = async (
        affiliate: AffiliateMemberWithProfile,
        newStatus: 'approved' | 'rejected' | 'banned'
    ) => {
        try {
            await updateStatus.mutateAsync({ id: affiliate.id, status: newStatus });
            toast({
                title: `✅ ${affiliate.profiles?.full_name ?? 'Affiliate'} ${newStatus}`,
                description: `Status updated to ${newStatus}.`,
            });
        } catch (err: unknown) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Affiliates', value: summary.total, icon: Users, color: 'text-primary' },
                    { label: 'Pending Review', value: summary.pending, icon: Clock, color: 'text-warning' },
                    { label: 'Approved Active', value: summary.approved, icon: Check, color: 'text-success' },
                    { label: 'Total Commissions', value: `€${summary.totalEarned.toFixed(2)}`, icon: DollarSign, color: 'text-gold' },
                ].map((s) => (
                    <div key={s.label} className="bg-card rounded-xl p-4 shadow-card border border-border">
                        <s.icon className={`${s.color} mb-1`} size={18} />
                        <p className="font-bold text-lg">{s.value}</p>
                        <p className="text-muted-foreground text-xs">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search by name, email, or code…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Affiliate</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Clicks</TableHead>
                            <TableHead>Referrals</TableHead>
                            <TableHead>Earned</TableHead>
                            <TableHead>Applied</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                    Loading affiliates…
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                    No affiliates found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>
                                        <p className="font-medium">{a.profiles?.full_name || 'Unknown'}</p>
                                        <p className="text-muted-foreground text-xs">{a.profiles?.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{a.referral_code}</span>
                                    </TableCell>
                                    <TableCell><StatusBadge status={a.status} /></TableCell>
                                    <TableCell>{a.total_clicks}</TableCell>
                                    <TableCell>{a.total_referrals}</TableCell>
                                    <TableCell className="font-semibold text-gold">€{Number(a.total_earned).toFixed(2)}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(a.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 justify-end">
                                            {a.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-success hover:bg-success/90 h-7 px-2"
                                                        onClick={() => handleUpdate(a, 'approved')}
                                                        disabled={updateStatus.isPending}
                                                    >
                                                        <Check size={14} className="mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-7 px-2"
                                                        onClick={() => handleUpdate(a, 'rejected')}
                                                        disabled={updateStatus.isPending}
                                                    >
                                                        <X size={14} className="mr-1" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            {a.status === 'approved' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                                                    onClick={() => handleUpdate(a, 'banned')}
                                                    disabled={updateStatus.isPending}
                                                >
                                                    <Ban size={14} className="mr-1" /> Ban
                                                </Button>
                                            )}
                                            {(a.status === 'rejected' || a.status === 'banned') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 px-2"
                                                    onClick={() => handleUpdate(a, 'approved')}
                                                    disabled={updateStatus.isPending}
                                                >
                                                    <Check size={14} className="mr-1" /> Re-approve
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
