import { useState, useEffect } from "react";
import { Star, Heart, MapPin, Waves, Zap, Wifi, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MooringDetailModal from "./MooringDetailModal";

interface MooringCardWithBookingProps {
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
  windProtection: 'excellent' | 'good' | 'moderate' | 'poor';
  amenities: string[];
  image: string;
  distance?: string;
  lat?: number;
  lng?: number;
  ownerName?: string;
  ownerPhone?: string;
  description?: string;
  winterStorage?: boolean;
  winterPriceMonthly?: number;
  /** Pre-selected dates from the Explorer search bar (YYYY-MM-DD) */
  initialCheckIn?: string;
  initialCheckOut?: string;
  autoOpenBooking?: boolean;
}

const amenityIcons: Record<string, React.ReactNode> = {
  water: <Droplets size={14} />,
  electricity: <Zap size={14} />,
  wifi: <Wifi size={14} />,
};

const windProtectionColors = {
  excellent: 'text-success',
  good: 'text-secondary',
  moderate: 'text-warning',
  poor: 'text-destructive',
};

const MooringCardWithBooking = ({
  id,
  name,
  location,
  country,
  countryFlag,
  rating,
  reviewCount,
  price,
  discountPercent,
  isLastMinute,
  isNow4Today,
  windProtection,
  amenities,
  image,
  distance,
  lat,
  lng,
  ownerName,
  ownerPhone,
  description,
  winterStorage,
  winterPriceMonthly,
  initialCheckIn,
  initialCheckOut,
  autoOpenBooking,
}: MooringCardWithBookingProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (autoOpenBooking) setIsDetailOpen(true);
  }, [autoOpenBooking]);
  const [isFavorite, setIsFavorite] = useState(false);

  const discountedPrice = discountPercent
    ? Math.round(price * (1 - discountPercent / 100))
    : price;

  const openDetail = () => {
    setIsDetailOpen(true);
  };

  return (
    <>
      <div className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300">
        {/* Image Container - Clickable → opens Detail */}
        <div
          className="relative aspect-[16/10] overflow-hidden cursor-pointer"
          onClick={openDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openDetail()}
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discountPercent && (
              <Badge className="bg-success text-success-foreground font-semibold">
                {discountPercent}% OFF
              </Badge>
            )}
            {isLastMinute && (
              <Badge className="bg-gold text-gold-foreground font-semibold">
                Now4Today +20%
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart
              size={18}
              className={cn(
                "transition-colors",
                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"
              )}
            />
          </button>

          {/* Country Flag */}
          <div className="absolute bottom-3 right-3 text-2xl drop-shadow-lg">
            {countryFlag}
          </div>
        </div>

        {/* Content - Also Clickable → opens Detail */}
        <div className="p-4 cursor-pointer" onClick={openDetail}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-heading font-semibold text-foreground line-clamp-1">
                {name}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin size={14} />
                <span>{location}, {country}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-gold text-gold" />
              <span className="font-semibold text-foreground">{rating}</span>
              <span className="text-muted-foreground text-sm">({reviewCount})</span>
            </div>
          </div>

          {/* Wind & Amenities */}
          <div className="flex items-center gap-4 mb-3">
            <div className={cn("flex items-center gap-1 text-sm", windProtectionColors[windProtection])}>
              <Waves size={14} />
              <span className="capitalize">{windProtection}</span>
            </div>
            <div className="flex items-center gap-2">
              {amenities.slice(0, 3).map((amenity) => (
                <span key={amenity} className="text-muted-foreground" title={amenity}>
                  {amenityIcons[amenity] || null}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-muted-foreground text-xs">+{amenities.length - 3}</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-baseline gap-2">
              {discountPercent && (
                <span className="text-muted-foreground text-sm line-through">€{price}</span>
              )}
              <span className="font-heading font-bold text-xl text-primary">€{discountedPrice}</span>
              <span className="text-muted-foreground text-sm">/night</span>
            </div>
            <Button
              size="sm"
              className="bg-gradient-ocean font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                openDetail();
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <MooringDetailModal
        mooring={{
          id,
          name,
          location,
          country,
          countryFlag,
          rating,
          reviewCount,
          price,
          discountPercent,
          isLastMinute,
          isNow4Today,
          windProtection,
          amenities,
          image,
          description,
          lat,
          lng,
          ownerName,
          ownerPhone,
          winterStorage,
          winterPriceMonthly,
        }}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
      />
    </>
  );
};

export default MooringCardWithBooking;