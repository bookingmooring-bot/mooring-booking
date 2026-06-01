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
              <span>{t('footer.allRightsReserved')} Mooring Booking.com SRO © 2026</span>
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
              <button onClick={() => handleLinkClick('/ai-captain')} className="text-left text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                {t('footer.aiCaptain', 'AI Captain')}
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

        {/* Stripe Security Badge */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex items-center justify-center gap-3 mb-6 py-3 px-4 bg-primary-foreground/5 rounded-xl border border-primary-foreground/10">
            {/* Stripe wordmark SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 25" className="h-6 fill-current text-primary-foreground/70" aria-label="Stripe">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.23c0-1.85-1.07-2.58-2.06-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c3.39 0 5.26 2.6 5.26 7.27 0 5.12-2.01 7.73-5.29 7.73zm-.87-12.54c-.85 0-1.87.57-1.87.57l.02 6.36s.9.62 1.85.62c1.52 0 2.93-1.13 2.93-3.77 0-2.54-1.19-3.78-2.93-3.78zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.84zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.5 0 3 .23 4.43.86v3.88a8.88 8.88 0 0 0-4.3-1.17c-.86 0-1.42.23-1.42.78 0 1.41 6.41.58 6.41 5.99z"/>
            </svg>
            <span className="text-sm text-primary-foreground/70 font-medium">
              {t('footer.stripeSecure', 'Payments are secure and processed via Stripe')}
            </span>
            <div className="flex items-center gap-1 text-primary-foreground/50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">SSL</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-0 border-t border-primary-foreground/10">
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
            <p>{t('footer.allRightsReserved')} Mooring Booking.com SRO © 2026 | mooring-booking.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
