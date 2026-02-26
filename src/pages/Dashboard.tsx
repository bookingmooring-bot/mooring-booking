import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserBookings, useProviderBookings } from "@/hooks/useBookings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Ship, Calendar, Settings, ShieldCheck, Save, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MooringList from "@/components/provider/MooringList";
import ProviderCalendar from "@/components/provider/ProviderCalendar";

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const { data: userBookings, isLoading: bookingsLoading } = useUserBookings();
    const { data: providerBookings, isLoading: providerBookingsLoading } = useProviderBookings();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'moorings' | 'calendar'>('dashboard');
    const [settingsForm, setSettingsForm] = useState({
        full_name: '',
        phone: '',
        boat_name: '',
        boat_length: '',
    });

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
                                <div className="flex flex-col items-start sm:items-end justify-between">
                                    {booking.booking_status === 'pending' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            Pending
                                        </span>
                                    ) : booking.booking_status === 'confirmed' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Confirmed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                            {booking.booking_status}
                                        </span>
                                    )}

                                    <div className="mt-4 sm:mt-0 text-left sm:text-right">
                                        <p className="text-sm text-muted-foreground">Total Price</p>
                                        <p className="text-xl font-bold">€{booking.total_price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Provider Interface
    const renderProviderView = () => {
        return (
            <div className="mt-8 space-y-8">
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
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end justify-between">
                                        {booking.booking_status === 'pending' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                Pending Action
                                            </span>
                                        ) : booking.booking_status === 'confirmed' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Confirmed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                {booking.booking_status}
                                            </span>
                                        )}

                                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                                            <p className="text-sm text-muted-foreground">Earnings (minus commission)</p>
                                            <p className="text-xl font-bold text-secondary">
                                                €{(booking.total_price - booking.commission_amount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card rounded-2xl p-6 shadow-card border border-border">
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
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <div className="bg-muted p-1 rounded-lg flex inline-flex">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard'
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Dashboard
                                </button>
                                {profile?.role === 'provider' && (
                                    <>
                                        <button
                                            onClick={() => setActiveTab('moorings')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'moorings'
                                                ? 'bg-background shadow text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            My Moorings
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('calendar')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'calendar'
                                                ? 'bg-background shadow text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            Calendar
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings'
                                        ? 'bg-background shadow text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Settings
                                </button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2">
                                Sign Out
                            </Button>
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
