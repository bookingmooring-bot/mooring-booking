import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  TrendingUp, Users, DollarSign, Calendar, AlertCircle, CheckCircle,
  Clock, Download, Filter, Search, Eye, Mail, MoreVertical,
  ArrowUpRight, Anchor, CreditCard, Check, X, Crown, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import {
  useAdminProviders,
  useAdminCommissions,
  useAdminPendingMoorings,
  useUpdateMooringStatus,
  useUpdateCommissionStatus,
  useAdminAllUsers,
  useUpdateProviderCommission,
} from "@/hooks/useAdmin";
import { useAllBookings } from "@/hooks/useBookings";
import { format } from "date-fns";
import AffiliateAdminTable from "@/components/admin/AffiliateAdminTable";
import FbLeadsTable from "@/components/admin/FbLeadsTable";
import AuthProviderBadge from "@/components/admin/AuthProviderBadge";
import MooringLayerBadge from "@/components/admin/MooringLayerBadge";
import SubscriptionTierBadge from "@/components/admin/SubscriptionTierBadge";
import type { MooringLayer } from "@/lib/mooringLayer";
import OsmImportPanel from "@/components/admin/OsmImportPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [authFilter, setAuthFilter] = useState("all");
  const [usersSubTab, setUsersSubTab] = useState("all-users");

  const { data: providers = [], isLoading: loadingProviders } = useAdminProviders();
  const { data: allUsers = [], isLoading: loadingUsers } = useAdminAllUsers();
  const { data: commissions = [], isLoading: loadingCommissions } = useAdminCommissions();
  const { data: pendingMoorings = [], isLoading: loadingPending } = useAdminPendingMoorings();
  const { data: bookings = [], isLoading: loadingBookings } = useAllBookings();

  const updateMooring = useUpdateMooringStatus();
  const updateCommission = useUpdateCommissionStatus();
  const updateCommissionRate = useUpdateProviderCommission();

  // Calculated Stats
  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => b.payment_status === 'paid' ? sum + Number(b.total_price || 0) : sum, 0);
  }, [bookings]);

  const totalPendingCommissions = useMemo(() => {
    return commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.amount || 0), 0);
  }, [commissions]);

  const stats = [
    {
      title: t('admin.totalRevenue') || "Total Revenue",
      value: `€${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: t('admin.totalBookings') || "Total Bookings",
      value: bookings.length.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: Calendar,
      color: "text-secondary"
    },
    {
      title: t('admin.activeProviders') || "Active Providers",
      value: providers.length.toLocaleString(),
      change: "+5.1%",
      trend: "up",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Total Users",
      value: allUsers.length.toLocaleString(),
      change: `${allUsers.filter(u => u.auth_provider === 'fb_lead').length} from FB`,
      trend: "up",
      icon: UserPlus,
      color: "text-purple-500"
    },
    {
      title: t('admin.pendingCommissions') || "Pending Commissions",
      value: `€${totalPendingCommissions.toLocaleString()}`,
      change: "Needs attention",
      trend: "down",
      icon: AlertCircle,
      color: "text-warning"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return <Badge className="bg-success/20 text-success border-success/30 capitalize">{status}</Badge>;
      case "confirmed":
        return <Badge className="bg-secondary/20 text-secondary border-secondary/30 capitalize">{status}</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning border-warning/30 capitalize">{status}</Badge>;
      case "cancelled":
      case "rejected":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 capitalize">{status}</Badge>;
      case "active":
        return <Badge className="bg-success/20 text-success border-success/30 capitalize">{status}</Badge>;
      case "inactive":
        return <Badge className="bg-muted text-muted-foreground capitalize">{status}</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 capitalize">{status}</Badge>;
      default:
        return <Badge className="capitalize">{status || 'Unknown'}</Badge>;
    }
  };

  const pendingCommissionsList = commissions.filter(c => c.status === 'pending' || c.status === 'overdue');

  const filteredProviders = providers.filter(p =>
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesAuth = authFilter === 'all' || u.auth_provider === authFilter;
      const q = userSearch.toLowerCase();
      const matchesSearch =
        !q ||
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      return matchesRole && matchesAuth && matchesSearch;
    });
  }, [allUsers, userSearch, roleFilter, authFilter]);

  const usersByProvider = useMemo(() => {
    const map = new Map(allUsers.map((u) => [u.id, u]));
    return map;
  }, [allUsers]);

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">{t('admin.title') || "Admin Dashboard"}</h1>
              <p className="text-muted-foreground">Manage providers, bookings, and approvals</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download size={18} />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} bg-current/10`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                </div>
                <h3 className="text-muted-foreground text-sm">{stat.title}</h3>
                <p className="font-heading text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card shadow-card overflow-x-auto flex-nowrap w-full justify-start md:justify-center">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">
                <Users size={14} className="mr-1" /> Users
                <span className="ml-1.5 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                  {allUsers.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="approvals" className="relative">
                Approvals
                {pendingMoorings.length > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full">
                    {pendingMoorings.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="providers">{t('admin.providerManagement') || "Providers"}</TabsTrigger>
              <TabsTrigger value="bookings">{t('admin.recentBookings') || "Bookings"}</TabsTrigger>
              <TabsTrigger value="commissions">{t('admin.pendingCommissions') || "Commissions"}</TabsTrigger>
              <TabsTrigger value="affiliates">🔗 Affiliates</TabsTrigger>
              <TabsTrigger value="osm-import">🌍 OSM Import</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading font-semibold text-lg">Recent Bookings</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')}>View All</Button>
                  </div>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                            <Anchor className="text-secondary" size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{booking.moorings?.name || 'Unknown Mooring'}</p>
                            <p className="text-muted-foreground text-xs">{booking.guest_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">€{booking.total_price}</p>
                          {getStatusBadge(booking.booking_status)}
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-muted-foreground text-sm py-4">No recent bookings found.</p>}
                  </div>
                </div>

                {/* Pending Commissions */}
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading font-semibold text-lg">Pending Commissions</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('commissions')}>View All</Button>
                  </div>
                  <div className="space-y-4">
                    {pendingCommissionsList.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{item.profiles?.full_name || 'Unknown Provider'}</p>
                          <p className="text-muted-foreground text-sm">Due: {item.due_date ? format(new Date(item.due_date), 'MMM d, yyyy') : 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">€{Number(item.amount).toFixed(2)}</p>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                    {pendingCommissionsList.length === 0 && <p className="text-muted-foreground text-sm py-4">All commissions settle up.</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Sub-tabs: All Users / FB Leads */}
              <Tabs value={usersSubTab} onValueChange={setUsersSubTab}>
                <TabsList className="bg-card shadow-card">
                  <TabsTrigger value="all-users">All Users</TabsTrigger>
                  <TabsTrigger value="fb-leads">FB Leads</TabsTrigger>
                </TabsList>

                <TabsContent value="all-users">
                  <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h3 className="font-heading font-semibold text-lg">
                        All Users ({filteredUsers.length})
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="pl-9 w-56"
                          />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="provider">Provider</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={authFilter} onValueChange={setAuthFilter}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Auth" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="apple">Apple</SelectItem>
                            <SelectItem value="fb_lead">FB Lead</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Auth Provider</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Mooring Layers</TableHead>
                          <TableHead>Moorings</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingUsers ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                              Loading users...
                            </TableCell>
                          </TableRow>
                        ) : filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell>
                                <p className="font-medium">{u.full_name || 'Unnamed'}</p>
                                <p className="text-muted-foreground text-xs">{u.email}</p>
                              </TableCell>
                              <TableCell>
                                <AuthProviderBadge provider={u.auth_provider} />
                                {u.fb_campaign_name && (
                                  <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[140px]">
                                    {u.fb_campaign_name}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">{u.role}</Badge>
                              </TableCell>
                              <TableCell>
                                <SubscriptionTierBadge tier={u.subscription_tier} />
                              </TableCell>
                              <TableCell>
                                {u.mooring_layers && u.mooring_layers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {u.mooring_layers.map((layer) => (
                                      <MooringLayerBadge key={layer} layer={layer as MooringLayer} />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>{u.mooring_count}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {format(new Date(u.created_at), 'MMM d, yyyy')}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="fb-leads">
                  <FbLeadsTable />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-lg">Pending Mooring Approvals</h3>
                  <p className="text-muted-foreground text-sm">Review newly submitted moorings before they go live.</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mooring</TableHead>
                      <TableHead>Provider Info</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price / Night</TableHead>
                      <TableHead>Layer</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingMoorings.map((mooring) => (
                      <TableRow key={mooring.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {mooring.image_urls?.[0] ? (
                              <img src={mooring.image_urls[0]} alt={mooring.name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center"><Anchor size={16} /></div>
                            )}
                            <span className="font-medium">{mooring.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{mooring.owner?.full_name}</p>
                            <p className="text-muted-foreground">{mooring.owner?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{mooring.location}, {mooring.country}</TableCell>
                        <TableCell>€{mooring.price_per_night}</TableCell>
                        <TableCell>
                          {mooring.mooring_layer ? (
                            <div className="flex flex-col gap-1">
                              <MooringLayerBadge layer={mooring.mooring_layer as MooringLayer} />
                              {mooring.data_source && mooring.data_source !== 'manual' && (
                                <Badge variant="outline" className="text-[10px] w-fit">{mooring.data_source}</Badge>
                              )}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{format(new Date(mooring.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90"
                            onClick={() => updateMooring.mutate({ id: mooring.id, status: 'active' })}
                            disabled={updateMooring.isPending}
                          >
                            <Check size={16} className="mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateMooring.mutate({ id: mooring.id, status: 'rejected' })}
                            disabled={updateMooring.isPending}
                          >
                            <X size={16} className="mr-1" /> Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pendingMoorings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No moorings waiting for approval.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Providers Tab */}
            <TabsContent value="providers">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h3 className="font-heading font-semibold text-lg">Provider Management</h3>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        placeholder="Search providers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Platform Role</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Mooring Layers</TableHead>
                      <TableHead>Moorings</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Total Commission</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{provider.full_name || 'Unnamed User'}</p>
                            <p className="text-muted-foreground text-sm">{provider.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const enriched = usersByProvider.get(provider.id);
                            return enriched ? <AuthProviderBadge provider={enriched.auth_provider} /> : '-';
                          })()}
                        </TableCell>
                        <TableCell><Badge variant="outline">{provider.role}</Badge></TableCell>
                        <TableCell>
                          {provider.provider_tier === 'white-label' ? (
                            <Badge className="bg-gold/20 text-gold border-gold/30 gap-1">
                              <Crown size={12} /> White Label
                            </Badge>
                          ) : (
                            <Badge variant="outline">Standard</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const enriched = usersByProvider.get(provider.id);
                            if (!enriched?.mooring_layers?.length) return <span className="text-muted-foreground text-sm">-</span>;
                            return (
                              <div className="flex flex-wrap gap-1">
                                {enriched.mooring_layers.map((l) => (
                                  <MooringLayerBadge key={l} layer={l as MooringLayer} />
                                ))}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>{provider.mooringCount}</TableCell>
                        <TableCell>{provider.totalBookings}</TableCell>
                        <TableCell>€{provider.totalRevenue.toLocaleString()}</TableCell>
                        <TableCell className="text-success font-medium">
                          €{provider.totalCommission.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={String(provider.commission_rate ?? 0.12)}
                            onValueChange={(val) =>
                              updateCommissionRate.mutate({ providerId: provider.id, rate: parseFloat(val) })
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.10">10%</SelectItem>
                              <SelectItem value="0.11">11%</SelectItem>
                              <SelectItem value="0.12">12%</SelectItem>
                              <SelectItem value="0.13">13%</SelectItem>
                              <SelectItem value="0.14">14%</SelectItem>
                              <SelectItem value="0.15">15%</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail size={16} className="mr-2" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProviders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No providers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h3 className="font-heading font-semibold text-lg">All Bookings</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Confirmation</TableHead>
                      <TableHead>Mooring</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Platform Fee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">{booking.confirmation_code}</TableCell>
                        <TableCell>
                          <p className="font-medium truncate max-w-[200px]">{booking.moorings?.name}</p>
                          <p className="text-muted-foreground text-xs">{booking.moorings?.location}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{booking.guest_name}</p>
                          <p className="text-muted-foreground text-xs">{booking.guest_email}</p>
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.check_in), 'MMM d')} - {format(new Date(booking.check_out), 'MMM d')}
                        </TableCell>
                        <TableCell>€{booking.total_price}</TableCell>
                        <TableCell className="text-success">€{Number(booking.commission_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(booking.booking_status)}</TableCell>
                      </TableRow>
                    ))}
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Commissions Tab */}
            <TabsContent value="commissions">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-heading font-semibold text-lg">All Commissions (Platform Revenue)</h3>
                    <p className="text-muted-foreground text-sm">Total pending: €{totalPendingCommissions.toLocaleString()}</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium">{item.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{item.profiles?.email}</p>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.booking_id ? item.booking_id.substring(0, 8) + '...' : 'N/A'}</TableCell>
                        <TableCell className="font-semibold">€{Number(item.amount).toFixed(2)}</TableCell>
                        <TableCell>{item.due_date ? format(new Date(item.due_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {item.status !== 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-success text-success hover:bg-success hover:text-white"
                                onClick={() => updateCommission.mutate({ id: item.id })}
                                disabled={updateCommission.isPending}
                              >
                                <CheckCircle size={14} className="mr-1" />
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {commissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No commissions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Affiliates Tab */}
            <TabsContent value="affiliates">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-lg">Affiliate Program Management</h3>
                  <p className="text-muted-foreground text-sm">Review applications, approve affiliates, and monitor referral commissions.</p>
                </div>
                <AffiliateAdminTable />
              </div>
            </TabsContent>

            <TabsContent value="osm-import">
              <OsmImportPanel />
            </TabsContent>

          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
