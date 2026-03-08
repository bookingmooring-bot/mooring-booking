import { Star, Heart, MapPin, Waves, Zap, Wifi, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MooringCardProps {
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
  windProtection: 'excellent' | 'good' | 'moderate' | 'poor';
  amenities: string[];
  image: string;
  distance?: string;
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

const MooringCard = ({
  name,
  location,
  country,
  countryFlag,
  rating,
  reviewCount,
  price,
  discountPercent,
  isLastMinute,
  windProtection,
  amenities,
  image,
  distance,
}: MooringCardProps) => {
  const discountedPrice = discountPercent 
    ? Math.round(price * (1 - discountPercent / 100)) 
    : price;

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
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
            <Badge className="bg-warning text-warning-foreground font-semibold">
              Last Minute
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors">
          <Heart size={18} className="text-muted-foreground hover:text-destructive transition-colors" />
        </button>

        {/* Country Flag */}
        <div 
          className="absolute bottom-3 right-3 text-2xl drop-shadow-lg"
          style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, sans-serif' }}
        >
          {countryFlag}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
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
          {distance && (
            <span className="text-sm text-secondary font-medium">{distance}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MooringCard;
