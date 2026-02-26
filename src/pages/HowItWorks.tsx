import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Calendar, Navigation, CreditCard, Shield, Anchor, CheckCircle, Ship, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HowItWorksPage = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Search, number: "01", title: t('howItWorksPage.searchDiscover'), description: t('howItWorksPage.searchDiscoverDesc'), features: [t('howItWorksPage.realTimeAvail', 'Real-time availability'), t('howItWorksPage.advancedFilters', 'Advanced filters'), t('howItWorksPage.interactiveMap', 'Interactive map view'), t('howItWorksPage.lastMinuteDeals', 'Last-minute deals')] },
    { icon: Calendar, number: "02", title: t('howItWorksPage.bookInstantly'), description: t('howItWorksPage.bookInstantlyDesc'), features: [t('howItWorksPage.securePayments', 'Secure payments'), t('howItWorksPage.instantConfirmation', 'Instant confirmation'), t('howItWorksPage.discountGuaranteed', 'Discount guaranteed'), t('howItWorksPage.freeCancellation', 'Free cancellation options')] },
    { icon: Navigation, number: "03", title: t('howItWorksPage.navigateToMooring'), description: t('howItWorksPage.navigateDesc'), features: [t('howItWorksPage.gpsCoordinates', 'GPS coordinates'), t('howItWorksPage.nauticalNav', 'Nautical navigation'), t('howItWorksPage.aiCaptainWeather', 'AI Captain weather assistant'), t('howItWorksPage.maneuveringAdvice', 'Maneuvering advice'), t('howItWorksPage.stormAlerts', 'Storm alerts')] },
    { icon: CreditCard, number: "04", title: t('howItWorksPage.dockEnjoy'), description: t('howItWorksPage.dockEnjoyDesc'), features: [t('howItWorksPage.ownerContact', 'Owner contact access'), t('howItWorksPage.checkInInstr', 'Check-in instructions'), t('howItWorksPage.amenityDetails', 'Amenity details'), t('howItWorksPage.communityReviews', 'Community reviews')] },
  ];

  const providerSteps = [
    { icon: CheckCircle, title: t('howItWorksPage.registerFree'), description: t('howItWorksPage.registerFreeDesc') },
    { icon: Calendar, title: t('howItWorksPage.listMooring'), description: t('howItWorksPage.listMooringDesc') },
    { icon: Shield, title: t('howItWorksPage.signDeclaration'), description: t('howItWorksPage.signDeclarationDesc') },
    { icon: Anchor, title: t('howItWorksPage.startEarning'), description: t('howItWorksPage.startEarningDesc') },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 left-10 opacity-10 animate-float"><Anchor size={80} className="text-gold" /></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">{t('howItWorksPage.heroTitle')}</h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">{t('howItWorksPage.heroSubtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-secondary font-medium">{t('howItWorksPage.forSailors')}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">{t('howItWorksPage.bookPerfect')}</h2>
            </div>
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.number} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl font-heading font-bold text-secondary/20">{step.number}</span>
                      <h3 className="font-heading text-2xl font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature) => (
                        <span key={feature} className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"><CheckCircle size={14} />{feature}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-48 h-48 bg-gradient-ocean rounded-2xl flex items-center justify-center shadow-hover"><step.icon className="text-gold" size={64} /></div>
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link to="/explore"><Button size="lg" className="bg-gradient-ocean font-semibold text-lg px-8 h-14"><Search className="mr-2" size={20} />{t('howItWorksPage.startSearching')}</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-secondary font-medium">{t('howItWorksPage.forOwners')}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">{t('howItWorksPage.listIn10Min')}</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{t('howItWorksPage.listIn10MinSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {providerSteps.map((step, index) => (
                <div key={step.title} className="relative bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow">
                  <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-primary-foreground font-heading font-bold shadow-card">{index + 1}</div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4"><step.icon className="text-secondary" size={24} /></div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/become-provider"><Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-8 h-14"><Anchor className="mr-2" size={20} />{t('howItWorksPage.becomeProvider')}</Button></Link>
              <p className="text-muted-foreground text-sm mt-4">{t('howItWorksPage.freeRegistration')}</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-gold font-medium">{t('howItWorksPage.premiumMembership')}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">{t('howItWorksPage.unlockAICaptain')}</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{t('howItWorksPage.unlockSubtitle')}</p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-card text-center"><Anchor className="text-secondary mx-auto mb-3" size={32} /><h3 className="font-heading font-bold text-foreground mb-2">{t('howItWorksPage.basicFree')}</h3><p className="text-muted-foreground text-sm">{t('howItWorksPage.basicFreeDesc')}</p></div>
              <div className="bg-card rounded-xl p-6 shadow-card text-center border-2 border-gold"><Ship className="text-gold mx-auto mb-3" size={32} /><h3 className="font-heading font-bold text-foreground mb-2">{t('howItWorksPage.premiumMonthly')}</h3><p className="text-muted-foreground text-sm">{t('howItWorksPage.premiumMonthlyDesc')}</p></div>
              <div className="bg-card rounded-xl p-6 shadow-card text-center ring-2 ring-success"><Crown className="text-success mx-auto mb-3" size={32} /><h3 className="font-heading font-bold text-foreground mb-2">{t('howItWorksPage.annualPlan')}</h3><p className="text-muted-foreground text-sm">{t('howItWorksPage.annualPlanDesc')}</p></div>
            </div>
            <div className="text-center mt-10">
              <Link to="/user-pricing"><Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8 h-12"><Crown className="mr-2" size={18} />{t('howItWorksPage.viewAllPlans')}</Button></Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">{t('howItWorksPage.stillHaveQuestions')}</h2>
            <p className="text-muted-foreground mb-8">{t('howItWorksPage.checkFAQ')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/support"><Button variant="outline" size="lg">{t('howItWorksPage.contactSupport')}</Button></Link>
              <Link to="/about"><Button variant="ghost" size="lg">{t('howItWorksPage.learnMore')}</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;