import { useState } from "react";
import {
    X,
    Star,
    MapPin,
    Waves,
    Zap,
    Wifi,
    Droplets,
    Anchor,
    Phone,
    Navigation,
    Heart,
    Snowflake,
    Utensils,
    ShowerHead,
    Fuel,
    Toilet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BookingModal from "./BookingModal";
import type { MooringLayer } from "@/lib/mooringLayer";
import { getLayerBadge, getBookingMode, getLayerDisclaimer } from "@/lib/mooringLayer";
import { openNavigation } from "@/lib/navigation";
import { useProfile } from "@/hooks/useProfile";
import MooringImagePlaceholder from "./MooringImagePlaceholder";

interface MooringDetailModalProps {
    mooring: {
        id: string;
        name: string;
        location: string;
        country: string;
        countryFlag: string;
        rating: number;
        reviewCount: number;
        price: number;
        discountPercent?: number;
        isLastMinute?: boolean;
        isNow4Today?: boolean;
        windProtection: "excellent" | "good" | "moderate" | "poor";
        amenities: string[];
        image: string;
        description?: string;
        lat?: number;
        lng?: number;
        ownerName?: string;
        ownerPhone?: string;
        winterStorage?: boolean;
        winterPriceMonthly?: number;
        mooringLayer?: MooringLayer;
        ownerId?: string;
    };
    isOpen: boolean;
    onClose: () => void;
    initialCheckIn?: string;
    initialCheckOut?: string;
}

const amenityConfig: Record<
    string,
    { icon: React.ReactNode; label: string }
> = {
    water: { icon: <Droplets size={18} />, label: "Fresh Water" },
    electricity: { icon: <Zap size={18} />, label: "Shore Power" },
    wifi: { icon: <Wifi size={18} />, label: "Wi-Fi" },
    shower: { icon: <ShowerHead size={18} />, label: "Shower" },
    toilet: { icon: <Toilet size={18} />, label: "WC / Toilet" },
    fuel: { icon: <Fuel size={18} />, label: "Fuel Station" },
    restaurant: { icon: <Utensils size={18} />, label: "Restaurant" },
};

const windProtectionConfig = {
    excellent: {
        label: "Excellent Protection",
        color: "text-success",
        bg: "bg-success/10 border-success/30",
        bars: 4,
    },
    good: {
        label: "Good Protection",
        color: "text-secondary",
        bg: "bg-secondary/10 border-secondary/30",
        bars: 3,
    },
    moderate: {
        label: "Moderate Protection",
        color: "text-warning",
        bg: "bg-warning/10 border-warning/30",
        bars: 2,
    },
    poor: {
        label: "Poor Protection",
        color: "text-destructive",
        bg: "bg-destructive/10 border-destructive/30",
        bars: 1,
    },
};

const MooringDetailModal = ({
    mooring,
    isOpen,
    onClose,
    initialCheckIn,
    initialCheckOut,
}: MooringDetailModalProps) => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const { data: profile } = useProfile();
    const layer = mooring.mooringLayer || 'premium';
    const bookingMode = getBookingMode(layer, profile);
    const layerBadge = getLayerBadge(layer);
    const disclaimer = getLayerDisclaimer(layer);

    if (!isOpen) return null;

    const discountedPrice = mooring.discountPercent
        ? Math.round(mooring.price * (1 - mooring.discountPercent / 100))
        : mooring.price;

    const windCfg = windProtectionConfig[mooring.windProtection];

    const handleBookNow = () => {
        setIsBookingOpen(true);
    };

    const handleBookingClose = () => {
        setIsBookingOpen(false);
    };

    // If booking opens, render BookingModal on top (detail modal stays mounted)
    if (isBookingOpen) {
        return (
            <BookingModal
                mooring={{
                    id: mooring.id,
                    name: mooring.name,
                    location: mooring.location,
                    country: mooring.country,
                    price: mooring.price,
                    discountPercent: mooring.discountPercent,
                    isNow4Today: mooring.isNow4Today,
                    image: mooring.image,
                    lat: mooring.lat,
                    lng: mooring.lng,
                    ownerName: mooring.ownerName,
                    ownerPhone: mooring.ownerPhone,
                    ownerId: mooring.ownerId,
                }}
                isOpen={true}
                onClose={() => {
                    handleBookingClose();
                    onClose();
                }}
                initialCheckIn={initialCheckIn}
                initialCheckOut={initialCheckOut}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card rounded-2xl shadow-hover w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-fade-in">
                {/* Hero Image */}
                <div className="relative aspect-[16/8] overflow-hidden rounded-t-2xl">
                    {mooring.image ? (
                        <img
                            src={mooring.image}
                            alt={mooring.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <MooringImagePlaceholder name={mooring.name} />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Top actions */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className={cn("font-semibold shadow", layerBadge.bgColor, layerBadge.color)}>
                            {layer === 'premium' && '⭐ '}{layerBadge.label}
                        </Badge>
                        {mooring.discountPercent && (
                            <Badge className="bg-success text-success-foreground font-semibold shadow">
                                {mooring.discountPercent}% OFF
                            </Badge>
                        )}
                        {mooring.isLastMinute && (
                            <Badge className="bg-gold text-gold-foreground font-semibold shadow">
                                ⚡ Now4Today +20%
                            </Badge>
                        )}
                    </div>

                    <button
                        className="absolute top-3 right-12 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
                        onClick={() => setIsFavorite(!isFavorite)}
                    >
                        <Heart
                            size={18}
                            className={cn(
                                "transition-colors",
                                isFavorite
                                    ? "fill-destructive text-destructive"
                                    : "text-muted-foreground hover:text-destructive"
                            )}
                        />
                    </button>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
                    >
                        <X size={18} className="text-foreground" />
                    </button>

                    {/* Bottom info overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="font-heading text-xl sm:text-2xl font-bold text-white drop-shadow">
                                    {mooring.name}
                                </h2>
                                <div className="flex items-center gap-1.5 text-white/90 text-sm mt-0.5">
                                    <MapPin size={13} />
                                    <span>
                                        {mooring.location}, {mooring.country}
                                    </span>
                                    <span className="text-lg ml-1">{mooring.countryFlag}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <Star size={14} className="fill-gold text-gold" />
                                <span className="font-semibold text-white text-sm">
                                    {mooring.rating}
                                </span>
                                <span className="text-white/70 text-xs">
                                    ({mooring.reviewCount})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-5">
                    {/* Price row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            {mooring.discountPercent && (
                                <span className="text-muted-foreground text-sm line-through">
                                    €{mooring.price}
                                </span>
                            )}
                            <span className="font-heading font-bold text-3xl text-primary">
                                €{discountedPrice}
                            </span>
                            <span className="text-muted-foreground text-sm">/night</span>
                        </div>
                        {mooring.winterStorage && mooring.winterPriceMonthly && (
                            <div className="flex items-center gap-1.5 text-secondary text-sm font-medium">
                                <Snowflake size={14} />
                                <span>Winter: €{mooring.winterPriceMonthly}/mo</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {mooring.description && (
                        <div>
                            <h3 className="font-heading font-semibold text-foreground mb-1.5">
                                About this mooring
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {mooring.description}
                            </p>
                        </div>
                    )}

                    {/* Wind Protection */}
                    <div>
                        <h3 className="font-heading font-semibold text-foreground mb-2">
                            Wind Protection
                        </h3>
                        <div
                            className={cn(
                                "flex items-center gap-3 border rounded-lg px-4 py-3",
                                windCfg.bg
                            )}
                        >
                            <Waves size={20} className={windCfg.color} />
                            <span className={cn("font-medium text-sm", windCfg.color)}>
                                {windCfg.label}
                            </span>
                            {/* Visual bars */}
                            <div className="flex gap-1 ml-auto">
                                {[1, 2, 3, 4].map((bar) => (
                                    <div
                                        key={bar}
                                        className={cn(
                                            "w-2 h-4 rounded-sm",
                                            bar <= windCfg.bars ? windCfg.color.replace("text-", "bg-") : "bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    {mooring.amenities.length > 0 && (
                        <div>
                            <h3 className="font-heading font-semibold text-foreground mb-2">
                                Amenities & Services
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {mooring.amenities.map((amenity) => {
                                    const cfg = amenityConfig[amenity];
                                    return (
                                        <div
                                            key={amenity}
                                            className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5"
                                        >
                                            <span className="text-secondary">
                                                {cfg?.icon ?? <Anchor size={18} />}
                                            </span>
                                            <span className="text-sm font-medium text-foreground">
                                                {cfg?.label ?? amenity}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Location info */}
                    <div>
                        <h3 className="font-heading font-semibold text-foreground mb-2">
                            Location
                        </h3>
                        <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Navigation size={15} className="text-secondary" />
                                {mooring.lat && mooring.lng ? (
                                    <span className="font-mono">
                                        {mooring.lat.toFixed(4)}°N,{" "}
                                        {mooring.lng.toFixed(4)}°E
                                    </span>
                                ) : (
                                    <span>{mooring.location}, {mooring.country}</span>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                🔒 Full coords after booking
                            </span>
                        </div>
                    </div>

                    {/* Owner info (teaser) */}
                    {mooring.ownerName && (
                        <div>
                            <h3 className="font-heading font-semibold text-foreground mb-2">
                                Mooring Owner
                            </h3>
                            <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                                        <Anchor size={16} className="text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">
                                            {mooring.ownerName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Verified provider
                                        </p>
                                    </div>
                                </div>
                                {mooring.ownerPhone && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                        <Phone size={13} />
                                        <span className="font-mono tracking-wider blur-sm select-none">
                                            {mooring.ownerPhone.replace(/\d(?=\d{4})/g, "•")}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 text-center">
                                Full contact details unlocked after booking
                            </p>
                        </div>
                    )}

                    {/* Winter storage */}
                    {mooring.winterStorage && (
                        <div className="bg-secondary/10 border border-secondary/30 rounded-lg px-4 py-3 flex items-start gap-3">
                            <Snowflake size={18} className="text-secondary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-secondary text-sm">
                                    Winter Storage Available
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Safe storage for the off-season
                                    {mooring.winterPriceMonthly
                                        ? ` — €${mooring.winterPriceMonthly}/month`
                                        : ""}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Disclaimer for concierge/explore */}
                {disclaimer && (
                    <div className={cn(
                        "mx-4 sm:mx-6 mb-2 rounded-lg p-3 text-xs text-muted-foreground border",
                        layer === 'explore'
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                            : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                    )}>
                        {disclaimer}
                    </div>
                )}

                {/* Sticky footer CTA */}
                <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Close
                    </Button>
                    {bookingMode === 'instant' && (
                        <Button
                            onClick={handleBookNow}
                            className="flex-1 bg-gradient-ocean font-semibold text-base"
                        >
                            <Anchor size={18} className="mr-2" />
                            Book Now
                        </Button>
                    )}
                    {bookingMode === 'concierge' && (
                        <Button
                            onClick={handleBookNow}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base"
                        >
                            <Phone size={18} className="mr-2" />
                            Request Booking
                        </Button>
                    )}
                    {bookingMode === 'none' && mooring.lat && mooring.lng && (
                        <Button
                            onClick={() => openNavigation({ lat: mooring.lat!, lng: mooring.lng!, label: mooring.name })}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base"
                        >
                            <Navigation size={18} className="mr-2" />
                            Navigate
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MooringDetailModal;
