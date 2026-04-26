import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserBookings, useProviderBookings, Booking } from "@/hooks/useBookings";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Ship, Calendar, Settings, ShieldCheck, Save, Anchor, Star } from "lucide-react";
import AffiliateDashboard from "@/components/affiliate/AffiliateDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MooringList from "@/components/provider/MooringList";
import ProviderCalendar from "@/components/provider/ProviderCalendar";
import ProviderEarningsDashboard from "@/components/provider/ProviderEarningsDashboard";
import ProviderSpendingDashboard from "@/components/provider/ProviderSpendingDashboard";
import ReviewMooringModal from "@/components/rating/ReviewMooringModal";
import RateGuestModal from "@/components/rating/RateGuestModal";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import WhiteLabelUpgradeCard from "@/components/provider/WhiteLabelUpgradeCard";

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const { data: userBookings, isLoading: bookingsLoading } = useUserBookings();
    const { data: providerBookings, isLoading: providerBookingsLoading } = useProviderBookings();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const stripeConnect = useStripeConnect();

    const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'moorings' | 'calendar' | 'earnings' | 'spending' | 'affiliate'>('dashboard');
    const [settingsForm, setSettingsForm] = useState({
        full_name: '',
        phone: '',
        boat_name: '',
        boat_length: '',
    });
    const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
    const [rateGuestTarget, setRateGuestTarget] = useState<Booking | null>(null);

    // Populate form when profile loads
    useEffect(() => {
        if (profile) {
            setSettingsForm({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                boat_name: profile.boat_name || '',
                boat_length: profile.boat_length?.toString() || '',
            });
        }
    }, [profile]);

    // Handle Stripe return URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('session_id')) {
            // Returned from subscription checkout
            toast({ title: '🎉 Pretplata aktivirana!', description: 'Dobrodošao u Premium! Tvoj plan je sada aktivan.' });
            window.history.replaceState({}, '', window.location.pathname);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }

        if (params.get('payment_success')) {
            // Returned from booking payment
            toast({ title: '✅ Plaćanje uspješno!', description: 'Tvoja rezervacija je potvrđena i primljena.' });
            window.history.replaceState({}, '', window.location.pathname);
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }

        if (params.get('stripe_return')) {
            // Provider returned from Stripe Express onboarding
            toast({ title: '💳 Stripe račun spojen!', description: 'Isplate su sada aktivne. Primat ćeš 85% od svake rezervacije.' });
            window.history.replaceState({}, '', window.location.pathname);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }

        if (params.get('stripe_refresh')) {
            // Provider onboarding was not completed
            toast({
                title: 'Onboarding nije završen',
                description: 'Dovrši postavljanje Stripe računa da bi primao isplate.',
                variant: 'destructive',
            });
            window.history.replaceState({}, '', window.location.pathname);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Redirect if somehow not logged in (though ProtectedRoute should catch this)
    useEffect(() => {
        if (!user) {
            navigate('/auth');
        }
    }, [user, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </main>
                <Footer />
            </div>
        );
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile.mutateAsync({
                full_name: settingsForm.full_name,
                phone: settingsForm.phone,
                boat_name: settingsForm.boat_name,
                boat_length: settingsForm.boat_length ? parseFloat(settingsForm.boat_length) : null,
            });
            toast({
                title: "Settings Saved",
                description: "Your profile information has been updated.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save settings.",
                variant: "destructive",
            });
        }
    };

    // Settings Interface
    const renderSettingsView = () => {
        return (
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border mt-8 animate-fade-in">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="text-primary" /> Profile Settings
                </h2>
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    value={settingsForm.full_name}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={settingsForm.phone}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2 flex items-center gap-2">
                            <Anchor size={18} /> Boat Information
                            <span className="text-sm font-normal text-muted-foreground ml-2">(Auto-fills booking form)</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="boat_name">Boat Name</Label>
                                <Input
                                    id="boat_name"
                                    value={settingsForm.boat_name}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, boat_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="boat_length">Boat Length (meters)</Label>
                                <Input
                                    id="boat_length"
                                    type="number"
                                    step="0.1"
                                    value={settingsForm.boat_length}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, boat_length: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full sm:w-auto mt-6 bg-gradient-ocean"
                        disabled={updateProfile.isPending}
                    >
                        {updateProfile.isPending ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                        ) : (
                            <Save className="mr-2" size={18} />
                        )}
                        Save Changes
                    </Button>
                </form>
            </div>
        );
    };

    // Common User Interface
    const renderUserTrips = () => {
        // We'll implement this fully in subsequent steps
        return (
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="text-primary" /> My Trips
                </h2>

                {bookingsLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                ) : !userBookings || userBookings.length === 0 ? (
                    <p className="text-muted-foreground">You haven't booked any trips yet.</p>
                ) : (
                    <div className="space-y-4">
                        {userBookings.map((booking) => (
                            <div key={booking.id} className="border border-border p-4 rounded-xl hover:shadow-hover transition-shadow bg-background flex flex-col sm:flex-row justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg">{booking.moorings?.name || 'Unknown Mooring'}</h3>
                                    <p className="text-muted-foreground text-sm">{booking.moorings?.location}, {booking.moorings?.country}</p>
                                    <p className="font-medium mt-2">
                                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm">Guest: {booking.guest_name}</p>
                                    {booking.boat_name && (
                                        <p className="text-sm">Boat: {booking.boat_name} ({booking.boat_length}m)</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-start sm:items-end justify-between gap-3">
                                    {booking.booking_status === 'pending' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            Pending
                                        </span>
                                    ) : booking.booking_status === 'confirmed' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Confirmed
                                        </span>
                                    ) : booking.booking_status === 'completed' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            Completed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                            {booking.booking_status}
                                        </span>
                                    )}

                                    <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                        <p className="text-sm text-muted-foreground">Total Price</p>
                                        <p className="text-xl font-bold">€{booking.total_price}</p>
                                    </div>

                                    {booking.booking_status === 'completed' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                            onClick={() => setReviewTarget(booking)}
                                        >
                                            <Star size={14} className="mr-1 fill-yellow-400 text-yellow-400" />
                                            Ocijeni vez
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {reviewTarget && (
                    <ReviewMooringModal
                        open={!!reviewTarget}
                        onOpenChange={(open) => !open && setReviewTarget(null)}
                        mooringId={reviewTarget.mooring_id}
                        bookingId={reviewTarget.id}
                        mooringName={reviewTarget.moorings?.name ?? 'Vez'}
                    />
                )}
            </div>
        );
    };

    // Provider Interface
    const renderProviderView = () => {
        return (
            <div className="mt-8 space-y-8">
                {/* Stripe Connect Card */}
                <div className={`bg-card rounded-2xl p-6 shadow-card border ${
                    profile?.stripe_onboarding_complete
                        ? 'border-success/40 border-l-4 border-l-success'
                        : 'border-border border-l-4 border-l-warning'
                }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="font-semibold text-foreground">
                                💳 Stripe Payouts
                            </h3>
                            {profile?.stripe_onboarding_complete ? (
                                <p className="text-sm text-success mt-1">✅ Spojen — primat ćeš 85% od svake rezervacije automatski.</p>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Spoji svoj bankovni račun da primaš isplate. Dobit ćeš 85% od svake rezervacije plaćene karticom.
                                </p>
                            )}
                        </div>
                        {!profile?.stripe_onboarding_complete && (
                            <Button
                                onClick={() => stripeConnect.mutate()}
                                disabled={stripeConnect.isPending}
                                className="bg-gradient-ocean shrink-0"
                            >
                                {stripeConnect.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> Preusmjeravanje...
                                    </span>
                                ) : (
                                    'Spoji Stripe račun'
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* White Label Upgrade / Status */}
                <WhiteLabelUpgradeCard />

                {/* Provider Bookings + Mooring List */}
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border border-l-4 border-l-secondary">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Ship className="text-secondary" /> Provider Dashboard
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Manage your moorings, view received bookings, and track earnings here.
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => navigate('/become-provider')}>
                            Add New Mooring
                        </Button>
                    </div>

                    <h3 className="font-semibold text-lg border-b border-border pb-2 mb-4 mt-8">Recent Bookings on Your Moorings</h3>

                    {providerBookingsLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-secondary" size={24} />
                        </div>
                    ) : !providerBookings || providerBookings.length === 0 ? (
                        <p className="text-muted-foreground p-4 bg-muted/50 rounded-lg border border-border text-center">
                            You haven't received any bookings yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {providerBookings.map((booking) => (
                                <div key={booking.id} className="border border-border p-4 rounded-xl hover:shadow-hover transition-shadow bg-background flex flex-col sm:flex-row justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-secondary">{booking.moorings?.name || 'Unknown Mooring'}</h4>
                                        <p className="text-muted-foreground text-sm">{booking.moorings?.location}</p>
                                        <p className="font-medium mt-2">
                                            Dates: {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm mt-1">
                                            <span className="text-muted-foreground">Guest:</span> {booking.guest_name} ({booking.guest_email})
                                        </p>
                                        {booking.boat_name && (
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">Boat:</span> {booking.boat_name} ({booking.boat_length}m)
                                            </p>
                                        )}
                                        {/* Stripe payment indicator */}
                                        {booking.stripe_payment_intent_id && (
                                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full mt-1">
                                                💳 Stripe
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end justify-between gap-3">
                                        {booking.booking_status === 'pending' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                Pending Action
                                            </span>
                                        ) : booking.booking_status === 'confirmed' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Confirmed
                                            </span>
                                        ) : booking.booking_status === 'completed' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                {booking.booking_status}
                                            </span>
                                        )}

                                        <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                            <p className="text-sm text-muted-foreground">Earnings (minus commission)</p>
                                            <p className="text-xl font-bold text-secondary">
                                                €{(booking.total_price - booking.commission_amount).toFixed(2)}
                                            </p>
                                        </div>

                                        {booking.booking_status === 'completed' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                onClick={() => setRateGuestTarget(booking)}
                                            >
                                                <Star size={14} className="mr-1 fill-yellow-400 text-yellow-400" />
                                                Ocijeni gosta
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Provider → Guest rating modal */}
                {rateGuestTarget && (
                    <RateGuestModal
                        open={!!rateGuestTarget}
                        onOpenChange={(open) => !open && setRateGuestTarget(null)}
                        bookingId={rateGuestTarget.id}
                        guestUserId={rateGuestTarget.user_id}
                        guestName={rateGuestTarget.guest_name}
                    />
                )}

                {renderUserTrips()}
            </div>
        );
    };

    // Admin Interface
    const renderAdminView = () => {
        return (
            <div className="mt-8">
                <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-6 shadow-card border border-red-200 dark:border-red-900 border-l-4 border-l-red-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                        <ShieldCheck /> Admin Controls
                    </h2>
                    <p className="text-red-600 dark:text-red-300 mb-4">
                        You have administrator privileges. Go to the Admin Panel to manage platform data.
                    </p>
                    <Button variant="destructive" onClick={() => navigate('/admin')}>
                        Go to Admin Panel
                    </Button>
                </div>
                <div className="mt-8">
                    {renderUserTrips()}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-12 bg-muted/30">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-card border border-border">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gradient-ocean rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-heading">{profile?.full_name || 'Set your name'}</h1>
                                <p className="text-muted-foreground">{user?.email}</p>
                                <div className="mt-1 flex gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                        {profile?.role?.toUpperCase()}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary">
                                        {profile?.subscription_tier}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:text-red-600 hover:bg-red-50 self-start md:self-center">
                            Sign Out
                        </Button>
                    </div>

                    {/* Tab Strip — scrollable on small screens */}
                    <div className="bg-card rounded-2xl shadow-card border border-border overflow-x-auto">
                        <div className="flex items-center gap-1 p-2 min-w-max">
                            {[
                                { key: 'dashboard', label: 'Dashboard' },
                                ...(profile?.role === 'provider' ? [
                                    { key: 'moorings', label: 'My Moorings' },
                                    { key: 'calendar', label: 'Calendar' },
                                    { key: 'earnings', label: '💰 Earnings' },
                                    { key: 'spending', label: '💳 Spending' },
                                ] : []),
                                { key: 'affiliate', label: '🔗 Affiliate' },
                                { key: 'settings', label: '⚙️ Settings' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    {activeTab === 'settings' ? (
                        renderSettingsView()
                    ) : activeTab === 'moorings' ? (
                        <div className="mt-8 animate-fade-in">
                            <MooringList />
                        </div>
                    ) : activeTab === 'calendar' ? (
                        <div className="mt-8 animate-fade-in">
                            <ProviderCalendar />
                        </div>
                    ) : activeTab === 'earnings' ? (
                        <div className="mt-8 animate-fade-in">
                            <ProviderEarningsDashboard />
                        </div>
                    ) : activeTab === 'spending' ? (
                        <div className="mt-8 animate-fade-in">
                            <ProviderSpendingDashboard />
                        </div>
                    ) : activeTab === 'affiliate' ? (
                        <div className="mt-8 animate-fade-in">
                            <AffiliateDashboard />
                        </div>
                    ) : (
                        <>
                            {profile?.role === 'admin' && renderAdminView()}
                            {profile?.role === 'provider' && renderProviderView()}
                            {profile?.role === 'user' && (
                                <div className="mt-8 animate-fade-in">
                                    {renderUserTrips()}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
