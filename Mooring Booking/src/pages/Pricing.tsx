import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, Anchor, Users, TrendingUp, Shield, HelpCircle, Calculator, Crown, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PricingPage = () => {
  const { t } = useTranslation();

  const pricingFeatures = [
    t('pricing.listUnlimited'),
    t('pricing.photoGallery'),
    t('pricing.availabilityCalendar'),
    t('pricing.instantBooking'),
    t('pricing.securePayment'),
    t('pricing.customerMessaging'),
    t('pricing.analyticsDashboard'),
    t('pricing.emailSupport'),
    t('pricing.winterStorageListings'),
    t('pricing.now4TodayBookings'),
  ];

  const paidAddOns = [
    { feature: t('pricing.marketingTools'), price: "€5/mo" },
    { feature: t('pricing.premiumListing'), price: "€9.99/mo" },
    { feature: t('pricing.mooringInsurance', 'Mooring Insurance'), price: "€9.99/yr", description: t('pricing.mooringInsuranceDesc', 'Third-party liability protection and mooring security mediation') },
  ];

  const faqs = [
    { question: t('pricing.faq.q1', 'When do I get paid?'), answer: t('pricing.faq.a1', 'For card and digital payments, funds are transferred to your account within 3-5 business days after the guest checks out. For cash payments, you receive payment directly from the guest and we invoice you monthly for the 15% commission.') },
    { question: t('pricing.faq.q2', 'Are there any upfront costs?'), answer: t('pricing.faq.a2', 'No! Registration and listing are completely free. You only pay the 15% commission when you receive a booking. Optional add-ons (Marketing Tools €5/mo, Premium Listing €9.99/mo) are available.') },
    { question: t('pricing.faq.q3', 'How does the Stripe fee split work?'), answer: t('pricing.faq.a3', 'Stripe processing fees (2.9% + €0.30) are deducted from the total booking amount first. Then the remaining net amount is split 15% to the platform and 85% to you.') },
    { question: t('pricing.faq.q4', 'How does the affiliate program work for providers?'), answer: t('pricing.faq.a4', 'The affiliate commission (5-15%) is paid by Mooring Booking from our 15% fee, not from your earnings. You still receive 85% of the net booking value.') },
    { question: t('pricing.faq.q5', 'Can I cancel a booking?'), answer: t('pricing.faq.a5', 'You can cancel within 24 hours of receiving the booking with no penalty. After that, cancellation may affect your ranking.') },
    { question: t('pricing.faq.q6', 'What payment methods must I accept?'), answer: t('pricing.faq.a6', 'All card payments are processed securely via Stripe, supporting Visa, Mastercard, Apple Pay, and Google Pay. You can also choose to accept cash on arrival. We recommend enabling Stripe Connect for automatic payouts.') },
  ];

  const basicFeatures = [
    t('homePricing.basicFeature1'),
    t('homePricing.basicFeature2'),
    t('homePricing.basicFeature3'),
    t('homePricing.basicFeature4'),
    t('homePricing.basicFeature5'),
  ];

  const premiumMonthlyFeatures = [
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
  ];

  const premiumAnnualFeatures = [
    t('homePricing.premiumAnnualFeature1'),
    t('homePricing.premiumAnnualFeature2'),
    t('homePricing.premiumAnnualFeature3'),
    t('homePricing.premiumAnnualFeature4'),
    t('homePricing.premiumAnnualFeature5'),
    t('homePricing.premiumAnnualFeature6'),
    t('homePricing.premiumAnnualFeature7'),
    t('homePricing.premiumAnnualFeature8'),
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 right-10 opacity-10 animate-float">
            <Anchor size={100} className="text-gold" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                {t('pricing.heroTitle')}
                <span className="block text-gold">{t('pricing.heroHighlight')}</span>
              </h1>
              <p className="text-lg text-primary-foreground/80">
                {t('pricing.heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Main Pricing Card */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl shadow-hover overflow-hidden">
                <div className="bg-gradient-ocean p-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-4">
                    <Shield size={16} />
                    <span className="text-sm font-medium">{t('pricing.providerPlan')}</span>
                  </div>
                  <div className="font-heading text-5xl md:text-6xl font-bold text-primary-foreground mb-2">
                    15<span className="text-3xl">%</span>
                  </div>
                  <p className="text-primary-foreground/80">{t('pricing.commissionPerBooking')}</p>
                </div>

                <div className="p-8">
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-6">{t('pricing.everythingIncluded')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {pricingFeatures.map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="text-success" size={14} />
                        </div>
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    {t('pricing.optionalAddOns')}
                  </h3>
                  <div className="space-y-3 mb-8">
                    {paidAddOns.map((item) => (
                      <div key={item.feature} className="flex items-center justify-between p-3 bg-gold/5 rounded-lg border border-gold/20">
                        <div>
                          <span className="text-foreground text-sm">{item.feature}</span>
                          {'description' in item && item.description && (
                            <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <span className="font-heading font-bold text-gold whitespace-nowrap ml-4">{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-border text-center">
                    <Link to="/become-provider">
                      <Button size="lg" className="bg-gradient-ocean font-semibold text-lg px-10 h-14">
                        {t('pricing.startEarning')}
                      </Button>
                    </Link>
                    <p className="text-muted-foreground text-sm mt-4">{t('pricing.freeRegistration')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stripe Commission Calculation */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-4">
              {t('pricing.commissionBreakdown')}
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t('pricing.commissionBreakdownSubtitle')}
            </p>

            <div className="max-w-3xl mx-auto space-y-8">
              <div className="bg-card rounded-xl overflow-hidden shadow-card">
                <div className="bg-secondary/10 p-4 flex items-center gap-2">
                  <Calculator className="text-secondary" size={20} />
                  <h3 className="font-heading font-semibold text-foreground">{t('pricing.exampleBooking')}</h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-foreground">{t('pricing.bookingAmount')}</span>
                    <span className="font-heading font-bold text-foreground">€100.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-destructive">
                    <span>{t('pricing.stripeFee')}</span>
                    <span className="font-heading font-bold">−€3.20</span>
                  </div>
                  <div className="border-t border-border my-2" />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-foreground font-medium">{t('pricing.netAfterStripe')}</span>
                    <span className="font-heading font-bold text-foreground">€96.80</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-secondary">
                    <span>{t('pricing.platformCommission')}</span>
                    <span className="font-heading font-bold">€14.52</span>
                  </div>
                  <div className="border-t-2 border-success/30 my-2" />
                  <div className="flex justify-between items-center py-3 bg-success/5 rounded-lg px-3">
                    <span className="text-foreground font-semibold text-lg">{t('pricing.yourPayout')}</span>
                    <span className="font-heading font-bold text-success text-xl">€82.28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sailor/Captain Subscription Tiers */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-6">
                <Users size={16} />
                <span className="text-sm font-medium">{t('pricing.forSailors')}</span>
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                {t('pricing.captainPlans')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('pricing.captainPlansSubtitle')}
              </p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="inline-flex bg-secondary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4">{t('pricing.freeForever')}</div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-1">{t('homePricing.basicName')}</h3>
                <div className="mb-4"><span className="font-heading text-4xl font-bold text-primary">{t('homePricing.basicPrice')}</span></div>
                <ul className="space-y-2 mb-6 text-sm">
                  {basicFeatures.map(f => (
                    <li key={f} className="flex items-start gap-2 text-foreground"><Check className="text-success flex-shrink-0 mt-0.5" size={14}/><span>{f}</span></li>
                  ))}
                </ul>
              </div>
              {/* Premium Monthly */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="inline-flex bg-gold text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4">{t('pricing.fullAccess')}</div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-1">{t('homePricing.premiumMonthlyName')}</h3>
                <div className="mb-4"><span className="font-heading text-4xl font-bold text-primary">{t('homePricing.premiumMonthlyPrice')}</span><span className="text-muted-foreground">{t('homePricing.premiumMonthlyPeriod')}</span></div>
                <ul className="space-y-2 mb-6 text-sm">
                  {premiumMonthlyFeatures.map(f => (
                    <li key={f} className="flex items-start gap-2 text-foreground"><Check className="text-success flex-shrink-0 mt-0.5" size={14}/><span>{f}</span></li>
                  ))}
                </ul>
              </div>
              {/* Premium Annual */}
              <div className="bg-card rounded-2xl p-6 shadow-card ring-2 ring-success relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">{t('pricing.bestValue')}</div>
                <div className="inline-flex bg-success text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4">{t('pricing.save50')}</div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-1">{t('homePricing.premiumAnnualName')}</h3>
                <div className="mb-1">
                  <span className="text-muted-foreground line-through text-lg">€19.99</span>{" "}
                  <span className="font-heading text-4xl font-bold text-primary">{t('homePricing.premiumAnnualPrice')}</span><span className="text-muted-foreground">{t('homePricing.premiumAnnualPeriod')}</span>
                </div>
                <p className="text-success text-sm font-medium mb-4">{t('pricing.billedAnnually')}</p>
                <ul className="space-y-2 mb-6 text-sm">
                  {premiumAnnualFeatures.map(f => (
                    <li key={f} className="flex items-start gap-2 text-foreground"><Check className="text-success flex-shrink-0 mt-0.5" size={14}/><span>{f}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link to="/user-pricing">
                <Button size="lg" className="bg-gradient-ocean font-semibold px-8 h-12">
                  {t('pricing.viewFullComparison')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">
              {t('pricing.faqTitle')}
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="text-secondary flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-ocean">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground mb-6">
              {t('pricing.readyToList')}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              {t('pricing.readyToListSubtitle')}
            </p>
            <Link to="/become-provider">
              <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14">
                <TrendingUp className="mr-2" size={20} />
                {t('pricing.startEarningNow')}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;