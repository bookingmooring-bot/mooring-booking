import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CloudLightning, Compass, Anchor, Wrench, Map, Shield, Route, Waves,
  MessageSquare, WifiOff, CheckCircle, XCircle, BotMessageSquare, Zap,
  Star, AlertTriangle, UtensilsCrossed,
} from "lucide-react";

const capabilities = [
  {
    icon: CloudLightning,
    title: "Weather & Storm Forecasts",
    emoji: "🌊",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    desc: "7-day maritime forecasts with wind speed, wind direction, wave height, swell period, visibility and atmospheric pressure. Storm alerts sent to your device before conditions deteriorate. AI Captain Jack reads your route and flags weather windows — telling you not just what the weather is but whether it is safe to leave, when to go and where to anchor and wait. AI Captain distinguishes between Mediterranean wind patterns: Bura, Jugo, Maestral and Levanat are identified by name with specific sailing implications for each.",
    note: "Basic plan: 48-hour forecast. Sailor and Captain plans: 7-day detailed forecast with storm alerts.",
  },
  {
    icon: Compass,
    title: "Turn-by-Turn Nautical Navigation",
    emoji: "🧭",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    desc: "Precise GPS-based nautical navigation from your current position to any mooring, berth, anchorage or port. AI Captain provides compass bearing, distance in nautical miles, estimated time of arrival based on your vessel's speed, recommended waypoints avoiding known hazards, and approach guidance for the final approach to the berth. Works for all three booking layers — Premium Partner marinas, Concierge Booking facilities and Explore & Navigate anchorages.",
  },
  {
    icon: Anchor,
    title: "Mooring & Docking Guidance",
    emoji: "⚓",
    color: "from-teal-500/20 to-emerald-500/20",
    border: "border-teal-500/30",
    iconColor: "text-teal-400",
    desc: "Step-by-step instructions for approaching and securing your vessel in any scenario: Mediterranean stern-to mooring with lazy lines, bow-to alongside a quay, picking up a buoy in wind, anchoring in mixed bottom conditions, rafting alongside another vessel, and entering tight marina fingers with limited manoeuvrability. Guidance is adapted to your vessel type — monohull, catamaran, motor yacht or RIB — and to the wind and current conditions at your destination.",
  },
  {
    icon: Route,
    title: "Route Planning",
    emoji: "🗺️",
    color: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    desc: "AI-generated multi-day sailing routes based on your departure point, vessel type, cruising speed, draft, desired destinations and weather windows. AI Captain builds a full itinerary with daily waypoints, estimated sailing distances, recommended overnight stops from the Mooring Booking database, fuel and water waypoints, and weather window analysis for each leg. Ask for the scenic route, the fastest route, the route that avoids the Jugo, or the route with the best anchorages along the way.",
  },
  {
    icon: Star,
    title: "Mooring Search & Booking Recommendations",
    emoji: "⭐",
    color: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    desc: "Ask AI Captain Jack to find a mooring near your position or any Mediterranean location and receive ranked recommendations across all three service layers. Premium Partner marinas appear first with instant booking links, direct GPS coordinates and live availability. Concierge Booking facilities appear second with request-based booking. Explore & Navigate anchorages appear third as navigation references. AI Captain filters results by your vessel's length, draft, required depth, wind protection preferences and budget. Direct booking links to mooring-booking.com are included in every recommendation.",
    note: "All mooring data sourced from the Mooring Booking database. AI Captain does not invent marina data — responses are grounded in the verified database only. For any marina or anchorage not in the database, AI Captain will say so clearly rather than provide unverified information.",
  },
  {
    icon: AlertTriangle,
    title: "MAYDAY & Emergency Protocols",
    emoji: "🚨",
    color: "from-red-500/20 to-rose-500/20",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    desc: "When you use words indicating a maritime emergency — MAYDAY, sinking, fire, man overboard, collision, medical emergency or any equivalent in any supported language — AI Captain Jack immediately switches to emergency mode. You receive the standard international MAYDAY VHF protocol formatted for immediate radio transmission, the nearest Maritime Rescue Coordination Centre based on your GPS position, emergency telephone numbers for the relevant coast guard, step-by-step immediate actions for your specific emergency type and, for medical emergencies, basic first aid guidance pending professional rescue.",
    warning: "IN ANY GENUINE MARITIME EMERGENCY, USE VHF CHANNEL 16 AS YOUR PRIMARY DISTRESS CHANNEL. AI Captain Jack is a supplementary reference tool — it does not replace VHF radio, EPIRB or DSC distress equipment. Emergency contact data is sourced from our database and may not reflect the most current information.",
  },
  {
    icon: Wrench,
    title: "Boat Diagnostics & Troubleshooting",
    emoji: "🔧",
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/30",
    iconColor: "text-orange-400",
    desc: "Engine problems, electrical faults, anchor winch issues, bilge pump failure, steering problems, sail damage, rigging wear, watermaker faults — describe the symptom to AI Captain Jack and receive a structured diagnostic process and temporary fix guidance. AI Captain walks you through checks in logical order, asks clarifying questions about symptoms and suggests immediate actions to restore function or safely manage the failure until you reach a marina. Not a substitute for professional marine engineering but a skilled first responder when you are offshore and the manual is not enough.",
  },
  {
    icon: Shield,
    title: "COLREGS & Maritime Safety Rules",
    emoji: "📋",
    color: "from-slate-500/20 to-gray-500/20",
    border: "border-slate-500/30",
    iconColor: "text-slate-300",
    desc: "On-demand International Regulations for Preventing Collisions at Sea (COLREGS) explained clearly for any situation. Ask about right of way in any encounter scenario, lights and shapes, sound signals, restricted visibility rules, traffic separation schemes, anchoring regulations, and specific port entry regulations for Mediterranean harbours. AI Captain explains any rule in plain language and applies it to your specific situation — “I am a sailing vessel, the other boat is a motor vessel, we are on crossing courses, what do I do?” receives a direct, rule-referenced answer.",
  },
  {
    icon: Waves,
    title: "Manoeuvre Guides",
    emoji: "⛵",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    iconColor: "text-cyan-400",
    desc: "Detailed step-by-step manoeuvre assistance for challenging situations: catamaran entering a narrow port with cross-wind, anchoring in strong current with poor holding, stern-to mooring in a full marina in 20 knots, picking up a mooring buoy single-handed, tacking in a confined channel, heaving-to in heavy weather, and recovering from an accidental gybe. Each guide is adapted to your vessel type and the conditions you describe.",
  },
  {
    icon: UtensilsCrossed,
    title: "Tourism & Destination Guide",
    emoji: "🍽️",
    color: "from-emerald-500/20 to-green-500/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    desc: "For every port, marina and anchorage in the Mooring Booking database, AI Captain Jack provides local restaurant recommendations, historical and cultural information about the destination, practical information about customs, fuel availability, provisioning options, local transport and points of interest within walking distance of the marina. Ask AI Captain what to see in Hvar, where to eat in Kotor, what the customs procedure is in Montenegro, or whether the local konoba near the marina accepts cards.",
  },
  {
    icon: MessageSquare,
    title: "Multi-Language Support",
    emoji: "🌍",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
    iconColor: "text-pink-400",
    desc: "AI Captain Jack communicates in English, Croatian, Italian, Greek, German, French, Spanish, Portuguese, Turkish, Slovenian, Albanian, Czech and further languages on request. Language is detected automatically from your first message. All subsequent responses, including emergency protocols and navigation guidance, are delivered in your language. Mediterranean-specific nautical terminology in each language is fully understood — vezanje, attracco, amarraje, πρόσδεση and Festmachen all mean the same thing to AI Captain.",
  },
  {
    icon: WifiOff,
    title: "Offline Access",
    emoji: "📡",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    iconColor: "text-violet-400",
    desc: "Sailor, Captain and Charter Fleet subscribers can use AI Captain with 24-hour cached weather data, downloaded offline charts, saved booking confirmations including GPS coordinates and contact details, and pre-downloaded seamanship and manoeuvre guides — all without an internet connection. Live queries, real-time weather updates, new booking requests and Stripe payments require an internet connection.",
  },
];

const planFeatures = [
  { feature: "Browse all three booking layers", free: "✅", sailor: "✅", captain: "✅" },
  { feature: "AI Captain Jack queries", free: "10 per month", sailor: "Unlimited", captain: "Unlimited" },
  { feature: "Weather forecast", free: "48-hour", sailor: "7-day detailed", captain: "7-day detailed" },
  { feature: "Storm and wind alerts", free: false, sailor: true, captain: true },
  { feature: "Offline maps and weather cache", free: false, sailor: true, captain: true },
  { feature: "AI route planning", free: false, sailor: true, captain: true },
  { feature: "Manoeuvre guides", free: "Limited", sailor: "Full library", captain: "Full library" },
  { feature: "MAYDAY emergency protocol", free: "✅ always", sailor: "✅ always", captain: "✅ always" },
  { feature: "Boat diagnostics", free: "Basic", sailor: "Full", captain: "Full" },
  { feature: "Tourism destination guide", free: true, sailor: true, captain: true },
  { feature: "Vessel profile saved", free: false, sailor: true, captain: true },
  { feature: "Service fee waived", free: false, sailor: "Vessels up to 12m", captain: "All vessels" },
  { feature: "Reservations", free: "Pay per booking", sailor: "Unlimited up to 12m", captain: "Unlimited all sizes" },
  { feature: "Charter onboard tools", free: false, sailor: false, captain: true },
  { feature: "Priority booking", free: false, sailor: true, captain: true },
  { feature: "Multi-language", free: true, sailor: true, captain: true },
];

function PlanCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground">{value}</span>;
  }
  return value
    ? <CheckCircle size={20} className="text-emerald-500" />
    : <XCircle size={20} className="text-muted-foreground/40" />;
}

const AICaptainPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-sm font-medium mb-8">
              <BotMessageSquare size={16} />
              AI Captain Jack
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Everything
              <span className="block text-gold">AI Captain Jack Can Do</span>
            </h1>
            <p className="text-white/70 text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Your 24/7 nautical expert and personal sailing companion. From live storm alerts to MAYDAY protocols, mooring recommendations across 30,000+ locations and real-time boat diagnostics &mdash; AI Captain Jack is the only nautical assistant that knows the Mediterranean the way you do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-slate-900 font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg hover:scale-105">
                <Zap size={18} />
                Start Free
              </Link>
              <Link to="/user-pricing" className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-full transition-all duration-200">
                View Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Full Capabilities</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Twelve powerful areas where AI Captain Jack assists you on the water.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {capabilities.map(({ icon: Icon, title, desc, note, warning, color, border, iconColor }) => (
                <div key={title} className={`relative rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 hover:scale-[1.01] transition-transform duration-200`}>
                  <div className="inline-flex p-3 rounded-xl bg-background/50 mb-4">
                    <Icon size={24} className={iconColor} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">{desc}</p>
                  {note && (
                    <p className="text-xs text-muted-foreground/80 bg-background/30 rounded-lg p-3 italic">{note}</p>
                  )}
                  {warning && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-2 font-semibold">{warning}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plan Comparison */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Free vs Premium</h2>
              <p className="text-muted-foreground text-lg">
                Start free. Upgrade for the full AI Captain Jack experience.
              </p>
            </div>
            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border shadow-card">
              <div className="grid grid-cols-4 bg-primary text-primary-foreground">
                <div className="p-4 font-semibold">Feature</div>
                <div className="p-4 font-semibold text-center border-l border-primary-foreground/20">Basic &mdash; Free</div>
                <div className="p-4 font-semibold text-center border-l border-primary-foreground/20">Sailor &mdash; &euro;19.99/mo</div>
                <div className="p-4 font-semibold text-center border-l border-primary-foreground/20 text-gold">Captain &mdash; &euro;34.99/mo</div>
              </div>
              {planFeatures.map(({ feature, free, sailor, captain }, i) => (
                <div key={feature} className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <div className="p-4 text-sm text-foreground">{feature}</div>
                  <div className="p-4 flex justify-center items-center border-l border-border"><PlanCell value={free} /></div>
                  <div className="p-4 flex justify-center items-center border-l border-border"><PlanCell value={sailor} /></div>
                  <div className="p-4 flex justify-center items-center border-l border-border"><PlanCell value={captain} /></div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              MAYDAY emergency protocol and VHF Channel 16 guidance are always available regardless of subscription tier. Safety features are never paywalled.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 shadow-card">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">AI Captain Jack &mdash; What He Is and What He Is Not</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  AI Captain Jack is powered by large language model technology integrated with the Mooring Booking marina database, real-time weather data sources and nautical reference material. He is a genuinely useful nautical companion who knows the Mediterranean, speaks your language and is available at 3am when the engine alarm goes off.
                </p>
                <p>
                  He is not a certified maritime officer, a registered meteorologist or a licensed marine surveyor. His responses are informational and should be cross-referenced with official nautical charts, national meteorological services and professional advice for safety-critical decisions. His mooring recommendations are grounded in the Mooring Booking database &mdash; he will not invent a marina that does not exist or quote a depth he cannot verify.
                </p>
                <p className="text-sm">
                  Full AI Captain disclaimer is available in <Link to="/terms" className="text-secondary underline">Master Terms of Service v3.0, Section 8</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary to-slate-800 text-center">
          <div className="container mx-auto px-4">
            <BotMessageSquare size={48} className="text-gold mx-auto mb-6" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Ready to Sail Smarter?</h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
              AI Captain Jack is available on mooring-booking.com and on the native Mooring Booking app for iOS and Android.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-slate-900 font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105">
                <Zap size={18} />
                Start Free
              </Link>
              <Link to="/user-pricing" className="inline-flex items-center border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-full transition-all">
                View Plans
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AICaptainPage;
