import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Anchor, Crown, Ship, Zap, Shield, Wifi, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTier } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const UserPricingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currentTier = getUserTier(profile);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    if (planId === currentTier) return; // already on this plan
    if (planId === 'basic') {
      setSelectedPlan(planId);
      return;
    }
    // For paid plans — require auth, then show placeholder
    if (!user) {
      toast({ title: t('userPricing.loginRequired', 'Please sign in first'), description: t('userPricing.loginRequiredDesc', 'You need an account to subscribe to a premium plan.') });
      navigate('/auth');
      return;
    }
    // Placeholder until Stripe is integrated (Phase 2D)
    toast({ title: t('userPricing.comingSoon', 'Coming Soon'), description: t('userPricing.stripeComingSoon', 'Online payment will be available soon. Contact us for early access!') });
    setSelectedPlan(planId);
  };

  const plans = [
    {
      id: "basic",
      name: t('homePricing.basicName'),
      duration: t('userPricing.freeForever'),
      price: 0,
      originalPrice: null as number | null,
      badge: t('homePricing.basicBadge'),
      badgeColor: "bg-secondary",
      description: t('userPricing.basicDesc'),
      features: [
        t('homePricing.basicFeature1'),
        t('homePricing.basicFeature2'),
        t('homePricing.basicFeature3'),
        t('homePricing.basicFeature4'),
        t('homePricing.basicFeature5'),
      ],
      popular: false,
      icon: Anchor,
      cta: t('userPricing.getStartedFree'),
    },
    {
      id: "premium-monthly",
      name: t('homePricing.premiumMonthlyName'),
      duration: t('userPricing.monthly'),
      price: 19.99,
      originalPrice: null as number | null,
      badge: t('homePricing.premiumMonthlyBadge'),
      badgeColor: "bg-gold",
      description: t('userPricing.premiumMonthlyDesc'),
      features: [
        t('homePricing.premiumMonthlyFeature1'),
        t('homePricing.premiumMonthlyFeature2'),
        t('homePricing.premiumMonthlyFeature3'),
        t('homePricing.premiumMonthlyFeature4'),
        t('homePricing.premiumMonthlyFeature5'),
        t('homePricing.premiumMonthlyFeature6'),
        t('homePricing.premiumMonthlyFeature7'),
        t('homePricing.premiumMonthlyFeature8'),
        t('homePricing.premiumMonthlyFeature9'),
        t('homePricing.premiumMonthlyFeature10'),
        t('homePricing.premiumMonthlyFeature11'),
        t('homePricing.premiumMonthlyFeature12'),
        t('homePricing.premiumMonthlyFeature13'),
        t('homePricing.premiumMonthlyFeature14'),
      ],
      popular: false,
      icon: Ship,
      cta: t('userPricing.subscribeNow'),
    },
    {
      id: "premium-annual",
      name: t('homePricing.premiumAnnualName'),
      duration: t('userPricing.billedAnnually'),
      price: 9.99,
      originalPrice: 19.99,
      badge: t('homePricing.premiumAnnualBadge'),
      badgeColor: "bg-success",
      description: t('userPricing.premiumAnnualDesc'),
      features: [
        t('homePricing.premiumAnnualFeature1'),
        t('homePricing.premiumAnnualFeature2'),
        t('homePricing.premiumAnnualFeature3'),
        t('homePricing.premiumAnnualFeature4'),
        t('homePricing.premiumAnnualFeature5'),
        t('homePricing.premiumAnnualFeature6'),
        t('homePricing.premiumAnnualFeature7'),
        t('homePricing.premiumAnnualFeature8'),
      ],
      popular: true,
      icon: Crown,
      cta: t('userPricing.bestValueSubscribe'),
    },
  ];

  const comparisonFeatures = [
    { feature: t('homePricing.basicFeature1'), basic: true, premium: true },
    { feature: t('homePricing.basicFeature3'), basic: true, premium: true },
    { feature: t('homePricing.basicFeature2'), basic: "5/" + t('cookies.days', 'day'), premium: t('homePricing.premiumMonthlyFeature1') },
    { feature: t('homePricing.premiumMonthlyFeature2'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature3'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature4'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature7'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature5'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature6'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature9'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature10'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature11'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature12'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature14'), basic: false, premium: true },
    { feature: t('homePricing.premiumMonthlyFeature13'), basic: false, premium: true },
    { feature: t('homePricing.premiumAnnualFeature3'), basic: false, premium: t('userPricing.annual') },
    { feature: t('homePricing.premiumAnnualFeature7'), basic: false, premium: t('userPricing.annual') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 right-10 opacity-10 animate-float">
            <Ship size={100} className="text-gold" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-6">
                <Crown size={16} />
                <span className="text-sm font-medium">{t('userPricing.chooseYourPlan')}</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                {t('userPricing.heroTitle')}
                <span className="block text-gold">{t('userPricing.heroHighlight')}</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                {t('userPricing.heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-card rounded-2xl p-6 shadow-card transition-all hover:shadow-hover ${plan.popular ? 'ring-2 ring-success scale-105 z-10' : ''
                      } ${plan.id === currentTier ? 'ring-2 ring-secondary' : ''}`}
                  >
                    {plan.id === currentTier && user && (
                      <div className="absolute -top-3 right-4 bg-secondary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Check size={12} />
                        {t('userPricing.currentPlan', 'Current Plan')}
                      </div>
                    )}
                    <div className={`inline-flex items-center gap-1 ${plan.badgeColor} text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4`}>
                      {plan.popular && <Star size={12} />}
                      {plan.badge}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center">
                        <IconComponent size={24} className="text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-foreground">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.duration}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        {plan.originalPrice && (
                          <span className="text-muted-foreground line-through text-lg">€{plan.originalPrice}</span>
                        )}
                        <span className="font-heading text-4xl font-bold text-primary">
                          {plan.price === 0 ? t('homePricing.basicPrice') : `€${plan.price}`}
                        </span>
                        {plan.price > 0 && <span className="text-muted-foreground">{t('homePricing.premiumMonthlyPeriod')}</span>}
                      </div>
                      {plan.originalPrice && (
                        <span className="text-success text-sm font-medium">
                          {t('pricing.save50')}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="text-success flex-shrink-0 mt-0.5" size={14} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={plan.id === currentTier && !!user}
                      className={`w-full font-semibold ${plan.id === currentTier && user ? 'bg-muted text-muted-foreground cursor-default'
                        : plan.popular ? 'bg-success hover:bg-success/90'
                          : plan.id === 'basic' ? 'bg-secondary hover:bg-secondary/90'
                            : 'bg-gradient-ocean'
                        }`}
                    >
                      {plan.id === currentTier && user ? t('userPricing.currentPlan', 'Current Plan') : plan.cta}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Referral */}
            <div className="max-w-2xl mx-auto mt-12 text-center">
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 text-gold mb-2">
                  <Zap size={20} />
                  <span className="font-heading font-bold">{t('userPricing.referralBonus')}</span>
                </div>
                <p className="text-foreground">
                  {t('userPricing.referralText')} <span className="font-bold text-gold">{t('userPricing.referralDiscount')}</span> {t('userPricing.referralSuffix')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">
              {t('userPricing.comparisonTitle')}
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-xl overflow-hidden shadow-card">
                <table className="w-full">
                  <thead className="bg-gradient-ocean text-primary-foreground">
                    <tr>
                      <th className="text-left p-4 font-heading font-semibold">{t('userPricing.feature')}</th>
                      <th className="text-center p-4 font-heading font-semibold">{t('userPricing.basicFree')}</th>
                      <th className="text-right p-4 font-heading font-semibold pr-8">{t('userPricing.premium')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, index) => (
                      <tr key={row.feature} className={index % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                        <td className="p-4 text-foreground text-sm">{row.feature}</td>
                        <td className="p-4 text-center">
                          {row.basic === true ? (
                            <Check className="text-success mx-auto" size={18} />
                          ) : row.basic === false ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="text-warning text-sm">{row.basic}</span>
                          )}
                        </td>
                        <td className="p-4 text-right pr-8">
                          {row.premium === true ? (
                            <Check className="text-success ml-auto" size={18} />
                          ) : typeof row.premium === 'string' ? (
                            <span className="text-gold text-sm font-medium">{row.premium}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Offline */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
              <Wifi size={16} />
              <span className="text-sm font-medium">{t('userPricing.offlineTitle')}</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              {t('userPricing.offlineHeading')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('userPricing.offlineText')}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-ocean">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-6">
              {t('userPricing.ctaTitle')}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              {t('userPricing.ctaSubtitle')}
            </p>
            <Button
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14"
              onClick={() => handleSelectPlan('basic')}
            >
              <Zap className="mr-2" size={20} />
              {t('userPricing.getStartedFree')}
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserPricingPage;