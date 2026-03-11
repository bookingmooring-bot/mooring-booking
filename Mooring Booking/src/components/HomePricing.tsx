import { Check, Anchor, Crown, Ship, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HomePricing = () => {
  const { t } = useTranslation();

  const tiers = [
    {
      name: t('homePricing.basicName'),
      price: t('homePricing.basicPrice'),
      period: "",
      badge: t('homePricing.basicBadge'),
      badgeColor: "bg-secondary",
      icon: Anchor,
      description: t('homePricing.basicDesc'),
      features: [
        t('homePricing.basicFeature1'), t('homePricing.basicFeature2'), t('homePricing.basicFeature3'),
        t('homePricing.basicFeature4'), t('homePricing.basicFeature5'),
      ],
      cta: t('homePricing.basicCta'),
      popular: false,
    },
    {
      name: t('homePricing.premiumMonthlyName'),
      price: t('homePricing.premiumMonthlyPrice'),
      period: t('homePricing.premiumMonthlyPeriod'),
      badge: t('homePricing.premiumMonthlyBadge'),
      badgeColor: "bg-gold",
      icon: Ship,
      description: t('homePricing.premiumMonthlyDesc'),
      features: Array.from({ length: 14 }, (_, i) => t(`homePricing.premiumMonthlyFeature${i + 1}`)),
      cta: t('homePricing.premiumMonthlyCta'),
      popular: false,
    },
    {
      name: t('homePricing.premiumAnnualName'),
      price: t('homePricing.premiumAnnualPrice'),
      period: t('homePricing.premiumAnnualPeriod'),
      badge: t('homePricing.premiumAnnualBadge'),
      badgeColor: "bg-success",
      icon: Crown,
      description: t('homePricing.premiumAnnualDesc'),
      features: Array.from({ length: 8 }, (_, i) => t(`homePricing.premiumAnnualFeature${i + 1}`)),
      cta: t('homePricing.premiumAnnualCta'),
      popular: true,
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-4">
            <Crown size={16} /><span className="text-sm font-medium">{t('homePricing.sectionBadge')}</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{t('homePricing.sectionTitle')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('homePricing.sectionSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <div key={tier.name} className={`relative bg-card rounded-2xl p-6 shadow-card transition-all hover:shadow-hover ${tier.popular ? "ring-2 ring-success scale-105 z-10" : ""}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} /> {t('homePricing.mostPopular')}
                  </div>
                )}
                <div className={`inline-flex items-center gap-1 ${tier.badgeColor} text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4`}>{tier.badge}</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center"><IconComponent size={24} className="text-primary-foreground" /></div>
                  <h3 className="font-heading font-bold text-xl text-foreground">{tier.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="font-heading text-4xl font-bold text-primary">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground"><Check className="text-success flex-shrink-0 mt-0.5" size={14} /><span>{feature}</span></li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className={`w-full font-semibold ${tier.popular ? "bg-success hover:bg-success/90 text-white" : tier.name === t('homePricing.basicName') ? "bg-secondary hover:bg-secondary/90 text-white" : "bg-gradient-ocean text-white"}`}>{tier.cta}</Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/user-pricing" className="text-secondary hover:underline font-medium">{t('homePricing.viewComparison')}</Link>
        </div>
      </div>
    </section>
  );
};

export default HomePricing;