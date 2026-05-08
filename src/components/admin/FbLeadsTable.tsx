import { useState, useMemo } from 'react';
import { useAdminFbLeads } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Search, Users, Clock, UserCheck, Megaphone, Facebook, Globe } from 'lucide-react';
import { format } from 'date-fns';

type StatusFilter = 'all' | 'new' | 'invited' | 'registered' | 'onboarding' | 'active' | 'inactive';
type SourceFilter = 'all' | 'facebook' | 'website';

const mooringTypeLabels: Record<string, { label: string; emoji: string }> = {
  'θεση_σε_λιμανι': { label: 'Marina Berth', emoji: '🏗️' },
  'σημαδουρα': { label: 'Mooring Buoy', emoji: '⚓' },
  'ιδιωτικη_προβλητα': { label: 'Private Dock', emoji: '🛥️' },
  'vez_u_marini': { label: 'Marina Berth', emoji: '🏗️' },
  'posto_in_porto': { label: 'Marina Berth', emoji: '🏗️' },
  'pontile_privato': { label: 'Private Dock', emoji: '🛥️' },
  'place_de_port': { label: 'Marina Berth', emoji: '🏗️' },
};

const countLabels: Record<string, string> = {
  '1': '1',
  '2_3': '2-3',
  '4_5': '4-5',
  'πανω_απο_5': '5+',
  'piu_di_5': '5+',
  'plus_de_5': '5+',
};

const availabilityLabels: Record<string, { label: string; color: string }> = {
  'ναι': { label: 'Available', color: 'text-success' },
  'εν_μερει': { label: 'Partial', color: 'text-warning' },
  'δεν_ειμαι_σιγουρος_ακομα': { label: 'Unsure', color: 'text-muted-foreground' },
  'si': { label: 'Available', color: 'text-success' },
  'parzialmente': { label: 'Partial', color: 'text-warning' },
  'oui': { label: 'Available', color: 'text-success' },
  'partiellement': { label: 'Partial', color: 'text-warning' },
  'da': { label: 'Available', color: 'text-success' },
  'djelomicno': { label: 'Partial', color: 'text-warning' },
};

const statusStyles: Record<string, string> = {
  new: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
  invited: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  registered: 'bg-teal-500/20 text-teal-600 border-teal-500/30',
  onboarding: 'bg-warning/20 text-warning border-warning/30',
  active: 'bg-success/20 text-success border-success/30',
  inactive: 'bg-muted text-muted-foreground',
};

function isFacebookLead(campaignName: string | null): boolean {
  if (!campaignName) return false;
  const name = campaignName.toLowerCase();
  return name.includes('mr-provider') || name.includes('facebook lead');
}

function isWebsiteLead(campaignName: string | null): boolean {
  if (!campaignName) return false;
  return campaignName.toLowerCase().includes('website');
}

function getSource(campaignName: string | null): 'facebook' | 'website' | 'direct' {
  if (isFacebookLead(campaignName)) return 'facebook';
  if (isWebsiteLead(campaignName)) return 'website';
  return 'direct';
}

function getCampaignCountry(campaignName: string | null): string | null {
  if (!campaignName) return null;
  const match = campaignName.match(/(?:MR-Provider-|^)([A-Z]{2})(?:-|$)/i);
  return match ? match[1].toUpperCase() : null;
}

export default function FbLeadsTable() {
  const { data: leads = [], isLoading } = useAdminFbLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const source = getSource(l.fb_campaign_name);
      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'facebook' && source === 'facebook') ||
        (sourceFilter === 'website' && (source === 'website' || source === 'direct'));
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.full_name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.fb_campaign_name?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.country?.toLowerCase().includes(q);
      return matchesStatus && matchesSource && matchesSearch;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const summary = useMemo(() => {
    const fbLeads = leads.filter((l) => getSource(l.fb_campaign_name) === 'facebook');
    const webLeads = leads.filter((l) => getSource(l.fb_campaign_name) !== 'facebook');
    return {
      total: leads.length,
      fbLeads: fbLeads.length,
      webLeads: webLeads.length,
      invited: leads.filter((l) => l.status === 'invited').length,
      registered: leads.filter((l) => l.status === 'registered').length,
      campaigns: new Set(leads.map((l) => l.fb_campaign_name).filter(Boolean)).size,
    };
  }, [leads]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: summary.total, icon: Users, color: 'text-[#1877F2]' },
          { label: 'Facebook Ads', value: summary.fbLeads, icon: Facebook, color: 'text-[#1877F2]' },
          { label: 'Website', value: summary.webLeads, icon: Globe, color: 'text-emerald-500' },
          { label: 'Invited', value: summary.invited, icon: Clock, color: 'text-blue-500' },
          { label: 'Registered', value: summary.registered, icon: UserCheck, color: 'text-teal-500' },
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
        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="facebook">Facebook Ads</SelectItem>
            <SelectItem value="website">Website / Direct</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {leads.length} leads
      </p>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Source</TableHead>
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
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => {
                const source = getSource(l.fb_campaign_name);
                const campaignCountry = getCampaignCountry(l.fb_campaign_name);
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="font-medium">{l.full_name || 'Unknown'}</p>
                      <p className="text-muted-foreground text-xs">{l.email}</p>
                      {l.phone && <p className="text-muted-foreground text-xs">{l.phone}</p>}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {l.city && <p>{l.city}</p>}
                        {(l.country || campaignCountry) && (
                          <p className="text-muted-foreground text-xs">{l.country || campaignCountry}</p>
                        )}
                        {!l.city && !l.country && !campaignCountry && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {source === 'facebook' ? (
                        <Badge className="bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30 gap-1">
                          <Facebook size={12} /> FB Ad
                        </Badge>
                      ) : source === 'website' ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1">
                          <Globe size={12} /> Website
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Globe size={12} /> Direct
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {l.fb_campaign_name ? (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[180px] block">
                          {l.fb_campaign_name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {l.has_mooring || l.mooring_type ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const mt = mooringTypeLabels[l.mooring_type ?? ''];
                              return mt ? (
                                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {mt.emoji} {mt.label}
                                </span>
                              ) : (
                                <Badge className="bg-success/20 text-success border-success/30">Yes</Badge>
                              );
                            })()}
                          </div>
                          {l.mooring_quantities && (
                            <div className="flex items-center gap-2 text-xs">
                              {l.mooring_quantities.count && (
                                <span className="bg-muted px-1.5 py-0.5 rounded font-medium">
                                  {countLabels[l.mooring_quantities.count] ?? l.mooring_quantities.count} moorings
                                </span>
                              )}
                              {l.mooring_quantities.availability && (
                                <span className={availabilityLabels[l.mooring_quantities.availability]?.color ?? 'text-muted-foreground'}>
                                  {availabilityLabels[l.mooring_quantities.availability]?.label ?? l.mooring_quantities.availability}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">No</Badge>
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
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {format(new Date(l.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
