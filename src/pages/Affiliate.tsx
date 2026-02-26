import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link2, TrendingUp, Users, DollarSign, Share2, BarChart3, ArrowRight, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AffiliatePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tiers = [
    { name: t('affiliate.starter'), commission: "5%", requirement: "0-10 bookings/month", features: [t('affiliate.basicDashboard', 'Basic affiliate dashboard'), t('affiliate.uniqueLink', 'Unique tracking link'), t('affiliate.monthlyPayouts', 'Monthly payouts'), t('affiliate.emailSupportTier', 'Email support')] },
    { name: t('affiliate.pro'), commission: "10%", requirement: "11-50 bookings/month", features: [t('affiliate.advancedAnalytics', 'Advanced analytics'), t('affiliate.customLanding', 'Custom landing pages'), t('affiliate.biweeklyPayouts', 'Bi-weekly payouts'), t('affiliate.prioritySupportTier', 'Priority support'), t('affiliate.promoMaterials', 'Promotional materials')] },
    { name: t('affiliate.elite'), commission: "15%", requirement: "50+ bookings/month", features: [t('affiliate.vipDashboard', 'VIP dashboard'), t('affiliate.accountManager', 'Dedicated account manager'), t('affiliate.weeklyPayouts', 'Weekly payouts'), t('affiliate.coMarketing', 'Co-marketing opportunities'), t('affiliate.exclusivePromos', 'Exclusive promotions'), t('affiliate.apiAccess', 'API access')] },
  ];

  const howItWorks = [
    { step: 1, title: t('affiliate.step1Title'), description: t('affiliate.step1Desc') },
    { step: 2, title: t('affiliate.step2Title'), description: t('affiliate.step2Desc') },
    { step: 3, title: t('affiliate.step3Title'), description: t('affiliate.step3Desc') },
    { step: 4, title: t('affiliate.step4Title'), description: t('affiliate.step4Desc') },
  ];

  const handleJoinClick = () => {
    toast.success(t('affiliate.joinToast', 'Opening affiliate registration...'));
    navigate('/contact?subject=affiliate');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 left-10 opacity-10 animate-float"><Link2 size={80} className="text-gold" /></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-6"><Share2 size={16} /><span className="text-sm font-medium">{t('affiliate.title')}</span></div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                {t('affiliate.heroTitle')}<span className="block text-gold">{t('affiliate.heroTitleHighlight')}</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">{t('affiliate.subtitle')}</p>
              <Button onClick={handleJoinClick} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14">
                {t('affiliate.joinProgram')}<ArrowRight className="ml-2" size={20} />
              </Button>
              <p className="text-primary-foreground/60 text-sm mt-4">{t('affiliate.freeToJoin')}</p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center"><div className="font-heading text-3xl md:text-4xl font-bold text-secondary">€250K+</div><div className="text-muted-foreground text-sm mt-1">{t('affiliate.paidToAffiliates')}</div></div>
              <div className="text-center"><div className="font-heading text-3xl md:text-4xl font-bold text-secondary">500+</div><div className="text-muted-foreground text-sm mt-1">{t('affiliate.activeAffiliates')}</div></div>
              <div className="text-center"><div className="font-heading text-3xl md:text-4xl font-bold text-secondary">15%</div><div className="text-muted-foreground text-sm mt-1">{t('affiliate.topCommissionRate')}</div></div>
              <div className="text-center"><div className="font-heading text-3xl md:text-4xl font-bold text-secondary">30 {t('cookies.days', 'Days')}</div><div className="text-muted-foreground text-sm mt-1">{t('affiliate.cookieDuration')}</div></div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">{t('affiliate.howItWorks')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="relative bg-card rounded-xl p-6 shadow-card">
                  <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-primary-foreground font-heading font-bold shadow-card">{item.step}</div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2 mt-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-4">{t('affiliate.commissionTiers')}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{t('affiliate.commissionTiersSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {tiers.map((tier, index) => (
                <div key={tier.name} className={`bg-card rounded-xl p-6 shadow-card ${index === 2 ? 'ring-2 ring-gold' : ''}`}>
                  {index === 2 && (<div className="inline-flex items-center gap-1 bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-medium mb-4"><Star size={12} /> {t('affiliate.mostPopular')}</div>)}
                  <h3 className="font-heading font-semibold text-xl text-foreground">{tier.name}</h3>
                  <div className="my-4"><span className="font-heading text-4xl font-bold text-secondary">{tier.commission}</span><span className="text-muted-foreground ml-2">{t('affiliate.ofPlatformFee')}</span></div>
                  <p className="text-muted-foreground text-sm mb-6">{tier.requirement}</p>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (<li key={feature} className="flex items-center gap-2 text-sm text-foreground"><Check className="text-success flex-shrink-0" size={16} />{feature}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-ocean">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">{t('affiliate.readyToStart')}</h2>
            <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto">{t('affiliate.readyToStartDesc')}</p>
            <Button onClick={handleJoinClick} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14">
              <TrendingUp className="mr-2" size={20} />{t('affiliate.joinProgram')}
            </Button>
            <p className="text-primary-foreground/60 text-sm mt-4">{t('affiliate.minPayout')}</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AffiliatePage;