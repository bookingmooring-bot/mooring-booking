import { Check, Anchor, Crown, Ship, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    badge: "Free Forever",
    badgeColor: "bg-secondary",
    icon: Anchor,
    features: [
      "Browse all moorings",
      "Basic weather data",
      "10 AI Captain questions/day",
      "Email support",
      "Book moorings (service fee applies)",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Sailor",
    price: "€19.99",
    period: "/mo",
    badge: "Most Popular",
    badgeColor: "bg-blue-500",
    icon: Ship,
    features: [
      "Everything in Basic + AI-Only",
      "Unlimited AI Captain",
      "Offline maps & charts",
      "Priority booking",
      "Ad-free experience",
      "No service fee (boats ≤12m)",
      "Storm alerts & 7-day forecast",
    ],
    cta: "Subscribe Now",
    popular: true,
  },
  {
    name: "Captain",
    price: "€34.99",
    period: "/mo",
    badge: "Best Value",
    badgeColor: "bg-gold",
    icon: Crown,
    features: [
      "Everything in Sailor",
      "No service fee (any boat size)",
      "Analytics dashboard",
      "Charter tools",
      "Dedicated account manager",
      "Marina discounts",
      "Loyalty 2x points",
    ],
    cta: "Subscribe Now",
    popular: false,
  },
];

const HomePricing = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-4">
            <Crown size={16} />
            <span className="text-sm font-medium">Pricing Plans</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Sailing Plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From free browsing to full-service captaining — pick the tier that fits your voyage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative bg-card rounded-2xl p-6 shadow-card transition-all hover:shadow-hover ${
                  tier.popular ? "ring-2 ring-blue-500 scale-105 z-10" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} /> Most Popular
                  </div>
                )}
                <div className={`inline-flex items-center gap-1 ${tier.badgeColor} text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4`}>
                  {tier.badge}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center">
                    <IconComponent size={24} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground">{tier.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="font-heading text-4xl font-bold text-primary">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="text-success flex-shrink-0 mt-0.5" size={14} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button
                    className={`w-full font-semibold ${
                      tier.popular
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : tier.name === "Basic"
                          ? "bg-secondary hover:bg-secondary/90"
                          : "bg-gradient-ocean"
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <Link to="/user-pricing" className="text-purple-500 hover:underline">
              Looking for AI-only features? See the AI-Only plan →
            </Link>
            <Link to="/user-pricing" className="text-muted-foreground hover:underline">
              Enterprise fleet? Check out Charter Fleet plan →
            </Link>
          </div>
          <Link to="/user-pricing" className="text-secondary hover:underline font-medium block mt-4">
            View full comparison →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePricing;
