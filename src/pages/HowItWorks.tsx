import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Search, Calendar, Navigation, CreditCard, Shield, Anchor, CheckCircle,
  Ship, Crown, MapPin, Phone, Star, Compass, Clock, Radio, Users,
  FileText, BarChart3, QrCode, Zap, Eye, MessageSquare, Waves,
  Bot, Globe, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LayerBadge = ({ color, label }: { color: string; label: string }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
    {label}
  </span>
);

const StepCard = ({
  number, title, description, features, icon: Icon,
}: {
  number: string; title: string; description: string; features: string[]; icon: React.ElementType;
}) => (
  <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-3xl font-heading font-bold text-secondary/20">{number}</span>
      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
        <Icon className="text-secondary" size={20} />
      </div>
      <h4 className="font-heading font-bold text-foreground">{title}</h4>
    </div>
    <p className="text-muted-foreground text-sm mb-3">{description}</p>
    <ul className="space-y-1.5">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

const PlanCard = ({
  name, price, period, features, icon: Icon, highlight, badge, badgeColor,
}: {
  name: string; price: string; period?: string; features: string[];
  icon: React.ElementType; highlight?: boolean; badge?: string; badgeColor?: string;
}) => (
  <div className={`bg-card rounded-2xl p-6 shadow-card hover:shadow-hover transition-all ${highlight ? "ring-2 ring-gold scale-[1.02]" : ""}`}>
    {badge && (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${badgeColor || "bg-secondary/10 text-secondary"}`}>
        {badge}
      </span>
    )}
    <Icon className={`${highlight ? "text-gold" : "text-secondary"} mb-3`} size={32} />
    <h4 className="font-heading font-bold text-lg text-foreground">{name}</h4>
    <div className="mt-1 mb-3">
      <span className="text-2xl font-bold text-foreground">{price}</span>
      {period && <span className="text-muted-foreground text-sm ml-1">{period}</span>}
    </div>
    <ul className="space-y-1.5">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* ── Hero ── */}
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 left-10 opacity-10 animate-float">
            <Anchor size={80} className="text-gold" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                How Mooring Booking Works
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                The smartest way to find, book and navigate to any mooring, berth, dock or anchorage
                across the Mediterranean — and beyond. Powered by AI Captain.
              </p>
            </div>
          </div>
        </section>

        {/* ── For Sailors heading ── */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 text-center">
            <span className="text-secondary font-medium">For Sailors & Boat Owners</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">
              Find Your Perfect Mooring — Three Ways to Book
            </h2>
          </div>
        </section>

        {/* ═══ LAYER 1 — Premium Marinas ═══ */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Star className="text-gold" size={28} />
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  Layer 1 — Premium Marinas
                </h3>
              </div>
              <p className="text-gold font-semibold mb-2">Instant booking. Guaranteed availability.</p>
              <p className="text-muted-foreground mb-8 max-w-3xl">
                The fastest and most reliable way to secure your berth. Premium Partner marinas have
                signed directly with Mooring Booking — availability is real, confirmation is instant,
                and your berth is waiting when you arrive.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StepCard
                  number="01" title="Search & Discover" icon={Search}
                  description="Ask AI Captain or use the search to find Premium Partner marinas near your route. Filter by location, depth, vessel length, wind protection, amenities and price."
                  features={[
                    "Real-time availability calendar",
                    "Verified depth and berth dimensions",
                    "Interactive nautical map",
                    "Priority placement in AI Captain recommendations",
                    "Now4Today last-minute availability",
                  ]}
                />
                <StepCard
                  number="02" title="Book Instantly & Pay Securely" icon={CreditCard}
                  description="Select your dates, confirm your vessel details and pay in one step. Stripe processes the full amount immediately. No waiting, no uncertainty."
                  features={[
                    "Secure payment via Stripe",
                    "Instant booking confirmation",
                    "Visa, Mastercard, Google Pay, Apple Pay",
                    "Free cancellation where offered by marina",
                    "Service fee based on vessel length (€12–€99)",
                  ]}
                />
                <StepCard
                  number="03" title="Navigate to Your Berth" icon={Navigation}
                  description="Confirmation unlocks full marina contact details, GPS coordinates of the entry point, VHF channel and the name of the marinero who will guide you in. AI Captain provides turn-by-turn nautical navigation."
                  features={[
                    "Precise GPS entry coordinates",
                    "VHF channel and contact name",
                    "AI Captain weather assistant",
                    "Manoeuvring advice for your vessel type",
                    "Storm alerts and weather window recommendations",
                  ]}
                />
                <StepCard
                  number="04" title="Dock, Enjoy & Review" icon={Anchor}
                  description="Arrive with confidence. Your berth is confirmed, the marina is expecting you. Access check-in instructions, amenity information and provider contact directly from the app."
                  features={[
                    "Marinero contact on arrival",
                    "Check-in instructions",
                    "Amenity and service details",
                    "Community reviews from verified guests",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ LAYER 2 — Concierge Booking ═══ */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="text-blue-500" size={28} />
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  Layer 2 — Concierge Booking
                </h3>
              </div>
              <p className="text-blue-500 font-semibold mb-2">We contact the marina on your behalf. You wait, we handle it.</p>
              <p className="text-muted-foreground mb-8 max-w-3xl">
                Thousands of Mediterranean marinas, docks, buoy fields and restaurant berths are
                available through our Concierge Booking service. These facilities are not direct
                partners but our platform sends your request and manages the process for you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StepCard
                  number="01" title="Search & Discover" icon={Globe}
                  description="AI Captain searches our database of publicly sourced Mediterranean facilities. Browse by location, vessel size, depth and services."
                  features={[
                    "30,000+ locations in database",
                    "Publicly sourced data from OSM, Google Maps and maritime registries",
                    "AI Captain secondary recommendations after Premium results",
                    "Concierge Booking badge clearly displayed on all listings",
                  ]}
                />
                <StepCard
                  number="02" title="Send Your Request" icon={FileText}
                  description="Complete the booking form with your vessel details. Stripe holds your service fee — no money is taken until the marina confirms."
                  features={[
                    "Vessel name, length, draft and arrival details",
                    "Stripe Authorize holds fee — not charged until confirmed",
                    "Platform sends structured request to marina on your behalf",
                    "You receive notification when marina responds",
                  ]}
                />
                <StepCard
                  number="03" title="Await Confirmation" icon={Clock}
                  description="The marina responds directly to our platform. If confirmed within the specified window, Stripe captures the service fee and you receive full contact details. If no response, your hold is automatically released — no charge."
                  features={[
                    "Confirmation window displayed at booking",
                    "Automatic release if no response — zero charge",
                    "AI Captain offers alternatives if declined",
                    "Service fee only captured on positive confirmation",
                  ]}
                />
                <StepCard
                  number="04" title="Navigate & Arrive" icon={Navigation}
                  description="On confirmation you receive the marina telephone, email, contact name and VHF channel. AI Captain guides you in."
                  features={[
                    "Full contact details unlocked on confirmation",
                    "GPS coordinates and VHF channel",
                    "AI Captain navigation assistance",
                    "Manoeuvring and weather guidance",
                  ]}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-6 bg-card rounded-lg p-4 border">
                Concierge Booking listings are compiled from publicly available sources. Mooring Booking
                has no contractual relationship with these facilities. Payment is only captured upon
                marina confirmation. Full terms apply — see{" "}
                <Link to="/terms" className="underline hover:text-foreground">Master Terms of Service v3.0</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ LAYER 3 — Explore & Navigate ═══ */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <Compass className="text-emerald-500" size={28} />
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                  Layer 3 — Explore & Navigate
                </h3>
              </div>
              <p className="text-emerald-500 font-semibold mb-2">
                Anchorages, coves and natural stops across the Mediterranean — for reference and navigation only.
              </p>
              <p className="text-muted-foreground mb-8 max-w-3xl">
                Discover thousands of anchorages, small docks, coves and natural harbours along your
                route. This layer is a navigational reference resource — no booking, no confirmation,
                no guaranteed access.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StepCard
                  number="01" title="Discover Waypoints" icon={MapPin}
                  description="Browse anchorages, natural harbours, small docks and coves by location, depth and wind protection. Use AI Captain to plan your route with layover stops."
                  features={[
                    "Thousands of Mediterranean anchorages and natural stops",
                    "Depth and wind protection data where available",
                    "Route planning with AI Captain",
                    "Navigate Only badge clearly displayed on all listings",
                  ]}
                />
                <StepCard
                  number="02" title="Plan Your Route" icon={Waves}
                  description="Ask AI Captain to build a complete itinerary including anchoring stops, fuel points, water availability and weather windows."
                  features={[
                    "AI Captain route planning",
                    "Weather window recommendations",
                    "Fuel and water waypoints",
                    "Estimated travel times",
                  ]}
                />
                <StepCard
                  number="03" title="Navigate" icon={Navigation}
                  description="Use AI Captain for real-time navigation guidance, weather alerts and manoeuvring advice. Tap any location for GPS coordinates."
                  features={[
                    "GPS coordinates from public nautical databases",
                    "AI Captain weather and tidal assistance",
                    "VHF channel where publicly available",
                    "MAYDAY protocol assistance if needed",
                  ]}
                />
              </div>

              <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-muted-foreground">
                  Explore & Navigate listings are for informational and navigation reference purposes only.
                  No booking or right of access is created by viewing any listing. Users are solely responsible
                  for verifying navigational data through official charts before approaching any location.
                  Mooring Booking disclaims all liability for navigational incidents arising from reliance on
                  this data — always consult official nautical charts and contact the relevant harbour master.
                  Full disclaimer in{" "}
                  <Link to="/terms" className="underline hover:text-foreground">Master Terms of Service v3.0</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ For Providers ═══ */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-secondary font-medium">For Mooring Owners & Concession Holders</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">
                List Your Mooring in 10 Minutes
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Whether you own a private dock, hold a maritime concession for a buoy field, operate
                a small marina or have berths at your restaurant — turn your unused mooring capacity
                into consistent income.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  num: 1, icon: CheckCircle, title: "Register Free",
                  desc: "Create your provider account in minutes. No upfront costs, no monthly subscription required to list.",
                },
                {
                  num: 2, icon: FileText, title: "List Your Mooring",
                  desc: "Add photos, description, amenities, vessel size limits, depth, pricing and set your availability calendar. Your listing goes live immediately.",
                },
                {
                  num: 3, icon: Shield, title: "Sign Partnership Agreement",
                  desc: "Confirm your legal right of disposal or maritime concession over your mooring. Agree to our commission structure — 15% for standard partners, 12% for facilities with 50+ berths.",
                },
                {
                  num: 4, icon: BarChart3, title: "Get Your White-Label Dashboard",
                  desc: "Receive your dedicated subdomain (mooring-booking.com/yourname), booking management dashboard, availability calendar, analytics and QR marketing tools.",
                },
                {
                  num: 5, icon: Zap, title: "Start Earning",
                  desc: "Bookings arrive through AI Captain recommendations, Platform search and your personal QR code. Stripe pays your share automatically after each confirmed stay.",
                },
              ].map((step) => (
                <div key={step.num} className="relative bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow">
                  <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-primary-foreground font-heading font-bold shadow-card">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="text-secondary" size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-sm text-muted-foreground mb-4">
                Free registration · 15% commission (12% for 50+ berths) · Instant QR code · White-label dashboard included
              </p>
              <Link to="/become-provider">
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-8 h-14">
                  <Anchor className="mr-2" size={20} />
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ Subscription Plans ═══ */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-gold font-medium">Subscription Plans</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">
                Unlock the Full AI Captain Experience
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                All users register free. Upgrade to access unlimited AI Captain, offline charts,
                advanced weather, priority booking and more.
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              <PlanCard
                name="Basic" price="Free" icon={Anchor}
                badge="Free Forever" badgeColor="bg-secondary/10 text-secondary"
                features={[
                  "Browse all three booking layers",
                  "Submit Concierge Booking requests",
                  "10 AI Captain questions per month",
                  "Basic weather info",
                  "Access to Explore & Navigate",
                ]}
              />
              <PlanCard
                name="Sailor" price="€19.99" period="/month or €149/year" icon={Ship} highlight
                badge="Most Popular" badgeColor="bg-gold text-gold-foreground"
                features={[
                  "Unlimited AI Captain",
                  "7-day nautical forecasts",
                  "Offline charts & storm alerts",
                  "Now4Today last-minute alerts",
                  "Turn-by-turn navigation",
                  "Priority booking",
                  "Unlimited reservations (up to 12m)",
                  "Service fee waived (up to 12m)",
                ]}
              />
              <PlanCard
                name="Captain" price="€34.99" period="/month or €259/year" icon={Crown} highlight
                badge="Full Power" badgeColor="bg-gold text-gold-foreground"
                features={[
                  "Everything in Sailor",
                  "Unlimited reservations (all sizes)",
                  "Charter onboard tools",
                  "Advanced route planning",
                  "Analytics dashboard",
                  "Service fee waived (all sizes)",
                ]}
              />
              <PlanCard
                name="Charter Fleet" price="€199" period="/month or €1,790/year" icon={Users}
                badge="Enterprise" badgeColor="bg-primary text-primary-foreground"
                features={[
                  "Up to 15 vessels on one account",
                  "Bulk reservations",
                  "Dedicated account manager",
                  "White-label charter tool",
                  "Guest onboarding",
                  "Fleet analytics",
                ]}
              />
              <PlanCard
                name="AI-Only" price="€7.99" period="/month or €59/year" icon={Bot}
                badge="Navigation" badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                features={[
                  "Full AI Captain access",
                  "Route planning & weather",
                  "MAYDAY protocols",
                  "Navigation guidance",
                  "No booking functionality",
                  "Sailing companion AI",
                ]}
              />
            </div>

            <div className="text-center mt-10">
              <Link to="/user-pricing">
                <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold px-8 h-12">
                  <Crown className="mr-2" size={18} />
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ Still Have Questions ═══ */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Check our comprehensive FAQ or contact our support team.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/support">
                <Button variant="outline" size="lg">Contact Support</Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="lg">Learn More About Us</Button>
              </Link>
              <Link to="/user-pricing">
                <Button variant="ghost" size="lg">View All Plans</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
