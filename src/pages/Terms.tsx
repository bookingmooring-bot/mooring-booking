import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-ocean print:hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <FileText className="text-gold mx-auto mb-6" size={48} />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                MOORING BOOKING
              </h1>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground/90 mb-4">
                MASTER TERMS OF SERVICE
              </h2>
              <p className="text-primary-foreground/80 mb-2">Version 3.0 | Intelligent Matrix s.r.o.</p>
              <p className="text-primary-foreground/80 mb-2">{"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
              <p className="text-primary-foreground/80 mb-6">Effective April 2026</p>
              <Button
                onClick={handleDownloadPdf}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="mr-2" size={18} />
                Download PDF
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">

              {/* IMPORTANT NOTICE */}
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-8">
                <h3 className="font-heading text-lg font-bold text-foreground mb-4">IMPORTANT — READ CAREFULLY BEFORE USING THIS PLATFORM</h3>
                <p className="text-muted-foreground">
                  BY ACCESSING, REGISTERING FOR, OR USING THE MOORING BOOKING PLATFORM OR AI CAPTAIN (COLLECTIVELY, THE "PLATFORM"), YOU ENTER INTO A LEGALLY BINDING AGREEMENT WITH INTELLIGENT MATRIX S.R.O. ("COMPANY"). IF YOU DO NOT AGREE TO ALL TERMS, YOU MUST NOT USE THE PLATFORM.
                </p>
              </div>

              {/* SECTION 1 — DEFINITIONS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 1 — DEFINITIONS</h2>
                <p className="text-muted-foreground mb-4">The following definitions apply throughout these Terms and all incorporated policies.</p>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">1.1 Platform</strong> — The Mooring Booking website at mooring-booking.com, the AI Captain application at ai-captain.app, all mobile applications, APIs, subdomains, white-label deployments (such as mooring-booking.com/marinaABC), and all related services operated by Intelligent Matrix s.r.o.</p>
                  <p><strong className="text-foreground">1.2 Company</strong> — Intelligent Matrix s.r.o., a company incorporated under Czech law, registered number [INSERT I{"ČO"}], {"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}, operating the Platform under the brand names Mooring Booking and AI Captain.</p>
                  <p><strong className="text-foreground">1.3 Customer</strong> — Any individual or legal entity who uses the Platform to search for, enquire about, or reserve Mooring Services, including sailors, boat owners, charter skippers, and any other nautical user.</p>
                  <p><strong className="text-foreground">1.4 Provider</strong> — Any individual or legal entity who offers Mooring Services, whether as a Premium Partner (Layer 1), a Concierge Booking facility (Layer 2), or an Explore & Navigate reference location (Layer 3).</p>
                  <p><strong className="text-foreground">1.5 The Three Service Layers</strong> — The Platform organises Mooring Services into three distinct service layers, each with different contractual relationships, booking mechanisms and disclaimers, described in full in Section 4:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Layer 1 — Premium Marinas:</strong> facilities with a signed Partnership Agreement with the Company.</li>
                    <li><strong>Layer 2 — Concierge Booking:</strong> facilities identified from public data sources, accessible via mediated booking request.</li>
                    <li><strong>Layer 3 — Explore & Navigate:</strong> navigational reference locations for which the Company provides no booking service.</li>
                  </ul>
                  <p><strong className="text-foreground">1.6 Premium Partner</strong> — A Provider who has executed a Mooring Booking Partnership Agreement, verified legal authority over listed Mooring Services, and receives priority placement in AI Captain recommendations, search results and white-label dashboard tools.</p>
                  <p><strong className="text-foreground">1.7 Concierge Booking Facility</strong> — A marina, dock, anchorage, field of buoys or similar nautical facility identified from publicly available sources (including OpenStreetMap, Google Maps and official maritime registries) with which the Company has no contractual relationship, but to which the Platform can transmit a booking request on the Customer's behalf.</p>
                  <p><strong className="text-foreground">1.8 Mooring Services</strong> — Any berth, mooring, dock, buoy field, anchorage, dry stack, marina slip, pontoon or similar nautical accommodation listed on or referenced by the Platform.</p>
                  <p><strong className="text-foreground">1.9 Service Fee</strong> — The fee charged by the Company to the Customer in consideration for Platform services including AI search, AI Captain assistance, booking request transmission, and payment infrastructure. The Service Fee is charged by the Company for its own services and is separate from and in addition to any sum payable to a Provider for Mooring Services.</p>
                  <p><strong className="text-foreground">1.10 Commission</strong> — The percentage fee (10–15%) charged by the Company to Premium Partner Providers on total Booking Value processed through the Platform, as specified in each Partner's individual Partnership Agreement.</p>
                  <p><strong className="text-foreground">1.11 AI Captain</strong> — The artificial intelligence conversational assistant operated by the Company at ai-captain.app and as an integrated feature of the Platform, providing informational nautical responses including berth recommendations, navigation guidance, weather information, seamanship advice and travel recommendations.</p>
                  <p><strong className="text-foreground">1.12 Booking Value</strong> — The total amount payable by the Customer for Mooring Services, excluding the Service Fee but including any applicable surcharges, taxes, and fees set by the Provider.</p>
                  <p><strong className="text-foreground">1.13 Stripe Authorize</strong> — The payment pre-authorisation mechanism through which the Customer's payment method is held (not charged) pending Provider confirmation of availability.</p>
                  <p><strong className="text-foreground">1.14 Non-Partner Listing</strong> — Any marina, dock, anchorage or facility appearing in Layer 2 (Concierge Booking) or Layer 3 (Explore & Navigate) that has not executed a Partnership Agreement with the Company.</p>
                </div>
              </div>

              {/* SECTION 2 — NATURE OF THE PLATFORM */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 2 — NATURE OF THE PLATFORM AND FUNDAMENTAL DISCLAIMER</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">2.1 Information Intermediary</strong> — The Company operates the Platform exclusively as an information technology intermediary and marketplace facilitator. The Company is not a mooring operator, marina operator, dock owner, vessel berth lessor, maritime transport provider, travel agent, tour operator, insurance company, financial services provider or professional maritime adviser.</p>
                  <p className="bg-destructive/10 border border-destructive/30 rounded-lg p-4"><strong className="text-foreground">2.2 No Ownership or Control</strong> — THE COMPANY DOES NOT OWN, OPERATE, MANAGE, MAINTAIN, INSPECT, SUPERVISE, CONTROL, GUARANTEE, WARRANT OR TAKE RESPONSIBILITY FOR ANY MOORING, BERTH, DOCK, BUOY, ANCHORAGE, MARINA OR NAUTICAL FACILITY LISTED ON THE PLATFORM, REGARDLESS OF SERVICE LAYER.</p>
                  <p><strong className="text-foreground">2.3 Layer-Specific Scope of Liability</strong> — The Company's responsibilities differ materially across the three service layers. Sections 4.1, 4.2 and 4.3 contain the governing provisions and disclaimers for each layer. Customers must read and understand the applicable layer provisions before initiating any booking or navigation action.</p>
                  <p><strong className="text-foreground">2.4 Sponsored Placement Disclosure</strong> — Premium Partner listings (Layer 1) appear with priority placement in AI Captain recommendations and search results. Such placement is commercially arranged and does not constitute an endorsement of quality, safety, legality or suitability. All sponsored listings are identified with the designation "&#11088; Premium Partner — Sponsored".</p>
                  <p><strong className="text-foreground">2.5 Marketplace Character</strong> — Where transactions are facilitated through the Platform, they occur directly between the Customer and the Provider. The Company facilitates such transactions as a payment collection agent and information intermediary but is not a party to the underlying contract for Mooring Services between Customer and Provider.</p>
                </div>
              </div>

              {/* SECTION 3 — USER ACCOUNTS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 3 — USER ACCOUNTS AND ELIGIBILITY</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">3.1 Age and Capacity</strong> — You must be at least 18 years of age and have full legal capacity to enter into binding contracts. The Platform is not directed to minors.</p>
                  <p><strong className="text-foreground">3.2 Registration Obligations</strong> — You agree to provide accurate, complete and current information upon registration and to maintain such information promptly. You are solely responsible for all activities conducted through your account.</p>
                  <p><strong className="text-foreground">3.3 Account Security</strong> — You are responsible for maintaining the confidentiality of your login credentials. Notify the Company immediately at info@mooring-booking.com of any unauthorised use.</p>
                  <p><strong className="text-foreground">3.4 Account Termination</strong> — The Company may suspend or terminate any account at any time without notice where there are reasonable grounds to believe the account has been used in breach of these Terms or in a manner harmful to the Company, other users or third parties.</p>
                </div>
              </div>

              {/* SECTION 4 — THE THREE SERVICE LAYERS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">SECTION 4 — THE THREE SERVICE LAYERS</h2>
                <p className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-foreground font-semibold mb-6">
                  THE PLATFORM OPERATES THREE DISTINCT SERVICE LAYERS. EACH LAYER HAS DIFFERENT LEGAL CHARACTERISTICS, BOOKING MECHANICS, PAYMENT FLOWS AND DISCLAIMERS. CUSTOMERS MUST IDENTIFY WHICH LAYER APPLIES TO THEIR INTENDED BOOKING BEFORE PROCEEDING.
                </p>

                {/* Layer 1 */}
                <div className="border-l-4 border-yellow-500 pl-6 mb-8">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-1">&#11088; LAYER 1 — PREMIUM MARINAS</h3>
                  <p className="text-sm text-yellow-600 font-semibold mb-4">Premium Partner — Sponsored</p>
                  <p className="text-muted-foreground italic mb-4">Hand-picked marina partners with guaranteed availability, instant booking and exclusive AI Captain recommendations.</p>
                  <div className="space-y-4 text-muted-foreground">
                    <p><strong className="text-foreground">4.1.1 Definition and Identification</strong> — Layer 1 facilities are Premium Partners who have executed a Mooring Booking Partnership Agreement, submitted verified documentation of legal authority over listed Mooring Services, and paid the applicable partnership fee. All Layer 1 listings are identified with the badge "&#11088; Premium Partner — Sponsored" throughout the Platform and in all AI Captain recommendations.</p>
                    <p><strong className="text-foreground">4.1.2 Booking Mechanism</strong> — Layer 1 bookings are processed as follows: the Customer selects a listing and completes the booking form; Stripe captures payment of the full Booking Value plus applicable Service Fee; the Platform transmits reservation confirmation to the Premium Partner; the Partner confirms availability via their dashboard; the Customer receives confirmation with full mooring details, GPS coordinates, contact name and VHF channel. In the event of Partner non-confirmation within 2 hours, the Customer is offered an alternative.</p>
                    <p><strong className="text-foreground">4.1.3 Payment and Commission</strong> — For Layer 1 bookings, the Platform collects the full Booking Value through Stripe Connect. Stripe splits the payment: 85–90% is remitted to the Premium Partner and 10–15% is retained by the Company as Commission, in accordance with each Partner's individual Partnership Agreement. Stripe processing fees (approximately 2.9% + €0.30) are deducted from total proceeds before the Commission split.</p>
                    <p><strong className="text-foreground">4.1.4 White-Label Dashboard</strong> — Premium Partners receive access to a white-label subdomain (e.g., mooring-booking.com/marinaABC), a booking management dashboard, availability calendar, analytics, QR marketing tools and customer messaging system. Dashboard access is subject to the terms of the Partnership Agreement.</p>
                    <p className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm"><strong className="text-foreground">4.1.5 Layer 1 Disclaimer</strong> — Premium Marinas are paid partners of Mooring Booking. Their listings appear with priority placement in AI Captain recommendations and search results. Mooring Booking collects a platform commission of 10–15% on all bookings processed through this layer. Availability, pricing and berth specifications are provided directly by the marina and are subject to change without notice. Mooring Booking does not own, operate or inspect any listed facility. Booking confirmation does not guarantee the physical suitability of the berth for the Customer's vessel. Customers are responsible for independently verifying that berth dimensions, depth and approach are suitable for their vessel prior to arrival. All Layer 1 bookings are subject to these Master Terms of Service and the applicable cancellation policy displayed at checkout.</p>
                  </div>
                </div>

                {/* Layer 2 */}
                <div className="border-l-4 border-blue-500 pl-6 mb-8">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-1">&#128309; LAYER 2 — CONCIERGE BOOKING</h3>
                  <p className="text-sm text-blue-600 font-semibold mb-4">Concierge Booking — Upon Request</p>
                  <p className="text-muted-foreground italic mb-4">We contact the marina on your behalf. You wait, we handle it.</p>
                  <div className="space-y-4 text-muted-foreground">
                    <p><strong className="text-foreground">4.2.1 Definition and Identification</strong> — Layer 2 facilities are marinas, docks, anchorages, buoy fields, restaurants with berths and private mooring concessions identified from publicly available sources including OpenStreetMap (licensed under ODbL v1.0), Google Maps Places API, official maritime authority registries and public nautical databases. The Company has no contractual relationship with Layer 2 facilities. All Layer 2 listings are identified with the badge "&#128309; Concierge Booking — Upon Request".</p>
                    <p><strong className="text-foreground">4.2.2 Booking Mechanism</strong> — Layer 2 bookings proceed as follows: the Customer selects a listing, completes the booking form and authorises payment via Stripe Authorize (funds held, not captured); the Platform transmits a structured booking request to the facility containing vessel name, vessel length, draft, arrival date, number of nights and Customer telephone; the facility confirms or declines within the timeframe specified at checkout; upon confirmation, Stripe captures the Service Fee and the Customer receives facility contact details and mooring information; upon expiry of the confirmation window without response, the Stripe authorisation is automatically cancelled and no charge is made; if declined, AI Captain automatically offers alternative facilities.</p>
                    <p><strong className="text-foreground">4.2.3 Service Fee for Layer 2</strong> — The Service Fee charged to the Customer for Layer 2 bookings represents consideration for AI search and recommendation, booking request preparation and transmission, payment infrastructure, customer support and access to facility contact information upon confirmation. The Service Fee is charged regardless of the facility's reason for declining, except where the authorisation expires without response, in which case no fee is captured. The Service Fee is not a commission charged to the facility.</p>
                    <p><strong className="text-foreground">4.2.4 Contact Information Release</strong> — Facility contact information including telephone number, email address, contact person name and VHF operational channel is released to the Customer only after Stripe Capture confirms successful payment. Prior to confirmation, only public navigational data (GPS coordinates of entry and publicly published VHF working channel) is visible to the Customer.</p>
                    <p className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm"><strong className="text-foreground">4.2.5 Layer 2 Disclaimer</strong> — Concierge Booking listings are compiled from publicly available sources including OpenStreetMap, Google Maps and official maritime authority registries. Mooring Booking has no contractual relationship with these facilities. Your booking request will be forwarded to the facility on your behalf. Mooring Booking cannot guarantee availability, response time or confirmation. The platform service fee is held via Stripe payment authorisation and is only captured upon facility confirmation. If the facility does not confirm within the specified timeframe, your payment authorisation is automatically released in full and no charge is made. Mooring Booking is not liable for any loss, damage or inconvenience arising from a facility's failure to confirm, unavailability of berths, inaccuracies in publicly sourced listing data, or any event occurring after confirmation. Data accuracy relies on publicly available sources which may be outdated. All Layer 2 requests are subject to these Master Terms of Service.</p>
                  </div>
                </div>

                {/* Layer 3 */}
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-1">&#128506;&#65039; LAYER 3 — EXPLORE & NAVIGATE</h3>
                  <p className="text-sm text-green-600 font-semibold mb-4">Navigate Only — No Booking Available</p>
                  <p className="text-muted-foreground italic mb-4">Anchorages, small docks and natural stops across the Mediterranean — for reference and navigation only.</p>
                  <div className="space-y-4 text-muted-foreground">
                    <p><strong className="text-foreground">4.3.1 Definition and Identification</strong> — Layer 3 locations are anchorages, coves, natural harbours, small docks, private jetties and similar nautical waypoints for which the Company has no operator contact data and provides no booking service. Layer 3 is a navigational reference resource only. All Layer 3 listings are identified with the badge "&#128506;&#65039; Navigate Only — No Booking Available".</p>
                    <p><strong className="text-foreground">4.3.2 No Booking, No Confirmation, No Access Right</strong> — No booking, reservation, confirmation or right of access of any kind is created or implied by the display of a Layer 3 location on the Platform or by any AI Captain reference to such a location. Customers must independently obtain any required permissions, harbour master approvals or anchorage rights applicable to Layer 3 locations.</p>
                    <p><strong className="text-foreground">4.3.3 Data Sources</strong> — Layer 3 location data is sourced from publicly available nautical databases including OpenStreetMap (ODbL v1.0), OpenSeaMap, official Electronic Navigational Charts (ENC S-57 format) from relevant hydrographic offices, and publicly available maritime authority registries.</p>
                    <p className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-sm"><strong className="text-foreground">4.3.4 Layer 3 Disclaimer</strong> — Explore & Navigate listings are provided for informational and navigation reference purposes only. These locations have no contractual or operational relationship with Mooring Booking. Information displayed — including coordinates, depth, wind protection and facilities — is sourced from publicly available nautical databases and may be incomplete, inaccurate or outdated. Mooring Booking does not endorse, recommend or guarantee access to any location in this category. No booking, reservation or access right is created by viewing or selecting any listing. Users are solely responsible for verifying navigational data through official charts and nautical authorities before approaching any location. Mooring Booking expressly disclaims all liability for any navigational incident, grounding, collision, capsizing, vessel damage, personal injury, death or any other loss arising from reliance on information in this category. Always consult official nautical charts published by competent hydrographic authorities and contact the relevant harbour master or maritime authority before entering any unfamiliar location.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 5 — BOOKINGS, SERVICE FEES AND PAYMENT */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 5 — BOOKINGS, SERVICE FEES AND PAYMENT</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">5.1 Service Fee Levels</strong> — The Service Fee applicable to each booking is displayed at checkout before payment. Standard tiers:</p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <ul className="space-y-2">
                      <li>Vessels up to 8 metres: <strong className="text-foreground">€12</strong> per booking</li>
                      <li>Vessels 8–12 metres: <strong className="text-foreground">€19</strong> per booking</li>
                      <li>Vessels 12–18 metres: <strong className="text-foreground">€35</strong> per booking</li>
                      <li>Vessels 18–24 metres: <strong className="text-foreground">€59</strong> per booking</li>
                      <li>Vessels over 24 metres and superyachts: <strong className="text-foreground">€99</strong> per booking</li>
                      <li>Now4Today same-day bookings: standard tier plus <strong className="text-foreground">20% surcharge</strong></li>
                    </ul>
                  </div>
                  <p>The Company reserves the right to modify Service Fee levels upon 30 days' notice. The fee applicable at checkout time governs that booking.</p>
                  <p><strong className="text-foreground">5.2 Payment Processing</strong> — All payments are processed by Stripe, Inc. or its applicable local entity. By using payment features, you also agree to Stripe's Terms of Service at stripe.com/legal. The Company acts as a limited payment collection agent for Premium Partner Providers in respect of the Provider's share of Booking Value.</p>
                  <p><strong className="text-foreground">5.3 Stripe Authorize and Capture — Layer 2</strong> — For Layer 2 Concierge Bookings, Stripe Authorize places a hold on the Customer's payment method without immediate capture. The hold is automatically cancelled if the facility does not respond within the confirmation window. No charge is made unless and until the facility confirms availability.</p>
                  <p><strong className="text-foreground">5.4 Now4Today Same-Day Premium</strong> — Same-day bookings available from 01:00 to 23:00 carry a mandatory surcharge of 20% on the base Booking Value. Service Fee and Commission (where applicable) are calculated on the full surcharge-inclusive amount.</p>
                  <p><strong className="text-foreground">5.5 Cancellations and Refunds</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Premium Partner (Layer 1) cancellations by Provider:</strong> Customer receives full refund including Service Fee.</li>
                    <li><strong>Customer cancellations:</strong> subject to Provider's cancellation policy displayed at checkout; Service Fee is non-refundable unless Provider has specified fully refundable terms.</li>
                    <li><strong>Concierge Booking (Layer 2):</strong> if facility does not confirm within the specified window, Stripe authorisation is automatically cancelled and no charge is made. If facility declines, Stripe authorisation is released within 24 hours. Service Fee is captured only upon positive confirmation.</li>
                  </ul>
                  <p><strong className="text-foreground">5.6 Currency and Taxes</strong> — All amounts are displayed in Euros unless otherwise indicated. Providers are solely responsible for all applicable taxes including VAT, income tax and tourism levies arising from their Mooring Services.</p>
                </div>
              </div>

              {/* SECTION 6 — PROVIDER OBLIGATIONS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 6 — PROVIDER OBLIGATIONS (PREMIUM PARTNERS — LAYER 1)</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">6.1 Legal Authority</strong> — By listing Mooring Services as a Premium Partner, the Provider represents and warrants holding valid and enforceable legal right of disposal, ownership, lease, concession, or other lawful authorisation to permit vessels to use the listed Mooring Services on a commercial basis. Documentary evidence must be provided upon request within five business days.</p>
                  <p><strong className="text-foreground">6.2 Accuracy of Information</strong> — Providers must maintain accurate listing information at all times, including GPS coordinates, vessel size limitations, depth, available facilities, pricing, availability calendar, and applicable rules and regulations.</p>
                  <p><strong className="text-foreground">6.3 Response Obligations</strong> — Providers must respond to booking requests within 2 hours during 08:00–22:00 local time and within 6 hours outside those hours. Consistent failure to respond results in downgrading of search placement.</p>
                  <p><strong className="text-foreground">6.4 Anti-Circumvention</strong> — Providers must not induce Customers introduced through the Platform to make future bookings outside the Platform. This includes directing Customers to external booking systems, offering sub-Platform prices to the same Customer, or explicitly soliciting direct future bookings. Violation constitutes material breach.</p>
                  <p><strong className="text-foreground">6.5 Commission on Circumvented Bookings</strong> — Where a Provider circumvents the Platform, Commission is due on all bookings made by Customers originally introduced through the Platform within twelve months of the Customer's last Platform interaction, whether or not processed through the Platform.</p>
                  <p><strong className="text-foreground">6.6 Compliance with Maritime Law</strong> — Providers are solely responsible for compliance with all applicable maritime law, harbour regulations, environmental regulations, safety standards, licensing requirements, insurance obligations, and any other legal requirements applicable to their Mooring Services.</p>
                </div>
              </div>

              {/* SECTION 7 — CUSTOMER OBLIGATIONS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 7 — CUSTOMER OBLIGATIONS</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">7.1 Nautical Competence</strong> — Customers are solely responsible for holding all necessary nautical qualifications, licences and certifications required to operate their vessel in relevant waters. The Company accepts no liability for consequences arising from failure to hold required qualifications.</p>
                  <p><strong className="text-foreground">7.2 Vessel Suitability</strong> — Customers are responsible for verifying, prior to booking, that listed Mooring Services are suitable for their vessel in all respects including length, beam, draft, power requirements and vessel type. Specifications provided on the Platform are informational only.</p>
                  <p><strong className="text-foreground">7.3 Accuracy of Booking Information</strong> — Customers must provide accurate vessel information including dimensions, type and registration. Inaccurate vessel data resulting in damage or unsuitability is the Customer's sole responsibility.</p>
                  <p><strong className="text-foreground">7.4 Compliance</strong> — Customers must comply with all rules and regulations of any facility at which they berth, and with all applicable maritime law, customs, immigration and environmental regulations.</p>
                </div>
              </div>

              {/* SECTION 8 — AI CAPTAIN */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 8 — AI CAPTAIN — SCOPE, LIMITATIONS AND DISCLAIMER</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="bg-destructive/10 border border-destructive/30 rounded-lg p-4"><strong className="text-foreground">8.1 Informational Purpose Only</strong> — ALL RESPONSES, RECOMMENDATIONS, ADVICE, INFORMATION, WARNINGS AND GUIDANCE PROVIDED BY AI CAPTAIN ARE PROVIDED FOR INFORMATIONAL PURPOSES ONLY AND DO NOT CONSTITUTE PROFESSIONAL MARITIME ADVICE, NAVIGATIONAL ADVICE, METEOROLOGICAL ADVICE, MEDICAL ADVICE OR ANY OTHER FORM OF PROFESSIONAL ADVICE.</p>
                  <p><strong className="text-foreground">8.2 Not a Substitute for Professional Judgment</strong> — AI Captain does not replace the judgment, skill and expertise of a qualified marine professional, licensed captain, certified navigator or maritime safety officer. Users must not rely on AI Captain as the sole basis for any navigational, safety or medical decision.</p>
                  <p className="bg-destructive/10 border border-destructive/30 rounded-lg p-4"><strong className="text-foreground">8.3 MAYDAY and Emergency Protocols</strong> — AI Captain provides informational content about MAYDAY protocols and emergency contacts for reference only. Emergency contact information may not be current or applicable to the user's specific location. IN ANY GENUINE MARITIME EMERGENCY, USE VHF RADIO ON CHANNEL 16. DO NOT RELY EXCLUSIVELY ON AI CAPTAIN.</p>
                  <p><strong className="text-foreground">8.4 Layer 1 Priority in AI Recommendations</strong> — AI Captain recommendations prioritise Premium Partner facilities (Layer 1) as the first category presented, followed by Concierge Booking facilities (Layer 2) and Explore & Navigate references (Layer 3). This prioritisation reflects the Company's commercial arrangements with Premium Partners and is disclosed to all users.</p>
                  <p><strong className="text-foreground">8.5 Data Accuracy</strong> — AI Captain responses are generated using data from the Platform's marina database enriched with publicly available sources. Response accuracy depends on the completeness and currency of source data. The Company does not guarantee the accuracy of any AI Captain response.</p>
                </div>
              </div>

              {/* SECTION 9 — DATA PROTECTION AND GDPR */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 9 — DATA PROTECTION AND GDPR</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">9.1 Data Controller</strong> — Intelligent Matrix s.r.o. is the data controller for personal data processed through the Platform pursuant to GDPR (EU) 2016/679. Contact: privacy@mooring-booking.com.</p>
                  <p><strong className="text-foreground">9.2 Legal Bases</strong> — Personal data is processed on the following bases: (a) performance of contract (Article 6(1)(b)) for account and booking services; (b) legal obligation (Article 6(1)(c)) for financial records; (c) legitimate interest (Article 6(1)(f)) for security and service improvement; (d) consent (Article 6(1)(a)) for marketing and analytics cookies.</p>
                  <p><strong className="text-foreground">9.3 Non-Partner Listing Data</strong> — Business data of legal entities in Layer 2 and Layer 3 listings is not personal data under GDPR. For natural persons operating small facilities whose publicly published contact data is included, processing is based on legitimate interest under Article 6(1)(f) GDPR, as confirmed by CJEU in C-621/22 (KNLTB, 4 October 2024). Opt-out requests are processed at privacy@mooring-booking.com within 5 business days.</p>
                  <p><strong className="text-foreground">9.4 Business Transition Consent</strong> — By accepting these Terms, users expressly consent pursuant to Articles 6(1)(a) and 49(1)(a) GDPR to the transfer of personal data to any successor entity in any sale, merger, acquisition or change of ownership of the Company or Platform. Users will be notified within 30 days of completion. This consent may be withdrawn at privacy@mooring-booking.com.</p>
                </div>
              </div>

              {/* SECTION 10 — LIMITATION OF LIABILITY */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 10 — COMPREHENSIVE LIMITATION OF LIABILITY</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="bg-destructive/10 border border-destructive/30 rounded-lg p-4"><strong className="text-foreground">10.1 Disclaimer of Warranties</strong> — TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM AND ALL SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OR TITLE.</p>
                  <p><strong className="text-foreground">10.2 No Liability for Maritime Incidents</strong> — THE COMPANY IS NOT LIABLE FOR: condition, safety or legality of any listed facility; personal injury, death or property damage at any facility; vessel damage arising from use of Mooring Services; navigational incidents, groundings, collisions or capsizing; weather, tidal or environmental damage; loss arising from inability to access any listed facility.</p>
                  <p><strong className="text-foreground">10.3 No Indirect Loss</strong> — THE COMPANY IS NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOSS OF REVENUE, LOSS OF DATA OR BUSINESS OPPORTUNITY, HOWEVER CAUSED AND REGARDLESS OF THEORY OF LIABILITY.</p>
                  <p className="bg-warning/10 border border-warning/30 rounded-lg p-4"><strong className="text-foreground">10.4 Aggregate Cap</strong> — THE COMPANY'S TOTAL AGGREGATE LIABILITY TO ANY USER SHALL NOT EXCEED THE LESSER OF: (A) TOTAL SERVICE FEES AND SUBSCRIPTION FEES PAID BY THAT USER IN THE 12 MONTHS PRECEDING THE CLAIM; OR (B) TWO THOUSAND EUROS (€2,000).</p>
                  <p><strong className="text-foreground">10.5 Layer-Specific Liability</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Layer 1 (Premium Marinas):</strong> liability is limited to the Service Fee paid for the specific booking giving rise to the claim.</li>
                    <li><strong>Layer 2 (Concierge Booking):</strong> liability is limited to the Service Fee captured for the confirmed booking; the Company is not liable for non-confirmation or delayed confirmation by the facility.</li>
                    <li><strong>Layer 3 (Explore & Navigate):</strong> the Company accepts no liability whatsoever for use of navigation reference data; all navigational decisions are the Customer's sole responsibility.</li>
                  </ul>
                  <p><strong className="text-foreground">10.6 Consumer Protections</strong> — Nothing in these Terms limits liability for death or personal injury caused by the Company's gross negligence or wilful misconduct, fraudulent misrepresentation, or any liability that cannot be excluded under applicable mandatory law. EU consumer residents retain mandatory statutory rights where more favourable.</p>
                </div>
              </div>

              {/* SECTION 11 — SUBSCRIPTION TIERS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 11 — SUBSCRIPTION TIERS AND OPTIONAL SERVICES</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">11.1 Customer Tiers:</strong></p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <ul className="space-y-2">
                      <li><strong>Basic (Free):</strong> AI Captain with 10 questions per calendar month, basic search, booking requests with applicable Service Fees.</li>
                      <li><strong>Sailor (€19.99/month or €149/year):</strong> unlimited reservations for vessels up to 12m, offline charts, weather alerts, priority support.</li>
                      <li><strong>Captain (€34.99/month or €259/year):</strong> unlimited reservations for all vessel sizes, charter tools, advanced analytics.</li>
                      <li><strong>Charter Fleet (€199/month or €1,790/year):</strong> up to 15 vessels, bulk reservations, dedicated account manager.</li>
                      <li><strong>AI-Only (€7.99/month or €59/year):</strong> AI Captain access only, no booking functionality.</li>
                    </ul>
                  </div>
                  <p><strong className="text-foreground">11.2 Premium Partner Subscription</strong> — Verified Partner (€199/month): full dashboard, analytics, availability calendar, white-label subdomain, priority placement, photo gallery (up to 10 images), and customer messaging.</p>
                  <p><strong className="text-foreground">11.3 Auto-Renewal</strong> — All subscriptions auto-renew at the end of each billing period. No refunds for partial subscription periods except as required by mandatory consumer law. Pricing modifications communicated with 30 days' notice.</p>
                </div>
              </div>

              {/* SECTION 12 — VEZ OSIGURAN */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 12 — VEZ OSIGURAN — MOORING DAMAGE MEDIATION SERVICE</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">12.1 Nature of Service</strong> — Vez Osiguran is a mediation and assistance service, not an insurance product. The Company is not a regulated insurance provider. The service provides documentation of vessel and mooring condition at booking, access to the Company's dispute resolution process, and coordination assistance in communicating damage claims between parties.</p>
                  <p><strong className="text-foreground">12.2 Limitation</strong> — Vez Osiguran does not guarantee payment in respect of any claim. The Company's mediation efforts are offered as a customer service gesture without creating liability to ensure any particular outcome.</p>
                </div>
              </div>

              {/* SECTION 13 — INTELLECTUAL PROPERTY */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 13 — INTELLECTUAL PROPERTY</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">13.1 Company IP</strong> — All intellectual property in the Platform — including software, source code, algorithms, AI Captain technology, UI designs, logos, trademarks, brand names Mooring Booking and AI Captain, and business methods — are and remain the exclusive property of Intelligent Matrix s.r.o. No User acquires any right, title or interest in Company IP.</p>
                  <p><strong className="text-foreground">13.2 User Content Licence</strong> — By submitting content to the Platform, Users grant the Company a perpetual, worldwide, irrevocable, royalty-free, transferable licence to use, reproduce, modify, distribute and display such content in connection with the Platform and any successor services.</p>
                  <p><strong className="text-foreground">13.3 AI Captain Technology Protection</strong> — The AI technology underlying AI Captain, including all prompts, training approaches and conversational models, constitutes proprietary trade secrets. Reverse engineering, extraction or reproduction of AI Captain technology is strictly prohibited.</p>
                </div>
              </div>

              {/* SECTION 14 — PROHIBITED ACTIVITIES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 14 — PROHIBITED ACTIVITIES</h2>
                <div className="text-muted-foreground">
                  <p className="mb-4">Users are strictly prohibited from:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Listing Mooring Services without valid legal authority over them</li>
                    <li>Providing false, misleading or fraudulent information</li>
                    <li>Circumventing Service Fee or Commission obligations</li>
                    <li>Contacting parties introduced through the Platform to avoid fees</li>
                    <li>Harassing, threatening or discriminating against any user or Company staff</li>
                    <li>Violating applicable maritime law, concession regulations or harbour rules</li>
                    <li>Manipulating or fabricating Platform reviews or ratings</li>
                    <li>Reverse engineering, scraping or bulk data extraction from the Platform</li>
                    <li>Introducing malware, viruses or harmful code</li>
                    <li>Creating multiple accounts for fraudulent purposes</li>
                    <li>Using AI Captain or Platform technology to develop competing products</li>
                  </ul>
                  <p className="mt-4 font-semibold text-foreground">Breach of any prohibition constitutes material breach and grounds for immediate account termination.</p>
                </div>
              </div>

              {/* SECTION 15 — INDEMNIFICATION */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 15 — INDEMNIFICATION</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">15.1 User Indemnification</strong> — Each User agrees to indemnify, defend and hold harmless Intelligent Matrix s.r.o. and its directors, officers, employees and agents from all claims, losses, liabilities, damages, costs and expenses (including legal fees) arising from: use of the Platform or any Mooring Services accessed through it; violation of these Terms or applicable law; content submitted to the Platform; injury, death or property damage arising at or in connection with Mooring Services; failure to hold required qualifications or comply with maritime regulations; and any tax liability arising from Platform use.</p>
                  <p><strong className="text-foreground">15.2 Provider Indemnification</strong> — Providers additionally indemnify the Company against claims arising from the condition, availability, legality or safety of listed Mooring Services, failure to honour confirmed bookings, and misrepresentation in listing information.</p>
                </div>
              </div>

              {/* SECTION 16 — DISPUTE RESOLUTION */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 16 — DISPUTE RESOLUTION, ARBITRATION AND GOVERNING LAW</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">16.1 Informal Resolution</strong> — Parties agree to attempt good-faith resolution for 30 days before initiating formal proceedings.</p>
                  <p><strong className="text-foreground">16.2 Binding Arbitration</strong> — Unresolved disputes shall be finally determined by ICC arbitration, sole arbitrator, seat in Prague, language English. The award is final and binding.</p>
                  <p className="bg-destructive/10 border border-destructive/30 rounded-lg p-4"><strong className="text-foreground">16.3 Class Action Waiver</strong> — TO THE MAXIMUM EXTENT PERMITTED BY LAW, EACH USER WAIVES ANY RIGHT TO PARTICIPATE IN CLASS ACTION, CLASS ARBITRATION OR REPRESENTATIVE ACTION. DISPUTES MUST BE BROUGHT INDIVIDUALLY.</p>
                  <p><strong className="text-foreground">16.4 EU Consumer Rights</strong> — EU-resident consumers retain rights to mandatory consumer dispute resolution mechanisms and courts in their country of residence under EU Regulation 524/2013. The EU ODR platform is at ec.europa.eu/odr.</p>
                  <p><strong className="text-foreground">16.5 Governing Law</strong> — These Terms are governed by Czech law, without regard to conflict of laws provisions, except that mandatory consumer protection law of the User's country of residence applies to the extent required.</p>
                </div>
              </div>

              {/* SECTION 17 — GENERAL PROVISIONS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 17 — GENERAL PROVISIONS</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">17.1 Entire Agreement</strong> — These Terms, together with the Privacy Policy, Cookie Policy, GDPR Notice for Marina Operators, and where applicable the Partnership Agreement and Affiliate Agreement, constitute the entire agreement between the User and the Company.</p>
                  <p><strong className="text-foreground">17.2 Severability</strong> — If any provision is held invalid or unenforceable, it shall be modified to the minimum extent necessary, or severed. Invalidity of any provision does not affect remaining provisions.</p>
                  <p><strong className="text-foreground">17.3 No Waiver</strong> — Failure to enforce any right does not constitute a waiver. Any waiver must be in writing and signed by an authorised Company representative.</p>
                  <p><strong className="text-foreground">17.4 Assignment</strong> — Users may not assign these Terms without prior written consent. The Company may freely assign to any affiliate, successor or acquirer without consent.</p>
                  <p><strong className="text-foreground">17.5 Force Majeure</strong> — The Company is not liable for failure to perform due to circumstances beyond reasonable control, including acts of God, pandemics, war, government actions, cyberattacks or internet infrastructure failures.</p>
                  <p><strong className="text-foreground">17.6 Modifications</strong> — Material changes will be notified 30 days before taking effect via email and Platform notice. Continued use after the effective date constitutes acceptance.</p>
                  <p><strong className="text-foreground">17.7 Language</strong> — These Terms are made in the English language. Where translations are provided for convenience, the English version prevails.</p>
                </div>
              </div>

              {/* SECTION 18 — CONTACT */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">SECTION 18 — CONTACT INFORMATION</h2>
                <div className="text-muted-foreground space-y-2">
                  <p>General enquiries: <strong className="text-foreground">info@mooring-booking.com</strong></p>
                  <p>Legal and compliance: <strong className="text-foreground">legal@mooring-booking.com</strong></p>
                  <p>Data protection and GDPR: <strong className="text-foreground">privacy@mooring-booking.com</strong></p>
                  <p>Partner enquiries: <strong className="text-foreground">partners@mooring-booking.com</strong></p>
                  <p className="mt-4">Registered entity: <strong className="text-foreground">Intelligent Matrix s.r.o.</strong></p>
                  <p>{"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
                  <p>Telephone: <strong className="text-foreground">+420 739 328 337</strong></p>
                </div>
              </div>

              {/* EFFECTIVE DATE */}
              <div className="text-center text-muted-foreground py-4">
                <p>These Master Terms of Service are effective as of April 2026.</p>
                <p>Version 3.0. &copy; Intelligent Matrix s.r.o. All rights reserved.</p>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
