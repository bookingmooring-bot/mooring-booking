import { ChevronRight } from "lucide-react";

interface AdBannerProps {
  position: "top" | "sidebar" | "inline" | "footer";
  size?: "small" | "medium" | "large";
}

const adContent = {
  top: {
    title: "⚓ ACI Marina Split — 318 berths",
    description: "From €65/night · Fuel, Wi-Fi, restaurant, repair service & more",
    cta: "View Marina",
    link: "/explore?id=ebb3dcd0-0f53-42cd-b7f6-24309aa15e5f",
    bg: "bg-gradient-to-r from-secondary/10 to-primary/10",
  },
  sidebar: {
    title: "🏖️ Marina Kaštela — 429 berths",
    description: "From €70/night · Full service marina near Split",
    cta: "View Marina",
    link: "/explore?id=f00f7e82-92f2-458d-ac30-3a9ee022fb39",
    bg: "bg-gradient-to-r from-gold/10 to-secondary/10",
  },
  inline: {
    title: "⛵ Marina Stobreč — Split",
    description: "From €35/night · 100 berths · Fuel, Wi-Fi, security",
    cta: "View Marina",
    link: "/explore?id=5ac568d9-bfa2-4da4-94a5-b0e114454488",
    bg: "bg-gradient-to-r from-primary/10 to-accent/10",
  },
  footer: {
    title: "🧭 Explore 1,000+ Mediterranean Marinas",
    description: "Croatia, Italy, Greece, Spain, France, Turkey & more — find your perfect berth",
    cta: "Explore All",
    link: "/explore",
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
      <span className="absolute top-1 right-2 text-[9px] text-muted-foreground/50 uppercase tracking-wider">Featured</span>
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
          <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
};

export default AdBanner;
