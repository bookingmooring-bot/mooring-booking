import { useNavigate } from "react-router-dom";
import { Anchor, Mail, Phone, MapPin, Settings, Building } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const handleLinkClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="Mooring Booking"
                className="h-20 w-20 rounded-lg object-cover shadow-lg"
              />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
              <Anchor size={16} />
              <span>{t('footer.allRightsReserved')} Intelligent Matrix © 2026</span>
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg">{t('footer.about', 'About')}</h4>
            <nav className="flex flex-col gap-3">
              <button onClick={() => handleLinkClick('/about')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.aboutUs')}
              </button>
              <button onClick={() => handleLinkClick('/how-it-works')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.howItWorksLink')}
              </button>
              <button onClick={() => handleLinkClick('/blog')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.blog')}
              </button>
              <button onClick={() => handleLinkClick('/support#faq')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                FAQ
              </button>
              <button onClick={() => handleLinkClick('/contact')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.contact')}
              </button>
            </nav>
          </div>

          {/* For You */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg">{t('footer.forYou', 'For You')}</h4>
            <nav className="flex flex-col gap-3">
              <button onClick={() => handleLinkClick('/become-provider')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.registerMooring')}
              </button>
              <button onClick={() => handleLinkClick('/pricing')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.pricing')}
              </button>
              <button onClick={() => handleLinkClick('/affiliate')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.affiliateProgram')}
              </button>
              <button onClick={() => handleLinkClick('/marina-partnership')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm flex items-center gap-1">
                <Building size={14} />
                {t('footer.marinaPartnership', 'Marina Partnership (B2B)')}
              </button>
              <button onClick={() => handleLinkClick('/support')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.support')}
              </button>
              <button onClick={() => handleLinkClick('/sailing-manual')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.sailingManual', 'Sailing Manual')}
              </button>
            </nav>
          </div>

          {/* Contact & Admin */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg">{t('footer.contactUs')}</h4>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
              <a href="mailto:info@mooring-booking.com" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Mail size={16} />
                info@mooring-booking.com
              </a>
              <a href="mailto:support@mooring-booking.com" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Mail size={16} />
                support@mooring-booking.com
              </a>
              <a href="tel:+420739328337" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Phone size={16} />
                +420 739 328 337
              </a>
              <a href="tel:+43667446860" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Phone size={16} />
                +43 667 446 4860
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                Prague, Czech Republic / Vienna, Austria
              </div>
            </div>
            {profile?.role === 'admin' && (
              <div className="pt-4 border-t border-primary-foreground/10">
                <button
                  onClick={() => handleLinkClick('/admin')}
                  className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors text-sm font-medium"
                >
                  <Settings size={16} />
                  Admin Dashboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => handleLinkClick('/privacy')} className="hover:text-gold transition-colors">
                {t('footer.privacyPolicy')}
              </button>
              <button onClick={() => handleLinkClick('/terms')} className="hover:text-gold transition-colors">
                {t('footer.termsOfService')}
              </button>
              <button onClick={() => handleLinkClick('/cookies')} className="hover:text-gold transition-colors">
                {t('footer.cookiePolicy')}
              </button>
              <button onClick={() => handleLinkClick('/gdpr')} className="hover:text-gold transition-colors">
                {t('footer.gdpr')}
              </button>
            </div>
            <p>{t('footer.allRightsReserved')} Intelligent Matrix | mooring-booking.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
