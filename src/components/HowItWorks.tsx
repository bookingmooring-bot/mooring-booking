import { Search, Calendar, Navigation, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Search, title: t('howItWorks.step1Title'), description: t('howItWorks.step1Desc') },
    { icon: Calendar, title: t('howItWorks.step2Title'), description: t('howItWorks.step2Desc') },
    { icon: Navigation, title: t('howItWorks.step3Title'), description: t('howItWorks.step3Desc') },
    { icon: CreditCard, title: t('howItWorks.step4Title'), description: t('howItWorks.step4Desc') },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{t('howItWorks.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow group">
              <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-primary-foreground font-heading font-bold shadow-card">{index + 1}</div>
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <step.icon className="text-secondary" size={28} />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-secondary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;