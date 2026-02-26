import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, HelpCircle, Anchor, Clock, MapPin, Ship, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AIChatWidget from "@/components/AIChatWidget";
import { useTranslation } from "react-i18next";

const SupportPage = () => {
  const { t } = useTranslation();
  const [showAIChat, setShowAIChat] = useState(false);

  const faqs = [
    {
      category: t('support.bookingReservations'),
      questions: [
        { q: t('support.faq.bookQ1', 'How do I book a mooring?'), a: t('support.faq.bookA1', 'Search for your desired location and dates, select a mooring, and click \'Book Now\'. You\'ll receive instant confirmation after payment.') },
        { q: t('support.faq.bookQ2', 'Can I cancel my booking?'), a: t('support.faq.bookA2', 'Yes, most moorings offer free cancellation up to 48 hours before check-in. Check the specific cancellation policy on each mooring page.') },
        { q: t('support.faq.bookQ3', 'When do I get navigation coordinates?'), a: t('support.faq.bookA3', 'GPS coordinates and exact location details are unlocked immediately after your booking is confirmed and payment is processed.') },
        { q: t('support.faq.bookQ4', 'How do I navigate to my booked mooring?'), a: t('support.faq.bookA4', 'After completing your booking, tap \'Navigate to Mooring\' to open directions in your preferred maps app (Apple Maps, Android Maps, or OpenStreetMap).') },
        { q: t('support.faq.bookQ5', 'What if the mooring doesn\'t match the description?'), a: t('support.faq.bookA5', 'Contact AI Captain immediately for assistance. Our platform will mediate between you and the owner. We take listing accuracy seriously, however Intelligent Matrix acts as a marketplace and does not guarantee refunds.') },
        { q: t('support.faq.bookQ6', 'Can I extend my stay at the mooring?'), a: t('support.faq.bookA6', 'Yes! Extensions are automatically approved if the mooring is not booked by others for the requested dates. No waiting required — the system checks availability instantly.') },
      ]
    },
    {
      category: t('support.paymentsAndPricing'),
      questions: [
        { q: t('support.faq.payQ1', 'What payment methods are accepted?'), a: t('support.faq.payA1', 'We accept Visa, Mastercard, PayPal, and Google Pay. Some moorings also accept cash payment on arrival (commission still applies).') },
        { q: t('support.faq.payQ2', 'Is my payment secure?'), a: t('support.faq.payA2', 'Yes, all payments are processed through Stripe with bank-level encryption. We never store your full card details.') },
        { q: t('support.faq.payQ3', 'When is the mooring owner paid?'), a: t('support.faq.payA3', 'Owners receive payment 3-5 business days after guest check-out for card payments, minus the 15% platform commission.') },
        { q: t('support.faq.payQ4', 'Why do prices vary so much?'), a: t('support.faq.payA4', 'Prices depend on location, season, amenities, and owner preferences. Owners can set custom daily prices via their calendar. Now4Today same-day bookings (01:00 AM–11:00 PM) have a 20% premium to reflect urgent availability.') },
        { q: t('support.faq.payQ5', 'Are there any hidden fees?'), a: t('support.faq.payA5', 'No hidden fees! The price you see includes all platform fees. The only additional costs may be optional services offered by the mooring owner.') },
      ]
    },
    {
      category: t('support.forMooringOwners'),
      questions: [
        { q: t('support.faq.ownerQ1', 'How do I list my mooring?'), a: t('support.faq.ownerA1', 'Click \'Become a Provider\', create an account, and follow the 10-step registration process. It takes about 10 minutes.') },
        { q: t('support.faq.ownerQ2', 'What is the commission rate?'), a: t('support.faq.ownerA2', 'We charge a flat 15% commission on all bookings. There are no monthly fees or hidden costs. You may offer 0-50% discount to users. Optional add-ons: Marketing Tools (€5/mo), Premium Listing (€9.99/mo), Mooring Insurance (€9.99/yr).') },
        { q: t('support.faq.ownerQ3', 'How do I manage my calendar?'), a: t('support.faq.ownerA3', 'Access your provider dashboard to update availability, block dates, or set special pricing for peak seasons.') },
        { q: t('support.faq.ownerQ4', 'What if a guest doesn\'t show up?'), a: t('support.faq.ownerA4', 'You keep the full booking amount. Guests who don\'t cancel in time forfeit their payment according to your cancellation policy. No refunds for early departure.') },
        { q: t('support.faq.ownerQ5', 'How do I receive payments?'), a: t('support.faq.ownerA5', 'Payments are automatically transferred to your bank account 3-5 business days after each checkout. You\'ll receive a monthly statement.') },
        { q: t('support.faq.ownerQ6', 'Can I set different prices for different seasons?'), a: t('support.faq.ownerA6', 'Yes! Use the calendar in your dashboard to set custom prices per day — peak season rates, off-season discounts, and special event pricing. Double-click any day to set a custom price.') },
        { q: t('support.faq.ownerQ7', 'What is Now4Today?'), a: t('support.faq.ownerA7', 'Now4Today enables same-day bookings from 01:00 AM to 11:00 PM. A 20% surcharge is automatically applied to the base price, and the platform commission is calculated on the full increased amount. You can enable/disable it from your dashboard.') },
        { q: t('support.faq.ownerQ8', 'What is Mooring Insurance?'), a: t('support.faq.ownerA8', 'Mooring Insurance at €9.99/year provides mediation for third-party liability protection and mooring security. It\'s an optional add-on available in your provider dashboard.') },
      ]
    },
    {
      category: t('support.forMarinas'),
      questions: [
        { q: t('support.faq.marinaQ1', 'Can I list multiple moorings?'), a: t('support.faq.marinaA1', 'Absolutely! Marinas and commercial providers can list unlimited moorings. Contact us for bulk upload tools.') },
        { q: t('support.faq.marinaQ2', 'Do you offer API integration?'), a: t('support.faq.marinaA2', 'Yes, we offer API access for marinas with existing booking systems. Contact our technical team for documentation.') },
        { q: t('support.faq.marinaQ3', 'What about liability and insurance?'), a: t('support.faq.marinaA3', 'All providers must have valid liability insurance. We verify marina certifications during the registration process.') },
      ]
    },
    {
      category: t('support.affiliateProgram'),
      questions: [
        { q: t('support.faq.affQ1', 'How does the affiliate program work?'), a: t('support.faq.affA1', 'Sign up for free, get your unique tracking link, and earn 5-15% of our platform\'s 15% service fee for every booking.') },
        { q: t('support.faq.affQ2', 'How long does the tracking cookie last?'), a: t('support.faq.affA2', 'Our tracking cookie lasts 30 days. If someone clicks your link and books within 30 days, you\'ll receive commission.') },
        { q: t('support.faq.affQ3', 'What are the minimum payout requirements?'), a: t('support.faq.affA3', 'Minimum payout is €50. Payments are processed monthly via Stripe or bank transfer. Elite affiliates get weekly payouts.') },
        { q: t('support.faq.affQ4', 'Can I promote on social media?'), a: t('support.faq.affA4', 'Yes! We encourage promotion on Instagram, YouTube, TikTok, blogs, and email lists.') },
      ]
    },
    {
      category: t('support.safetyWeather'),
      questions: [
        { q: t('support.faq.safetyQ1', 'What if bad weather forces me to leave early?'), a: t('support.faq.safetyA1', 'Contact the owner and our support immediately. Please note: no refunds are provided for early departure from moorings, regardless of the reason.') },
        { q: t('support.faq.safetyQ2', 'Does the app provide weather forecasts?'), a: t('support.faq.safetyA2', 'Yes! Our AI Captain provides real-time weather data, wind speed alerts, and wave conditions for your mooring location.') },
        { q: t('support.faq.safetyQ3', 'Are moorings inspected for safety?'), a: t('support.faq.safetyA3', 'We require all providers to declare their moorings meet safety standards. Verified moorings undergo periodic inspections.') },
      ]
    },
    {
      category: t('support.subscriptionPlans'),
      questions: [
        { q: t('support.faq.subQ1', 'What subscription plans are available?'), a: t('support.faq.subA1', 'We offer three tiers: Basic (Free), Premium Monthly (€19.99/mo), and Premium Annual (€9.99/mo, billed €119.88/year).') },
        { q: t('support.faq.subQ2', 'Do I need to register to use the app?'), a: t('support.faq.subA2', 'Yes, free registration is required for all users. You can start with the free Basic plan and upgrade anytime.') },
        { q: t('support.faq.subQ3', 'Can I switch between plans?'), a: t('support.faq.subA3', 'Yes! You can upgrade from Basic to Premium at any time. Downgrading takes effect at the end of your current billing period.') },
        { q: t('support.faq.subQ4', 'What does Premium include that Basic doesn\'t?'), a: t('support.faq.subA4', 'Premium unlocks unlimited AI Captain, 7-day weather forecasts, offline maps, storm alerts, maneuvering guides, priority booking, and more.') },
      ]
    },
    {
      category: t('support.technicalAccount'),
      questions: [
        { q: t('support.faq.techQ1', 'How do I reset my password?'), a: t('support.faq.techA1', 'Click \'Forgot Password\' on the login page. You\'ll receive an email with a reset link.') },
        { q: t('support.faq.techQ2', 'Can I use the app offline?'), a: t('support.faq.techA2', 'Premium members get offline access to maps, weather forecasts (24h cached), navigation guides, and saved bookings.') },
        { q: t('support.faq.techQ3', 'How do I delete my account?'), a: t('support.faq.techA3', 'Go to Settings > Account > Delete Account. Active bookings must be completed or cancelled first. Data deleted within 30 days per GDPR.') },
      ]
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 right-10 opacity-10 animate-float">
            <HelpCircle size={80} className="text-gold" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                {t('support.heroTitle')}
              </h1>
              <p className="text-lg text-primary-foreground/80">
                {t('support.heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-ocean rounded-xl p-6 shadow-card text-center md:col-span-1 ring-2 ring-gold">
                <div className="w-14 h-14 bg-gold/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Ship className="text-gold" size={28} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-primary-foreground mb-2">{t('support.aiCaptain')}</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">{t('support.aiCaptainDesc')}</p>
                <Button onClick={() => setShowAIChat(true)} className="bg-gold text-gold-foreground hover:bg-gold/90">
                  <Bot className="mr-2" size={18} />
                  {t('support.askAICaptain')}
                </Button>
              </div>

              <a href="mailto:support@mooring-booking.com" className="bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow text-center">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-secondary" size={28} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{t('support.emailSupport')}</h3>
                <p className="text-muted-foreground text-sm mb-4">{t('support.emailSupportDesc')}</p>
                <span className="text-secondary font-medium text-sm">support@mooring-booking.com</span>
              </a>

              <a href="mailto:info@intelligent-matrix.com" className="bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow text-center">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-secondary" size={28} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{t('support.businessInquiries')}</h3>
                <p className="text-muted-foreground text-sm mb-4">{t('support.businessInquiriesDesc')}</p>
                <span className="text-secondary font-medium text-sm">info@intelligent-matrix.com</span>
              </a>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-4">
              {t('support.faqTitle')}
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t('support.faqSubtitle')}
            </p>
            <div className="max-w-4xl mx-auto space-y-8">
              {faqs.map((category) => (
                <div key={category.category}>
                  <h3 className="font-heading font-semibold text-xl text-secondary mb-4">{category.category}</h3>
                  <div className="space-y-4">
                    {category.questions.map((faq) => (
                      <div key={faq.q} className="bg-card rounded-xl p-6 shadow-card">
                        <h4 className="font-heading font-semibold text-foreground mb-2">{faq.q}</h4>
                        <p className="text-muted-foreground text-sm">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-4">
                {t('support.sendMessage')}
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                {t('support.sendMessageSubtitle')}
              </p>
              <form className="space-y-6 bg-card rounded-xl p-8 shadow-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('support.name')}</label>
                    <Input placeholder={t('support.yourName')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('support.email')}</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('support.subject')}</label>
                  <Input placeholder={t('support.whatIsThisAbout')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('support.message')}</label>
                  <Textarea placeholder={t('support.describeIssue')} rows={5} />
                </div>
                <Button className="w-full bg-gradient-ocean font-semibold h-12">
                  {t('support.sendBtn')}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Office Info */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <MapPin className="text-secondary mx-auto mb-3" size={24} />
                <h3 className="font-heading font-semibold text-foreground mb-2">{t('support.headquarters')}</h3>
                <p className="text-muted-foreground text-sm">Intelligent Matrix<br />Prague, Czech Republic</p>
              </div>
              <div>
                <Bot className="text-secondary mx-auto mb-3" size={24} />
                <h3 className="font-heading font-semibold text-foreground mb-2">{t('support.aiCaptainSupport')}</h3>
                <p className="text-muted-foreground text-sm">{t('support.available247')}<br />{t('support.instantResponses')}</p>
              </div>
              <div>
                <Phone className="text-secondary mx-auto mb-3" size={24} />
                <h3 className="font-heading font-semibold text-foreground mb-2">{t('support.emergencyOnly')}</h3>
                <p className="text-muted-foreground text-sm">+420 739 328 337<br />+43 667 446 4860</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      <AIChatWidget isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>
  );
};

export default SupportPage;