import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CloudLightning,
  Compass,
  Anchor,
  Wrench,
  ArrowRight,
  BotMessageSquare,
} from "lucide-react";

const features = [
  { icon: CloudLightning, key: "weather" },
  { icon: Compass, key: "navigation" },
  { icon: Anchor, key: "mooring" },
  { icon: Wrench, key: "diagnostics" },
];

const AICaptainTeaser = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary/95 to-slate-800">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-sm font-medium">
            <BotMessageSquare size={16} />
            {t("aiCaptainTeaser.badge", "AI Captain")}
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4">
          {t("aiCaptainTeaser.title", "Meet your AI Captain")}
        </h2>
        <p className="text-white/70 text-center text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          {t(
            "aiCaptainTeaser.subtitle",
            "An AI nautical expert available 24/7 — from live storm alerts and route planning to boat diagnostics and docking maneuvers."
          )}
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors text-center"
            >
              <div className="p-3 rounded-xl bg-gold/20">
                <Icon size={24} className="text-gold" />
              </div>
              <span className="text-white font-medium text-sm leading-tight">
                {t(`aiCaptainTeaser.feature.${key}`, key)}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/ai-captain"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-slate-900 font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg hover:shadow-gold/30 hover:scale-105"
          >
            {t("aiCaptainTeaser.readMore", "Read More")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AICaptainTeaser;
