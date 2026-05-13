import { Link } from "react-router-dom";
import { Star, Phone, Compass, Loader2, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import MooringCardWithBooking from "./MooringCardWithBooking";
import { useMoorings } from "@/hooks/useMoorings";
import { getLayerDisclaimer } from "@/lib/mooringLayer";
import type { MooringLayer } from "@/lib/mooringLayer";
import type { Mooring } from "@/data/moorings";

const layerConfig: Record<MooringLayer, {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
}> = {
  premium: {
    icon: <Star className="text-gold" size={24} />,
    title: "Premium Partners",
    subtitle: "Verified marinas, buoy fields & berths with live availability — book instantly.",
    accent: "text-gold",
    bg: "bg-background",
  },
  concierge: {
    icon: <Phone className="text-blue-500" size={24} />,
    title: "Captain's Concierge",
    subtitle: "Your AI Captain sends a booking request on your behalf — you relax, we handle the rest.",
    accent: "text-blue-500",
    bg: "bg-muted",
  },
  explore: {
    icon: <Compass className="text-emerald-500" size={24} />,
    title: "Open Chart — Explore & Navigate",
    subtitle: "Anchorages, coves, piers and natural harbours mapped for your passage — explore freely, navigate safely.",
    accent: "text-emerald-500",
    bg: "bg-background",
  },
};

const LayerSection = ({ layer, moorings }: { layer: MooringLayer; moorings: Mooring[] }) => {
  const config = layerConfig[layer];
  const disclaimer = getLayerDisclaimer(layer);
  if (moorings.length === 0) return null;

  return (
    <section className={`py-16 ${config.bg}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-1">
          {config.icon}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {config.title}
          </h2>
        </div>
        <p className={`${config.accent} font-medium mb-8`}>{config.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...moorings].sort((a, b) => {
            const now = Date.now();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            const aNew = a.createdAt && (now - new Date(a.createdAt).getTime()) < sevenDays ? 1 : 0;
            const bNew = b.createdAt && (now - new Date(b.createdAt).getTime()) < sevenDays ? 1 : 0;
            if (bNew !== aNew) return bNew - aNew;
            return (b.image ? 1 : 0) - (a.image ? 1 : 0);
          }).slice(0, 6).map((mooring) => (
            <MooringCardWithBooking
              key={mooring.id}
              id={mooring.id}
              name={mooring.name}
              location={mooring.location}
              country={mooring.country}
              countryFlag={mooring.countryFlag}
              rating={mooring.rating}
              reviewCount={mooring.reviewCount}
              price={mooring.price}
              discountPercent={mooring.discountPercent}
              isLastMinute={mooring.isLastMinute}
              isNow4Today={mooring.isNow4Today}
              windProtection={mooring.windProtection}
              amenities={mooring.amenities}
              image={mooring.image}
              distance={mooring.distance}
              lat={mooring.lat}
              lng={mooring.lng}
              ownerName={mooring.ownerName}
              ownerPhone={mooring.ownerPhone}
              description={mooring.description}
              winterStorage={mooring.winterStorage}
              mooringLayer={layer}
            />
          ))}
        </div>

        <div className={`mt-6 flex items-start gap-3 rounded-lg p-4 text-xs text-muted-foreground ${
          layer === 'explore'
            ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
            : layer === 'premium'
            ? 'bg-gold/5 border border-gold/20'
            : 'bg-card border'
        }`}>
          {layer === 'explore' && <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />}
          {layer === 'premium' && <ShieldCheck className="text-gold shrink-0 mt-0.5" size={16} />}
          {layer === 'concierge' && <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />}
          <p>{disclaimer}</p>
        </div>
      </div>
    </section>
  );
};

const ThreeLayerMoorings = () => {
  const { data: moorings, isLoading } = useMoorings();

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="flex justify-center flex-col items-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading moorings...</p>
        </div>
      </section>
    );
  }

  const all = moorings || [];
  const premium = all.filter((m) => m.mooringLayer === 'premium' || !m.mooringLayer);
  const concierge = all.filter((m) => m.mooringLayer === 'concierge');
  const explore = all.filter((m) => m.mooringLayer === 'explore');

  return (
    <>
      <LayerSection layer="premium" moorings={premium} />
      <LayerSection layer="concierge" moorings={concierge} />
      <LayerSection layer="explore" moorings={explore} />

      <div className="text-center py-6 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          💡 Our AI Captain can be your concierge — ask him to book on your behalf!
        </p>
      </div>

      <div className="text-center py-8 bg-background">
        <Link
          to="/explore"
          className="font-heading font-semibold text-secondary hover:text-primary transition-colors underline underline-offset-4"
        >
          Explore All Moorings →
        </Link>
      </div>
    </>
  );
};

export default ThreeLayerMoorings;
