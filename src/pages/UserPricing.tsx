import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Anchor, Crown, Ship, Zap, Wifi, Star, Loader2, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTier } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { cn } from "@/lib/utils";

const PRICE_IDS: Record<string, string | undefined> = {
  'ai-only-monthly': import.meta.env.VITE_STRIPE_PRICE_AI_ONLY_MONTHLY,
  'ai-only-annual': import.meta.env.VITE_STRIPE_PRICE_AI_ONLY_ANNUAL,
  'sailor-monthly': import.meta.env.VITE_STRIPE_PRICE_SAILOR_MONTHLY,
  'sailor-annual': import.meta.env.VITE_STRIPE_PRICE_SAILOR_ANNUAL,
  'captain-monthly': import.meta.env.VITE_STRIPE_PRICE_CAPTAIN_MONTHLY,
  'captain-annual': import.meta.env.VITE_STRIPE_PRICE_CAPTAIN_ANNUAL,
  'charter-fleet-monthly': import.meta.env.VITE_STRIPE_PRICE_CHARTER_FLEET_MONTHLY,
  'charter-fleet-annual': import.meta.env.VITE_STRIPE_PRICE_CHARTER_FLEET_ANNUAL,
};

interface PlanDef {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  icon: typeof Anchor;
  badgeColor: string;
  badge: string;
  popular: boolean;
  features: string[];
  cta: string;
  noBooking?: boolean;
}

const plans: PlanDef[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Anchor,
    badgeColor: 'bg-secondary',
    badge: 'Free Forever',
    popular: false,
    features: [
      'Browse all moorings',
      'Basic weather data',
      '10 AI Captain questions/day',
      'Email support',
      'Book moorings (service fee applies)',
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'ai-only',
    name: 'AI-Only',
    monthlyPrice: 7.99,
    annualPrice: 59,
    icon: Bot,
    badgeColor: 'bg-purple-500',
    badge: 'AI Power',
    popular: false,
    noBooking: true,
    features: [
      'Unlimited AI Captain',
      '7-day marine forecast',
      'Storm alerts & push notifications',
      'Maneuvering guides',
      'Turn-by-turn navigation',
      'Route planning',
      'Mayday protocols',
    ],
    cta: 'Subscribe',
  },
  {
    id: 'sailor',
    name: 'Sailor',
    monthlyPrice: 19.99,
    annualPrice: 149,
    icon: Ship,
    badgeColor: 'bg-blue-500',
    badge: 'Most Popular',
    popular: true,
    features: [
      'Everything in Basic + AI-Only',
      'Offline maps & charts',
      'Priority booking',
      'Ad-free experience',
      'Now4Today alerts',
      'Winter storage search',
      'No service fee (boats ≤12m)',
    ],
    cta: 'Subscribe',
  },
  {
    id: 'captain',
    name: 'Captain',
    monthlyPrice: 34.99,
    annualPrice: 259,
    icon: Crown,
    badgeColor: 'bg-gold',
    badge: 'Best Value',
    popular: false,
    features: [
      'Everything in Sailor',
      'Analytics dashboard',
      'Charter tools',
      'Dedicated account manager',
      'No service fee (any boat size)',
      'Early access to features',
      'Marina discounts',
      'Loyalty 2x points',
    ],
    cta: 'Subscribe',
  },
  {
    id: 'charter-fleet',
    name: 'Charter Fleet',
    monthlyPrice: 199,
    annualPrice: 1790,
    icon: Users,
    badgeColor: 'bg-secondary',
    badge: 'Enterprise',
    popular: false,
    features: [
      'Everything in Captain',
      'Multi-vessel management',
      'Bulk reservations',
      'Fleet analytics',
      'White-label charter pages',
      'Guest onboarding portal',
    ],
    cta: 'Subscribe',
  },
];

const comparisonRows = [
  { feature: 'AI Captain questions', basic: '10/day', aiOnly: 'Unlimited', sailor: 'Unlimited', captain: 'Unlimited', fleet: 'Unlimited' },
  { feature: 'Booking', basic: true, aiOnly: false, sailor: true, captain: true, fleet: true },
  { feature: 'Service fee (≤12m)', basic: '€12–19', aiOnly: '—', sailor: 'Free', captain: 'Free', fleet: 'Free' },
  { feature: 'Service fee (>12m)', basic: '€35–99', aiOnly: '—', sailor: '€35–99', captain: 'Free', fleet: 'Free' },
  { feature: '7-day marine forecast', basic: false, aiOnly: true, sailor: true, captain: true, fleet: true },
  { feature: 'Storm alerts', basic: false, aiOnly: true, sailor: true, captain: true, fleet: true },
  { feature: 'Maneuvering guides', basic: false, aiOnly: true, sailor: true, captain: true, fleet: true },
  { feature: 'Route planning', basic: false, aiOnly: true, sailor: true, captain: true, fleet: true },
  { feature: 'Offline maps', basic: false, aiOnly: false, sailor: true, captain: true, fleet: true },
  { feature: 'Priority booking', basic: false, aiOnly: false, sailor: true, captain: true, fleet: true },
  { feature: 'Ad-free', basic: false, aiOnly: false, sailor: true, captain: true, fleet: true },
  { feature: 'Analytics dashboard', basic: false, aiOnly: false, sailor: false, captain: true, fleet: true },
  { feature: 'Charter tools', basic: false, aiOnly: false, sailor: false, captain: true, fleet: true },
  { feature: 'Dedicated manager', basic: false, aiOnly: false, sailor: false, captain: true, fleet: true },
  { feature: 'Multi-vessel management', basic: false, aiOnly: false, sailor: false, captain: false, fleet: true },
  { feature: 'Fleet analytics', basic: false, aiOnly: false, sailor: false, captain: false, fleet: true },
  { feature: 'White-label pages', basic: false, aiOnly: false, sailor: false, captain: false, fleet: true },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="text-success mx-auto" size={18} />;
  if (value === false) return <span className="text-muted-foreground">—</span>;
  return <span className="text-sm font-medium">{value}</span>;
}

const UserPricingPage = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currentTier = getUserTier(profile);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const checkout = useStripeCheckout();

  const handleSelectPlan = (planId: string) => {
    if (planId === currentTier && !!user) return;
    if (planId === 'basic') return;

    if (!user) {
      toast({ title: 'Please sign in first', description: 'You need an account to subscribe.' });
      navigate('/auth');
      return;
    }

    const key = `${planId}-${billingPeriod}`;
    const priceId = PRICE_IDS[key];
    if (!priceId || priceId.startsWith('price_YOUR')) {
      toast({ title: 'Stripe not configured', description: 'Payment is not set up yet. Contact support.' });
      return;
    }

    setSelectedPlan(planId);
    checkout.mutate(
      { priceId, successPath: '/dashboard', cancelPath: '/user-pricing' },
      { onError: (err) => toast({ title: 'Payment error', description: err.message, variant: 'destructive' }) }
    );
  };

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
                <span className="text-sm font-medium">Choose Your Plan</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                Sail Smarter,
                <span className="block text-gold">Pay Less</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                From free browsing to full fleet management — pick the plan that fits your voyage.
              </p>
            </div>
          </div>
        </section>

        {/* Billing Toggle + Plan Cards */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <span className={cn('text-sm font-medium', billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(p => p === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-muted rounded-full transition-colors"
              >
                <span className={cn(
                  'absolute top-0.5 w-6 h-6 bg-primary rounded-full transition-transform',
                  billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-0.5'
                )} />
              </button>
              <span className={cn('text-sm font-medium', billingPeriod === 'annual' ? 'text-foreground' : 'text-muted-foreground')}>
                Annual
                <span className="ml-1.5 inline-flex items-center bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-semibold">
                  Save up to 38%
                </span>
              </span>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                const isCurrentPlan = plan.id === currentTier && !!user;
                const displayPrice = billingPeriod === 'annual' && plan.annualPrice > 0
                  ? (plan.annualPrice / 12).toFixed(2)
                  : plan.monthlyPrice;
                const billedNote = plan.monthlyPrice === 0
                  ? ''
                  : billingPeriod === 'annual'
                    ? `Billed €${plan.annualPrice}/year`
                    : 'Billed monthly';

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'relative bg-card rounded-2xl p-6 shadow-card transition-all hover:shadow-hover',
                      plan.popular && 'ring-2 ring-blue-500 scale-105 z-10',
                      isCurrentPlan && 'ring-2 ring-secondary'
                    )}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4 bg-secondary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Check size={12} /> Current Plan
                      </div>
                    )}
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={12} /> Most Popular
                      </div>
                    )}

                    <div className={`inline-flex items-center gap-1 ${plan.badgeColor} text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4`}>
                      {plan.badge}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center">
                        <IconComponent size={24} className="text-primary-foreground" />
                      </div>
                      <h3 className="font-heading font-bold text-foreground">{plan.name}</h3>
                    </div>

                    <div className="mb-1">
                      <span className="font-heading text-3xl font-bold text-primary">
                        {plan.monthlyPrice === 0 ? 'Free' : `€${displayPrice}`}
                      </span>
                      {plan.monthlyPrice > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                    </div>
                    {billedNote && (
                      <p className="text-xs text-muted-foreground mb-4">{billedNote}</p>
                    )}
                    {!billedNote && <div className="mb-4" />}

                    {plan.noBooking && (
                      <p className="text-xs text-purple-500 font-medium mb-3">AI features only — no booking included</p>
                    )}

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
                      disabled={isCurrentPlan || checkout.isPending}
                      className={cn(
                        'w-full font-semibold',
                        isCurrentPlan ? 'bg-muted text-muted-foreground cursor-default'
                          : plan.popular ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : plan.id === 'basic' ? 'bg-secondary hover:bg-secondary/90'
                              : 'bg-gradient-ocean'
                      )}
                    >
                      {checkout.isPending && selectedPlan === plan.id ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 size={16} className="animate-spin" /> Redirecting...
                        </span>
                      ) : isCurrentPlan ? 'Current Plan' : plan.cta}
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
                  <span className="font-heading font-bold">Referral Bonus</span>
                </div>
                <p className="text-foreground">
                  Invite a friend and both get <span className="font-bold text-gold">€5 off</span> your next month.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">
              Compare All Plans
            </h2>
            <div className="max-w-6xl mx-auto overflow-x-auto">
              <div className="bg-card rounded-xl overflow-hidden shadow-card min-w-[700px]">
                <table className="w-full">
                  <thead className="bg-gradient-ocean text-primary-foreground">
                    <tr>
                      <th className="text-left p-4 font-heading font-semibold">Feature</th>
                      <th className="text-center p-3 font-heading font-semibold text-sm">Basic</th>
                      <th className="text-center p-3 font-heading font-semibold text-sm">AI-Only</th>
                      <th className="text-center p-3 font-heading font-semibold text-sm">Sailor</th>
                      <th className="text-center p-3 font-heading font-semibold text-sm">Captain</th>
                      <th className="text-center p-3 font-heading font-semibold text-sm">Fleet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                        <td className="p-4 text-foreground text-sm font-medium">{row.feature}</td>
                        <td className="p-3 text-center"><CellValue value={row.basic} /></td>
                        <td className="p-3 text-center"><CellValue value={row.aiOnly} /></td>
                        <td className="p-3 text-center"><CellValue value={row.sailor} /></td>
                        <td className="p-3 text-center"><CellValue value={row.captain} /></td>
                        <td className="p-3 text-center"><CellValue value={row.fleet} /></td>
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
              <span className="text-sm font-medium">Offline Ready</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Navigate Without Internet
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Download charts and mooring data for offline use. Available on Sailor, Captain, and Charter Fleet plans.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-ocean">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-6">
              Ready to Set Sail?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of boaters who book smarter with Mooring Booking.
            </p>
            <Button
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14"
              onClick={() => handleSelectPlan('basic')}
            >
              <Zap className="mr-2" size={20} />
              Get Started Free
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserPricingPage;
