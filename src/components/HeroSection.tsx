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
              <span className="text-xl">⭐</span>
              <span className="text-xs md:text-sm font-medium text-foreground">{t('hero.reviews')}</span>
            </div>
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-xl">🔒</span>
              <span className="text-xs md:text-sm font-medium text-foreground">{t('hero.secure')}</span>
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