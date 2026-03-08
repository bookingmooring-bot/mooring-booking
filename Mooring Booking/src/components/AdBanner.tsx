import { ExternalLink } from "lucide-react";

interface AdBannerProps {
  position: "top" | "sidebar" | "inline" | "footer";
  size?: "small" | "medium" | "large";
}

const adContent = {
  top: {
    title: "⛵ Premium Sailing Gear",
    description: "Get 20% off with code MOORING20",
    cta: "Shop Now",
    link: "#ad-sailing-gear",
    bg: "bg-gradient-to-r from-secondary/10 to-primary/10",
  },
  sidebar: {
    title: "🏖️ Marina Insurance",
    description: "Protect your vessel from €9.99/mo",
    cta: "Get Quote",
    link: "#ad-insurance",
    bg: "bg-gradient-to-r from-gold/10 to-secondary/10",
  },
  inline: {
    title: "📱 Download Our App",
    description: "Book moorings on the go. Available on iOS & Android.",
    cta: "Download",
    link: "#ad-app-download",
    bg: "bg-gradient-to-r from-primary/10 to-accent/10",
  },
  footer: {
    title: "🧭 Yacht Charter Partners",
    description: "Explore the Mediterranean with our trusted charter partners",
    cta: "Explore",
    link: "#ad-charter",
    bg: "bg-gradient-to-r from-muted to-secondary/5",
  },
};

const AdBanner = ({ position, size = "medium" }: AdBannerProps) => {
  const ad = adContent[position];
  
  const handleClick = () => {
    // Track ad click for revenue
    console.log(`[Ad Analytics] Click: ${position} banner - ${ad.title}`);
  };

  const sizeClasses = {
    small: "p-2 text-xs",
    medium: "p-3 sm:p-4",
    large: "p-4 sm:p-6",
  };

  return (
    <div 
      className={`${ad.bg} border border-border/50 rounded-lg ${sizeClasses[size]} cursor-pointer hover:shadow-card transition-all group relative`}
      onClick={handleClick}
    >
      <span className="absolute top-1 right-2 text-[9px] text-muted-foreground/50 uppercase tracking-wider">Ad</span>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-heading font-semibold text-foreground text-sm truncate">{ad.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{ad.description}</p>
        </div>
        <a 
          href={ad.link} 
          className="flex-shrink-0 inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-secondary/90 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {ad.cta}
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default AdBanner;
