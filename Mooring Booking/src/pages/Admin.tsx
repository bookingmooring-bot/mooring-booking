import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  TrendingUp, Users, DollarSign, Calendar, AlertCircle, CheckCircle,
  Clock, Download, Filter, Search, Eye, Mail, MoreVertical,
  ArrowUpRight, Anchor, CreditCard, Check, X, Building
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
  useUpdateCommissionStatus
} from "@/hooks/useAdmin";
import { useAllBookings } from "@/hooks/useBookings";
import { format } from "date-fns";
import AffiliateAdminTable from "@/components/admin/AffiliateAdminTable";
import { useMarinaApplications, useUpdateMarinaStatus } from "@/hooks/useMarinas";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: providers = [], isLoading: loadingProviders } = useAdminProviders();
  const { data: commissions = [], isLoading: loadingCommissions } = useAdminCommissions();
  const { data: pendingMoorings = [], isLoading: loadingPending } = useAdminPendingMoorings();
  const { data: bookings = [], isLoading: loadingBookings } = useAllBookings();
  const { data: marinaApps = [], isLoading: loadingMarinas } = useMarinaApplications();

  const updateMooring = useUpdateMooringStatus();
  const updateCommission = useUpdateCommissionStatus();
  const updateMarina = useUpdateMarinaStatus();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <TabsTrigger value="marinas" className="relative">
                🏛️ Marinas
                {marinaApps.filter(m => m.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full">
                    {marinaApps.filter(m => m.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
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
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      <TableHead>Platform Role</TableHead>
                      <TableHead>Moorings</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Total Commission</TableHead>
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
                        <TableCell><Badge variant="outline">{provider.role}</Badge></TableCell>
                        <TableCell>{provider.mooringCount}</TableCell>
                        <TableCell>{provider.totalBookings}</TableCell>
                        <TableCell>€{provider.totalRevenue.toLocaleString()}</TableCell>
                        <TableCell className="text-success font-medium">
                          €{provider.totalCommission.toLocaleString()}
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
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

            {/* Marina Applications Tab */}
            <TabsContent value="marinas">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                    <Building className="text-secondary" size={20} />
                    Marina Partnership Applications
                  </h3>
                  <p className="text-muted-foreground text-sm">Review and approve marina partnership inquiries.</p>
                </div>
                {loadingMarinas ? (
                  <p className="text-muted-foreground text-sm py-4">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marina</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Berths</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marinaApps.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.marina_name}</p>
                              {app.website && (
                                <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline">
                                  {app.website}
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{app.location}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{app.contact_name}</p>
                              <p className="text-muted-foreground">{app.email}</p>
                              <p className="text-muted-foreground">{app.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-secondary">{app.number_of_berths}</span>
                          </TableCell>
                          <TableCell>{format(new Date(app.submitted_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            {app.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-success hover:bg-success/90"
                                  onClick={() => updateMarina.mutate({ id: app.id, status: 'approved' })}
                                  disabled={updateMarina.isPending}
                                >
                                  <Check size={14} className="mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateMarina.mutate({ id: app.id, status: 'rejected' })}
                                  disabled={updateMarina.isPending}
                                >
                                  <X size={14} className="mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {app.status !== 'pending' && (
                              <span className="text-xs text-muted-foreground">
                                {app.reviewed_at ? format(new Date(app.reviewed_at), 'MMM d, yyyy') : '—'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {marinaApps.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No marina applications yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
