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
      category: "Booking & Reservations",
      questions: [
        {
          q: "How do I book a mooring?",
          a: "The answer depends on which type of listing you are booking. The Platform operates three distinct booking layers.\n\nFor ⭐ Premium Partner Marinas (Layer 1): search by location, vessel size and dates, select a Premium listing marked with the ⭐ badge, complete the booking form with your vessel details and pay via Stripe. Payment is captured immediately and confirmation is instant. You receive full marina contact details, GPS coordinates and VHF channel upon confirmation.\n\nFor 🔵 Concierge Booking (Layer 2): select a listing marked with the 🔵 badge, complete the booking form and authorise payment via Stripe. Your card is held but not charged. The Platform sends your booking request to the facility on your behalf. When the facility confirms, Stripe captures the service fee and you receive contact details. If the facility does not respond within the specified window, your hold is automatically released with no charge.\n\nFor 🗺️ Explore & Navigate (Layer 3): these locations are navigation reference only. No booking is possible. Use AI Captain for route planning and navigation guidance to these locations.",
        },
        {
          q: "What is the difference between the three booking layers?",
          a: "⭐ Layer 1 — Premium Marinas: facilities that have signed a Partnership Agreement, verified their legal right to offer commercial moorings, and integrated their availability calendar. Instant confirmed booking. Stripe charges immediately. Berth is guaranteed upon confirmation. Commission of 10–15% is paid by the marina. Service fee paid by the sailor based on vessel length.\n\n🔵 Layer 2 — Concierge Booking: facilities identified from publicly available sources including OpenStreetMap, Google Maps and official maritime authority registries. Mooring Booking has no contractual relationship with these facilities. The Platform sends your booking request on your behalf. No charge until the facility confirms. Full disclaimer in Master Terms of Service v3.0, Section 4.2.\n\n🗺️ Layer 3 — Explore & Navigate: anchorages, coves, natural harbours and small docks sourced from public nautical databases. Navigation reference only. No booking, no confirmation, no guaranteed access. Always verify with official nautical charts.",
        },
        {
          q: "What is the service fee and how much is it?",
          a: "The service fee is charged to the sailor by Mooring Booking in consideration for AI Captain assistance, booking facilitation, payment infrastructure and customer support. It is separate from the cost of the mooring itself.\n\nStandard service fee tiers by vessel length:\n• Vessels up to 8 metres: €12 per booking\n• Vessels 8–12 metres: €19 per booking\n• Vessels 12–18 metres: €35 per booking\n• Vessels 18–24 metres: €59 per booking\n• Vessels over 24 metres and superyachts: €99 per booking\n• Now4Today same-day bookings: standard tier plus 20% surcharge\n\nSailor and Captain plan subscribers receive reduced or waived service fees as described in the subscription plan details. The service fee is always displayed before payment is confirmed.",
        },
        {
          q: "Can I cancel my booking?",
          a: "Layer 1 — Premium Marinas: cancellation policy is set by each Premium Partner and displayed on their listing before booking. Service fee is non-refundable on Customer cancellation unless the Partner’s policy specifies fully refundable terms. If the marina cancels a confirmed booking, you receive a full refund including the service fee.\n\nLayer 2 — Concierge Booking: if the facility does not confirm within the specified window, the Stripe authorisation is automatically released and no charge is made. Once confirmed, the service fee is captured and non-refundable except where the facility fails to honour the confirmed booking.\n\nLayer 3 — Explore & Navigate: no booking exists, no cancellation applies.",
        },
        {
          q: "When do I receive GPS coordinates and contact details?",
          a: "Layer 1 — Premium Marinas: full marina contact details, GPS coordinates, VHF channel and marinero contact name are unlocked immediately upon booking confirmation and payment capture.\n\nLayer 2 — Concierge Booking: facility contact details are released only after Stripe Capture confirms successful payment following facility confirmation. Prior to confirmation, only publicly available GPS coordinates and VHF working channel are visible.\n\nLayer 3 — Explore & Navigate: GPS coordinates from public nautical databases are visible without booking. No contact data is available.",
        },
        {
          q: "How do I navigate to my booked mooring?",
          a: "After confirmed booking, tap Navigate in the app to open GPS coordinates in your preferred navigation app. AI Captain provides turn-by-turn nautical navigation including approach guidance, depth warnings where data is available, wind conditions, recommended approach angle for your vessel type and VHF channel to call ahead. For Layer 2 confirmed bookings, the contact name is provided so you can call the marinero on approach.",
        },
        {
          q: "What if the mooring does not match the description?",
          a: "Layer 1 — Premium Marinas: contact the marina directly and contact support@mooring-booking.com simultaneously. Mooring Booking will mediate. Premium Partners are contractually obligated to maintain accurate listings. Repeated inaccuracies result in suspension of Partner status.\n\nLayer 2 — Concierge Booking: listing data is sourced from publicly available sources and may be incomplete or outdated. Mooring Booking has no contractual relationship with Layer 2 facilities and cannot guarantee data accuracy. Disputes are between the sailor and the facility operator.\n\nLayer 3 — Explore & Navigate: navigational data is for reference only. Mooring Booking expressly disclaims all liability for conditions at Layer 3 locations.",
        },
        {
          q: "Can I extend my stay?",
          a: "For Layer 1, extension requests are sent through the Platform to the marina. Approval depends on availability. For Layer 2, extension requests follow the same Concierge Booking process — no guarantee of availability or response. For Layer 3 locations, no booking exists. Access decisions are at the sole discretion of the relevant harbour master or facility operator.",
        },
        {
          q: "What happens if the marina confirms but no berth is available when I arrive?",
          a: "Layer 1 — Premium Marinas: Mooring Booking will refund your service fee in full and assist you in finding an alternative facility. The marina bears responsibility under their Partnership Agreement.\n\nLayer 2 — Concierge Booking: Mooring Booking refunds the service fee and AI Captain assists with locating alternative facilities. No further financial remedy can be guaranteed beyond the service fee refund.",
        },
      ],
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          q: "What payment methods are accepted?",
          a: "All payments are processed by Stripe. Accepted methods include Visa, Mastercard, American Express, Google Pay and Apple Pay. Payment is made in Euros. Currency conversion costs charged by your bank are outside Mooring Booking’s control.\n\nCash payment to the facility is a matter between the sailor and the facility operator. For Layer 2 Concierge Bookings, the Mooring Booking service fee is always charged via Stripe regardless of how the sailor subsequently pays the facility.",
        },
        {
          q: "Is my payment secure?",
          a: "All payments are processed by Stripe Inc. Mooring Booking does not store card numbers, CVV codes or full card details at any point. Payment data is tokenised by Stripe. All payment communication is encrypted via TLS. For Layer 2 bookings, Stripe Authorize holds your payment method without charging it until the facility confirms — protecting you from being charged for unconfirmed bookings.",
        },
        {
          q: "When is the mooring owner paid?",
          a: "Layer 1 — Premium Marinas: Stripe Connect splits the payment automatically at the time of booking. 85–90% is transferred to the Partner’s Stripe account and 10–15% is retained by Mooring Booking as Commission. Stripe processing fees of approximately 2.9% plus €0.30 are deducted before the split. Partners receive payment within 2–7 business days.\n\nLayer 2 — Concierge Booking: the Mooring Booking service fee is charged to the sailor. The facility charges the sailor directly upon arrival for the mooring cost. The Platform does not process the mooring payment for Layer 2 bookings.",
        },
        {
          q: "Why do prices vary?",
          a: "Layer 1 Premium Partner prices are set by each marina and may vary by season, vessel size, berth location and available amenities. Partners may offer discounts of 0–50% and may set custom daily pricing via their dashboard calendar. Now4Today same-day bookings carry a mandatory 20% surcharge.\n\nLayer 2 Concierge Booking prices are sourced from publicly available data and may not reflect current actual prices. Always confirm the final price directly with the facility.",
        },
        {
          q: "Are there any hidden fees?",
          a: "No. The service fee applicable to your booking is displayed clearly before payment is confirmed. There are no additional Platform fees beyond the service fee. Layer 1 Premium Partner prices include all marina charges agreed at booking. Optional services such as Vez Osiguran mooring damage mediation, premium subscription features or charter onboard tools are always opt-in and their costs are displayed before purchase.",
        },
      ],
    },
    {
      category: "For Mooring Owners & Concession Holders",
      questions: [
        {
          q: "Who can list on Mooring Booking as a Premium Partner?",
          a: "Any individual or legal entity holding a valid legal right to offer moorings commercially may apply. This includes ACI marinas and large marina operators, private marina operators, maritime concession holders operating buoy fields, dock owners with valid commercial authorisation, restaurant and hospitality operators with commercial berths, and small private marina operators with relevant municipal permits.\n\nYou must provide documentation confirming your legal right of disposal or maritime concession. Listings from individuals without valid commercial authorisation will not be approved.",
        },
        {
          q: "How do I list my mooring as a Premium Partner?",
          a: "Click Become a Provider on the Platform, create a provider account and complete registration. You will provide: facility name and location, GPS coordinates, vessel size limits and depth, available services and amenities, photographic material, pricing and seasonal structure, and documentation of legal right of disposal or maritime concession.\n\nYou then sign the Mooring Booking Partnership Agreement digitally and set up your Stripe Express account. Your listing goes live upon approval and your white-label subdomain is activated within 48 hours.",
        },
        {
          q: "What is the commission rate?",
          a: "Standard Premium Partners pay 15% commission on all bookings. Partners operating facilities with 50 or more berths pay 12% commission. Stripe processing fees of approximately 2.9% plus €0.30 are deducted before the commission split. There are no monthly listing fees beyond the optional €199/month partnership subscription which includes the white-label dashboard, analytics and enhanced marketing tools.",
        },
        {
          q: "What does the white-label dashboard include?",
          a: "Premium Partners receive: a dedicated subdomain (mooring-booking.com/yourname), a booking management dashboard with vessel details and ETA, a live availability calendar with custom daily pricing, an analytics dashboard showing booking volumes, revenue and guest origin data, a customer messaging system, a QR code generator for physical marketing materials, and an affiliate link for referral tracking. Dashboard access is included in the €199/month partnership subscription.",
        },
        {
          q: "What if a guest does not arrive?",
          a: "For Layer 1 confirmed bookings: if the guest does not cancel within the policy window and does not arrive, the cancellation policy displayed on your listing governs the financial outcome. You retain the portion specified in your cancellation policy. Mooring Booking retains its commission on amounts not refunded to the guest.",
        },
        {
          q: "Can I set different prices for different seasons?",
          a: "Yes. Your dashboard calendar allows custom daily pricing for any date. You can set peak season rates, shoulder season pricing, event-based pricing and last-minute discounts. Double-tap any date in the calendar to set a custom price. Custom prices override your default nightly rate.",
        },
        {
          q: "What is Now4Today?",
          a: "Now4Today enables same-day bookings from 01:00 to 23:00 on the day of arrival. A mandatory 20% surcharge is automatically added to your base price. Commission is calculated on the full surcharge-inclusive amount. You can enable or disable Now4Today from your dashboard at any time. When enabled, AI Captain surfaces your facility prominently in last-minute searches.",
        },
        {
          q: "What is Berth insurance?",
          a: "Berth insurance is Mooring Booking’s optional mooring damage mediation service. It is not an insurance product and Mooring Booking is not a regulated insurance provider. The service provides: documented recording of vessel and mooring condition at booking, access to the Platform’s dispute resolution process, and coordination assistance in communicating claims between parties. It does not guarantee payment in respect of any claim. Available at €9.99 per year.",
        },
        {
          q: "Can I list multiple berths or a full marina?",
          a: "Yes. Premium Partners can list unlimited individual berths, pontoons, buoy fields and mooring areas under one account. Contact partners@mooring-booking.com for bulk upload tools and dedicated onboarding support for larger marinas.",
        },
        {
          q: "Do you offer API integration?",
          a: "Yes. API access is available for marinas with existing Property Management Systems or booking software. Contact info@mooring-booking.com for technical documentation. API access is included in the Captain subscription tier for individual sailors and is available to marina partners via the Partnership Agreement.",
        },
      ],
    },
    {
      category: "For Marinas Appearing in Concierge Booking (Layer 2)",
      questions: [
        {
          q: "My marina appears on your platform but I have not signed any agreement. Is this legal?",
          a: "Yes. Layer 2 listings are compiled from publicly available sources including OpenStreetMap, Google Maps Places API and official maritime authority registries. The legal basis for displaying publicly available business data is the Company’s legitimate interest under Article 6(1)(f) GDPR, consistent with CJEU C-621/22 (KNLTB, 4 October 2024). This is the same legal basis used by Google Maps, TripAdvisor and similar platforms.\n\nIf you are a natural person whose personal contact data appears in our database and you wish to have it removed, contact privacy@mooring-booking.com with the subject line “Removal Request — Marina Operator”. We will process your request within 5 business days. Full details in our GDPR Notice at mooring-booking.com/gdpr-notice.",
        },
        {
          q: "I want to become a Premium Partner. How do I upgrade from Layer 2?",
          a: "Contact partners@mooring-booking.com. Becoming a Premium Partner gives you: a signed contract, your own white-label subdomain, instant booking capability, priority placement in AI Captain recommendations, dashboard and analytics access, and direct Stripe Connect payment integration. No charge until your first confirmed booking under the standard commission model.",
        },
      ],
    },
    {
      category: "Affiliate Program",
      questions: [
        {
          q: "How does the affiliate program work?",
          a: "Register through your account dashboard. You receive a unique tracking link and QR code. You earn 20% of the Mooring Booking service fee on every booking made through your link within the 30-day cookie window. Commissions are paid monthly via Stripe or bank transfer once the minimum payout threshold of €50 is reached. All promotional materials must clearly disclose your affiliate relationship with Mooring Booking in compliance with applicable advertising standards.",
        },
      ],
    },
    {
      category: "Safety & Weather",
      questions: [
        {
          q: "What if bad weather forces me to leave early?",
          a: "No refunds are provided for early departure from confirmed bookings regardless of reason, including weather. Sailors are responsible for their own navigational decisions. AI Captain provides weather forecasts and storm alerts to help plan departure timing. We strongly recommend purchasing appropriate maritime travel insurance from a regulated insurer.",
        },
        {
          q: "Does AI Captain provide weather forecasts?",
          a: "Yes. AI Captain integrates with maritime weather data sources to provide wind speed, wind direction, wave height, tidal information and storm alerts. Weather data is sourced from third-party providers and is provided for informational purposes only. AI Captain weather information does not constitute professional meteorological advice. Always cross-reference with official national meteorological services and NAVTEX. Premium subscribers receive 7-day forecasts. Basic users receive 48-hour forecasts.",
        },
        {
          q: "What is the MAYDAY protocol feature?",
          a: "If you use words indicating a maritime emergency in your AI Captain conversation, the system activates emergency mode. AI Captain provides the standard international MAYDAY VHF protocol, identifies the nearest Maritime Rescue Coordination Centre based on your GPS position, provides relevant emergency telephone numbers, and gives step-by-step guidance in your language.\n\nIN ANY GENUINE MARITIME EMERGENCY, YOUR FIRST ACTION IS VHF CHANNEL 16. DO NOT RELY EXCLUSIVELY ON AI CAPTAIN IN AN EMERGENCY. Emergency contact data may not reflect the most current information. Always have official nautical publications and chart plotters as your primary safety tools.",
        },
        {
          q: "Are moorings inspected for safety?",
          a: "Layer 1 — Premium Marinas: all Premium Partners must declare compliance with applicable maritime safety standards as part of the Partnership Agreement. Mooring Booking does not physically inspect facilities but reserves the right to remove listings where safety concerns are reported.\n\nLayer 2 — Concierge Booking: Mooring Booking has no contractual relationship with Layer 2 facilities and does not verify, inspect or certify their safety. Sailors use Layer 2 facilities entirely at their own risk.\n\nLayer 3 — Explore & Navigate: no inspection, verification or certification of any kind. Navigation reference only.",
        },
        {
          q: "Do I need to register to use the platform?",
          a: "Free registration is required to use booking features. You may browse all listings and navigation references without registration. To submit a booking request, pay via Stripe, access AI Captain beyond the public preview or save vessel profiles, registration is required. Registration is free and takes under 2 minutes.",
        },
      ],
    },
    {
      category: "Technical & Account",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click Forgot Password on the login page. You will receive a password reset link at your registered email address. The link expires after 24 hours. If you do not receive the email within 5 minutes, check your spam folder or contact support@mooring-booking.com.",
        },
        {
          q: "Can I use the app offline?",
          a: "Sailor, Captain and Charter Fleet subscribers have offline access to downloaded charts, 24-hour cached weather data, saved booking confirmations including GPS coordinates and contact details, and AI Captain seamanship guides. An internet connection is required for live AI Captain queries, real-time weather updates, new booking requests and Stripe payment processing.",
        },
        {
          q: "How do I delete my account?",
          a: "Go to Settings > Account > Delete Account. All active bookings must be completed or cancelled before deletion. Personal data is removed from active systems within 30 days in accordance with Privacy Policy v2.0 and GDPR. Transaction records required for legal and tax compliance are retained for 7 years. To request data export before deletion, contact privacy@mooring-booking.com.",
        },
        {
          q: "How does GDPR apply to my data?",
          a: "Mooring Booking.com s.r.o. is the data controller for all personal data processed through the Platform. Your data is processed on the legal bases described in Privacy Policy v2.0 at mooring-booking.com/privacy. You have the right to access, rectify, erase, restrict, port and object to processing of your personal data. To exercise any right, contact privacy@mooring-booking.com. If you are a marina operator whose data appears in a Layer 2 or Layer 3 listing, refer to our GDPR Notice at mooring-booking.com/gdpr-notice.",
        },
      ],
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

              <a href="mailto:info@mooring-booking.com" className="bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow text-center">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-secondary" size={28} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{t('support.businessInquiries')}</h3>
                <p className="text-muted-foreground text-sm mb-4">{t('support.businessInquiriesDesc')}</p>
                <span className="text-secondary font-medium text-sm">info@mooring-booking.com</span>
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
                <p className="text-muted-foreground text-sm">Mooring Booking.com<br />Prague, Czech Republic</p>
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