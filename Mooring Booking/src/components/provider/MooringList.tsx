import { useState } from "react";
import { useProviderMoorings, useToggleMooringStatus, useUpdateMooringAddons } from "@/hooks/useMoorings";
import { Loader2, Plus, Edit, Eye, Power, PowerOff, Info, Crown, Megaphone, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Mooring } from "@/data/moorings";

// ── Info descriptions for each add-on ──────────────────────────────────────
const ADDON_INFO = {
    now4today: "Enables same-day bookings (01:00 AM – 23:00 PM today). The nightly price automatically increases by 20%. Platform commission is calculated on the full increased amount.",
    marketing: "Get your unique QR code and personalized affiliate link. Share them on social media to drive more traffic and earn referral bonuses.",
    premium: "Your mooring appears first in all search results, giving you significantly more visibility and bookings compared to standard listings.",
    insurance: "Third-party liability protection and mooring security mediation. Covers damage disputes between boat owners and mooring providers.",
} as const;

// ── Single add-on row ───────────────────────────────────────────────────────
interface AddonRowProps {
    icon: React.ReactNode;
    label: string;
    badge: string;
    badgeColor: string;
    info: string;
    checked: boolean;
    disabled: boolean;
    onToggle: (val: boolean) => void;
}

const AddonRow = ({ icon, label, badge, badgeColor, info, checked, disabled, onToggle }: AddonRowProps) => {
    const [showInfo, setShowInfo] = useState(false);
    return (
        <div className="relative">
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors group">
                {/* Left: icon + label + badge */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-muted-foreground shrink-0">{icon}</span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium">{label}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badgeColor}`}>
                                {badge}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Right: info button + toggle */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                        type="button"
                        onClick={() => setShowInfo(v => !v)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                        title="Info"
                    >
                        <Info size={14} />
                    </button>
                    <Switch
                        checked={checked}
                        onCheckedChange={onToggle}
                        disabled={disabled}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
            </div>
            {/* Expandable info tooltip */}
            {showInfo && (
                <div className="mx-3 mb-1 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    {info}
                </div>
            )}
        </div>
    );
};

// ── Main component ──────────────────────────────────────────────────────────
const MooringList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: moorings, isLoading } = useProviderMoorings(user?.id);
    const toggleStatus = useToggleMooringStatus();
    const updateAddons = useUpdateMooringAddons();

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        if (!user) return;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const actionText = newStatus === 'active' ? 'activate' : 'deactivate';

        if (window.confirm(`Are you sure you want to ${actionText} this mooring?`)) {
            try {
                await toggleStatus.mutateAsync({ id, status: newStatus, providerId: user.id });
                toast({
                    title: `Mooring ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
                    description: `The mooring has been successfully ${newStatus === 'active' ? 'activated' : 'deactivated'}.`
                });
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || `Failed to ${actionText} mooring.`,
                    variant: "destructive"
                });
            }
        }
    };

    const handleAddonToggle = async (mooring: Mooring, field: string, value: boolean) => {
        if (!user) return;
        try {
            await updateAddons.mutateAsync({
                id: mooring.id,
                providerId: user.id,
                [field]: value,
            });
            toast({
                title: "Add-On Updated",
                description: `Setting saved successfully.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update add-on.",
                variant: "destructive"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={24} />
            </div>
        );
    }

    if (!moorings || moorings.length === 0) {
        return (
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="text-muted-foreground" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">No Moorings Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You haven't added any moorings to your portfolio. Start by creating your first listing.
                </p>
                <Button onClick={() => navigate('/add-mooring')} className="bg-gradient-ocean">
                    <Plus size={18} className="mr-2" /> Add Your First Mooring
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h3 className="font-bold text-lg">Your Portfolio</h3>
                    <p className="text-muted-foreground text-sm">Manage your {moorings.length} mooring{moorings.length > 1 ? 's' : ''}</p>
                </div>
                <Button onClick={() => navigate('/add-mooring')} className="bg-gradient-ocean hidden sm:flex">
                    <Plus size={18} className="mr-2" /> Add New Mooring
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {moorings.map((mooring) => {
                    const addonBusy = updateAddons.isPending;
                    return (
                        <div key={mooring.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Top: image + info */}
                            <div className="flex flex-col sm:flex-row">
                                <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted shrink-0">
                                    {mooring.image ? (
                                        <img src={mooring.image} alt={mooring.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="text-xl font-bold">{mooring.name}</h4>
                                                {mooring.status === 'pending' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100/50 text-yellow-800 border border-yellow-200">
                                                        Pending Review
                                                    </span>
                                                )}
                                                {mooring.status === 'active' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100/50 text-green-800 border border-green-200">
                                                        Live
                                                    </span>
                                                )}
                                                {mooring.status === 'inactive' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100/50 text-gray-800 border border-gray-200">
                                                        Inactive
                                                    </span>
                                                )}
                                                {mooring.status === 'rejected' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100/50 text-red-800 border border-red-200">
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground">{mooring.location}, {mooring.country}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-primary">€{mooring.price}</div>
                                            <div className="text-xs text-muted-foreground">per night</div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/explore?search=${encodeURIComponent(mooring.name)}`)}>
                                            <Eye size={16} className="mr-2" /> View
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/edit-mooring/${mooring.id}`)}>
                                            <Edit size={16} className="mr-2" /> Edit
                                        </Button>
                                        {(mooring.status === 'active' || mooring.status === 'inactive') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleStatus(mooring.id, mooring.status!)}
                                                disabled={toggleStatus.isPending}
                                                className={mooring.status === 'active'
                                                    ? "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                                    : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                }
                                            >
                                                {mooring.status === 'active' ? (
                                                    <><PowerOff size={16} className="mr-2" /> Deactivate</>
                                                ) : (
                                                    <><Power size={16} className="mr-2" /> Activate</>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Premium Add-Ons section ────────────────────────── */}
                            <div className="border-t border-border bg-muted/20">
                                <div className="px-4 pt-3 pb-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Crown size={13} className="text-amber-500" />
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Premium Add-Ons
                                        </span>
                                    </div>
                                </div>
                                <div className="px-2 pb-2 space-y-0">
                                    <AddonRow
                                        icon={<Zap size={15} />}
                                        label="Now4Today"
                                        badge="+20% surcharge"
                                        badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                        info={ADDON_INFO.now4today}
                                        checked={mooring.isNow4Today ?? false}
                                        disabled={addonBusy}
                                        onToggle={(v) => handleAddonToggle(mooring, 'is_now4today', v)}
                                    />
                                    <AddonRow
                                        icon={<Megaphone size={15} />}
                                        label="Marketing Tools"
                                        badge="€5/mo"
                                        badgeColor="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                        info={ADDON_INFO.marketing}
                                        checked={mooring.isMarketingTools ?? false}
                                        disabled={addonBusy}
                                        onToggle={(v) => handleAddonToggle(mooring, 'marketing_tools', v)}
                                    />
                                    <AddonRow
                                        icon={<Crown size={15} />}
                                        label="Premium Listing"
                                        badge="€9.99/mo"
                                        badgeColor="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                        info={ADDON_INFO.premium}
                                        checked={mooring.isPremiumListing ?? false}
                                        disabled={addonBusy}
                                        onToggle={(v) => handleAddonToggle(mooring, 'is_premium_listing', v)}
                                    />
                                    <AddonRow
                                        icon={<Shield size={15} />}
                                        label="Mooring Insurance"
                                        badge="€9.99/yr"
                                        badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        info={ADDON_INFO.insurance}
                                        checked={mooring.isMooringInsurance ?? false}
                                        disabled={addonBusy}
                                        onToggle={(v) => handleAddonToggle(mooring, 'insurance_mediation', v)}
                                    />
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

            <Button onClick={() => navigate('/add-mooring')} className="w-full bg-gradient-ocean sm:hidden mt-4">
                <Plus size={18} className="mr-2" /> Add New Mooring
            </Button>
        </div>
    );
};

export default MooringList;
