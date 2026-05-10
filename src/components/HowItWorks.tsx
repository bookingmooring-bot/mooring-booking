import { Compass, Layers, Navigation, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Compass, title: t('howItWorks.step1Title'), description: t('howItWorks.step1Desc'), accent: "from-cyan-500 to-blue-500" },
    { icon: Layers, title: t('howItWorks.step2Title'), description: t('howItWorks.step2Desc'), accent: "from-blue-500 to-indigo-500" },
    { icon: Navigation, title: t('howItWorks.step3Title'), description: t('howItWorks.step3Desc'), accent: "from-indigo-500 to-purple-500" },
    { icon: Star, title: t('howItWorks.step4Title'), description: t('howItWorks.step4Desc'), accent: "from-purple-500 to-pink-500" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{t('howItWorks.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-pink-500/20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative group">
                {/* Step number + icon circle */}
                <div className="flex flex-col items-center mb-6">
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="text-white" size={32} />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-card border-2 border-primary rounded-full flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <div className="text-center bg-card rounded-xl p-5 shadow-card hover:shadow-hover transition-all duration-300 border border-border/50 group-hover:border-primary/20">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
