import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CloudLightning,
  Compass,
  Anchor,
  Wrench,
  Map,
  Shield,
  Route,
  Waves,
  MessageSquare,
  WifiOff,
  CheckCircle,
  XCircle,
  BotMessageSquare,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    icon: CloudLightning,
    key: "weather",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    icon: Compass,
    key: "navigation",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: Anchor,
    key: "mooring",
    color: "from-teal-500/20 to-emerald-500/20",
    border: "border-teal-500/30",
    iconColor: "text-teal-400",
  },
  {
    icon: Route,
    key: "routing",
    color: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    icon: Wrench,
    key: "diagnostics",
    color: "from-red-500/20 to-rose-500/20",
    border: "border-red-500/30",
    iconColor: "text-red-400",
  },
  {
    icon: Shield,
    key: "colregs",
    color: "from-slate-500/20 to-gray-500/20",
    border: "border-slate-500/30",
    iconColor: "text-slate-300",
  },
  {
    icon: Waves,
    key: "maneuvers",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    iconColor: "text-cyan-400",
  },
  {
    icon: Map,
    key: "discover",
    color: "from-emerald-500/20 to-green-500/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  {
    icon: WifiOff,
    key: "offline",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/30",
    iconColor: "text-violet-400",
  },
  {
    icon: MessageSquare,
    key: "multilang",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
    iconColor: "text-pink-400",
  },
];

const planFeatures = [
  { key: "booking", free: true, premium: true },
  { key: "aiBasic", free: true, premium: true },
  { key: "weather3", free: true, premium: true },
  { key: "aiUnlimited", free: false, premium: true },
  { key: "weather7", free: false, premium: true },
  { key: "offline", free: false, premium: true },
  { key: "stormAlerts", free: false, premium: true },
  { key: "routing", free: false, premium: true },
  { key: "maneuvers", free: false, premium: true },
  { key: "priority", free: false, premium: true },
];

const AICaptainPage = () => {
  const { t } = useTranslation();

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
              {t("aiCaptainPage.badge", "AI Captain Jack")}
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t("aiCaptainPage.heroTitle", "Everything")}
              <span className="block text-gold">
                {t("aiCaptainPage.heroHighlight", "AI Captain Can Do")}
              </span>
            </h1>

            <p className="text-white/70 text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              {t(
                "aiCaptainPage.heroSubtitle",
                "Your 24/7 nautical expert powered by Google Gemini AI. From live storm alerts to boat diagnostics — AI Captain has you covered at sea."
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-slate-900 font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg hover:scale-105"
              >
                <Zap size={18} />
                {t("aiCaptainPage.ctaStart", "Start Free")}
              </Link>
              <Link
                to="/user-pricing"
                className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-full transition-all duration-200"
              >
                {t("aiCaptainPage.ctaPlans", "View Plans")}
              </Link>
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("aiCaptainPage.capabilitiesTitle", "Full Capabilities")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t(
                  "aiCaptainPage.capabilitiesSubtitle",
                  "Ten powerful areas where AI Captain assists you on the water."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map(
                ({ icon: Icon, key, color, border, iconColor }) => (
                  <div
                    key={key}
                    className={`relative rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 hover:scale-[1.02] transition-transform duration-200`}
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-background/50 mb-4`}>
                      <Icon size={24} className={iconColor} />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                      {t(`aiCaptainPage.cap.${key}.title`, key)}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`aiCaptainPage.cap.${key}.desc`, "")}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Plan Comparison */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("aiCaptainPage.planTitle", "Free vs Premium")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t(
                  "aiCaptainPage.planSubtitle",
                  "Start free. Upgrade for the full AI Captain experience."
                )}
              </p>
            </div>

            <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-border shadow-card">
              {/* Table header */}
              <div className="grid grid-cols-3 bg-primary text-primary-foreground">
                <div className="p-4 font-semibold">
                  {t("aiCaptainPage.planFeature", "Feature")}
                </div>
                <div className="p-4 font-semibold text-center border-l border-primary-foreground/20">
                  {t("aiCaptainPage.planBasic", "Basic (Free)")}
                </div>
                <div className="p-4 font-semibold text-center border-l border-primary-foreground/20 text-gold">
                  {t("aiCaptainPage.planPremium", "Premium")}
                </div>
              </div>

              {/* Table rows */}
              {planFeatures.map(({ key, free, premium }, i) => (
                <div
                  key={key}
                  className={`grid grid-cols-3 ${
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <div className="p-4 text-sm text-foreground">
                    {t(`aiCaptainPage.planRow.${key}`, key)}
                  </div>
                  <div className="p-4 flex justify-center border-l border-border">
                    {free ? (
                      <CheckCircle size={20} className="text-emerald-500" />
                    ) : (
                      <XCircle size={20} className="text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="p-4 flex justify-center border-l border-border">
                    {premium ? (
                      <CheckCircle size={20} className="text-emerald-500" />
                    ) : (
                      <XCircle size={20} className="text-muted-foreground/40" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary to-slate-800 text-center">
          <div className="container mx-auto px-4">
            <BotMessageSquare size={48} className="text-gold mx-auto mb-6" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              {t("aiCaptainPage.ctaTitle", "Ready to Sail Smarter?")}
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
              {t(
                "aiCaptainPage.ctaSubtitle",
                "Join thousands of sailors who use AI Captain every day. Free to start."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-slate-900 font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105"
              >
                <Zap size={18} />
                {t("aiCaptainPage.ctaStart", "Start Free")}
              </Link>
              <Link
                to="/user-pricing"
                className="inline-flex items-center border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-full transition-all"
              >
                {t("aiCaptainPage.ctaPlans", "View Plans")}
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
