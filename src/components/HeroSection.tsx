import { useState } from "react";
import { Search, Calendar, MapPin, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}&checkIn=${checkIn}&checkOut=${checkOut}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 opacity-20 animate-float hidden md:block">
        <Anchor size={60} className="text-gold" />
      </div>
      <div className="absolute bottom-1/3 right-10 opacity-20 animate-float hidden md:block" style={{ animationDelay: '2s' }}>
        <Anchor size={80} className="text-gold" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm text-gold px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Anchor size={16} />
            <span className="text-sm font-medium">{t('hero.badge')}</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in leading-tight" style={{ animationDelay: '0.1s' }}>
            {t('hero.title')}
            <span className="block text-gold mt-2">{t('hero.titleHighlight')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-primary-foreground/80 mb-12 max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>

          {/* Search Box */}
          <div className="bg-card/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-hover animate-fade-in max-w-3xl mx-auto" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input 
                  placeholder={t('hero.whereTo')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-secondary text-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Check-in */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input 
                  type="date"
                  placeholder={t('hero.checkIn')}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-secondary text-foreground"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Check-out */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input 
                  type="date"
                  placeholder={t('hero.checkOut')}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-secondary text-foreground"
                  min={checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="h-12 bg-gradient-ocean font-semibold text-base shadow-card hover:shadow-hover transition-all"
              >
                <Search size={20} className="mr-2" />
                {t('hero.search')}
              </Button>
            </div>
          </div>

          {/* Trust Indicators - Fixed visibility with Twemoji SVG */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="flex -space-x-1">
                {[
                  { code: '1f1ed-1f1f7', name: 'Croatia' },
                  { code: '1f1ec-1f1f7', name: 'Greece' },
                  { code: '1f1ee-1f1f9', name: 'Italy' },
                  { code: '1f1ea-1f1f8', name: 'Spain' },
                  { code: '1f1eb-1f1f7', name: 'France' },
                ].map((flag) => (
                  <img 
                    key={flag.code}
                    src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${flag.code}.svg`}
                    alt={flag.name}
                    className="w-6 h-6 md:w-7 md:h-7 drop-shadow-md"
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm font-medium text-foreground">{t('hero.countries')}</span>
            </div>
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-xl">🔒</span>
              <span className="text-xs md:text-sm font-medium text-foreground">{t('hero.secure')}</span>
            </div>
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 25" className="h-4 fill-current text-[#635bff]" aria-label="Stripe">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.23c0-1.85-1.07-2.58-2.06-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c3.39 0 5.26 2.6 5.26 7.27 0 5.12-2.01 7.73-5.29 7.73zm-.87-12.54c-.85 0-1.87.57-1.87.57l.02 6.36s.9.62 1.85.62c1.52 0 2.93-1.13 2.93-3.77 0-2.54-1.19-3.78-2.93-3.78zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.84zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.5 0 3 .23 4.43.86v3.88a8.88 8.88 0 0 0-4.3-1.17c-.86 0-1.42.23-1.42.78 0 1.41 6.41.58 6.41 5.99z"/>
              </svg>
              <span className="text-xs md:text-sm font-medium text-foreground">{t('hero.stripePayments', 'Stripe Secured')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 60L48 65C96 70 192 80 288 85C384 90 480 90 576 80C672 70 768 50 864 45C960 40 1056 50 1152 55C1248 60 1344 60 1392 60L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;