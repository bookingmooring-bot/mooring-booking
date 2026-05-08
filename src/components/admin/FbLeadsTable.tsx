import { useState, useMemo } from 'react';
import { useAdminFbLeads } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Search, Users, Clock, Check, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

type StatusFilter = 'all' | 'invited' | 'onboarding' | 'active' | 'inactive';

const statusStyles: Record<string, string> = {
  invited: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  onboarding: 'bg-warning/20 text-warning border-warning/30',
  active: 'bg-success/20 text-success border-success/30',
  inactive: 'bg-muted text-muted-foreground',
};

export default function FbLeadsTable() {
  const { data: leads = [], isLoading } = useAdminFbLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.full_name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.fb_campaign_name?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const summary = useMemo(() => ({
    total: leads.length,
    invited: leads.filter((l) => l.status === 'invited').length,
    active: leads.filter((l) => l.status === 'active').length,
    campaigns: new Set(leads.map((l) => l.fb_campaign_name).filter(Boolean)).size,
  }), [leads]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: summary.total, icon: Users, color: 'text-[#1877F2]' },
          { label: 'Invited', value: summary.invited, icon: Clock, color: 'text-warning' },
          { label: 'Active', value: summary.active, icon: Check, color: 'text-success' },
          { label: 'Campaigns', value: summary.campaigns, icon: Megaphone, color: 'text-purple-500' },
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
            placeholder="Search by name, email, city, or campaign..."
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
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Mooring</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email Sent</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Loading FB leads...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No FB leads found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <p className="font-medium">{l.full_name || 'Unknown'}</p>
                    <p className="text-muted-foreground text-xs">{l.email}</p>
                    {l.phone && <p className="text-muted-foreground text-xs">{l.phone}</p>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {[l.city, l.country].filter(Boolean).join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    {l.fb_campaign_name ? (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[180px] block">
                        {l.fb_campaign_name}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {l.has_mooring ? (
                      <Badge className="bg-success/20 text-success border-success/30">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                    {l.mooring_type && (
                      <span className="text-xs text-muted-foreground ml-1">{l.mooring_type}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize ${statusStyles[l.status] ?? ''}`}>{l.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {l.invite_email_sent ? (
                      <span className="text-success text-sm">
                        {l.invite_email_sent_at ? format(new Date(l.invite_email_sent_at), 'MMM d') : 'Yes'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(l.created_at), 'MMM d, yyyy')}
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
