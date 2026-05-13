import { memo } from "react";
import { ChevronRight, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdBannerProps {
  position: "top" | "sidebar" | "inline" | "footer";
  size?: "small" | "medium" | "large";
}

interface AdSlot {
  sponsorLabel: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  logo?: string;
  bg: string;
  accentColor: string;
}

const adSlots: Record<string, AdSlot> = {
  top: {
    sponsorLabel: "Sponsored",
    title: "Advertise Your Marina Here",
    description: "Reach 50,000+ sailors monthly — premium placement on the #1 Mediterranean mooring platform",
    cta: "Get Started",
    link: "mailto:ads@mooring-booking.com?subject=Ad%20Inquiry%20-%20Top%20Banner&body=Hi%2C%20I%27m%20interested%20in%20advertising%20on%20Mooring%20Booking.%20Please%20send%20me%20pricing%20details.",
    bg: "bg-gradient-to-r from-ocean/5 via-secondary/5 to-gold/5",
    accentColor: "bg-ocean",
  },
  sidebar: {
    sponsorLabel: "Ad",
    title: "Your Business Here",
    description: "Charter, marina, or marine gear? Reach sailors searching right now.",
    cta: "Advertise",
    link: "mailto:ads@mooring-booking.com?subject=Ad%20Inquiry%20-%20Sidebar&body=Hi%2C%20I%27m%20interested%20in%20sidebar%20advertising%20on%20Mooring%20Booking.",
    bg: "bg-gradient-to-r from-gold/5 to-secondary/5",
    accentColor: "bg-gold",
  },
  inline: {
    sponsorLabel: "Sponsored",
    title: "Promote Your Charter Fleet",
    description: "Targeted ads to verified boat owners — highest conversion in the Med",
    cta: "Learn More",
    link: "mailto:ads@mooring-booking.com?subject=Ad%20Inquiry%20-%20Inline&body=Hi%2C%20I%27m%20interested%20in%20inline%20advertising%20on%20Mooring%20Booking.",
    bg: "bg-gradient-to-r from-primary/5 to-accent/5",
    accentColor: "bg-primary",
  },
  footer: {
    sponsorLabel: "Sponsored",
    title: "Advertise to 50,000+ Mediterranean Sailors",
    description: "Premium ad placements for marinas, charter companies, marine equipment & nautical services",
    cta: "Contact Sales",
    link: "mailto:ads@mooring-booking.com?subject=Advertising%20Inquiry&body=Hi%2C%20I%27m%20interested%20in%20advertising%20on%20Mooring%20Booking.%20Please%20send%20me%20your%20media%20kit%20and%20pricing.",
    bg: "bg-gradient-to-r from-muted/80 to-secondary/10",
    accentColor: "bg-ocean",
  },
};

const sizeClasses = {
  small: "p-2.5 sm:p-3",
  medium: "p-3 sm:p-5",
  large: "p-4 sm:p-6",
};

const AdBanner = memo(({ position, size = "medium" }: AdBannerProps) => {
  const { t } = useTranslation();
  const ad = adSlots[position];

  return (
    <div
      className={`${ad.bg} border border-dashed border-border/60 rounded-xl ${sizeClasses[size]} hover:border-primary/30 hover:shadow-card transition-all group relative overflow-hidden`}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${ad.accentColor} rounded-l-xl opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* Sponsor label */}
      <span className="absolute top-1.5 right-2.5 text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium select-none">
        {ad.sponsorLabel}
      </span>

      <div className="flex items-center justify-between gap-4 pl-3">
        <div className="min-w-0 flex-1">
          {/* Ad icon + title */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${ad.accentColor}/10 border border-current/10 flex items-center justify-center flex-shrink-0`}>
              <Mail size={14} className="text-muted-foreground/60" />
            </div>
            <h4 className="font-heading font-semibold text-foreground text-sm truncate">
              {ad.title}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate pl-9">
            {ad.description}
          </p>
        </div>

        <a
          href={ad.link}
          className="flex-shrink-0 inline-flex items-center gap-1.5 bg-ocean text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-ocean/90 transition-colors shadow-sm"
        >
          {ad.cta}
          <ChevronRight size={14} />
        </a>
      </div>

      {/* Bottom stats bar — only on large */}
      {size === "large" && (
        <div className="flex items-center gap-4 mt-3 pl-12 text-[10px] text-muted-foreground/50">
          <span>50K+ {t("ad.monthlyVisitors", "monthly visitors")}</span>
          <span className="w-0.5 h-3 bg-border/40 rounded-full" />
          <span>15+ {t("ad.countries", "countries")}</span>
          <span className="w-0.5 h-3 bg-border/40 rounded-full" />
          <span>{t("ad.targetedReach", "Targeted sailor audience")}</span>
        </div>
      )}
    </div>
  );
});

AdBanner.displayName = "AdBanner";

export default AdBanner;
