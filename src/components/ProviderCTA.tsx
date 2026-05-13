import { Anchor, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProviderCTA = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBecomeProvider = () => {
    navigate('/become-provider');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-ocean relative overflow-hidden">
      <div className="absolute top-10 left-10 opacity-10 animate-float"><Anchor size={100} className="text-gold" /></div>
      <div className="absolute bottom-10 right-10 opacity-10 animate-float" style={{ animationDelay: '2s' }}><Anchor size={80} className="text-gold" /></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-6">
            <Anchor size={16} /><span className="text-sm font-medium">{t('providerCta.badge')}</span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t('providerCta.title')}<span className="block text-gold">{t('providerCta.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">{t('providerCta.subtitle')}</p>

          <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-heading font-semibold text-lg px-8 h-14 shadow-hover" onClick={handleBecomeProvider}>
            {t('providerCta.button')}<ArrowRight className="ml-2" size={20} />
          </Button>
          <p className="text-primary-foreground/60 text-sm mt-4">{t('providerCta.note')}</p>
        </div>
      </div>
    </section>
  );
};

export default ProviderCTA;