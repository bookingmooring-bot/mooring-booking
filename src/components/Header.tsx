import { Link } from "react-router-dom";
import { Menu, X, Ship } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import AIChatWidget from "./AIChatWidget";
import logo from "@/assets/logo.jpg";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo - 50% bigger than original (72px vs 48px) with pulse animation */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img
                src={logo}
                alt="Mooring Booking"
                className="h-[56px] w-[56px] md:h-[72px] md:w-[72px] rounded-xl object-cover shadow-lg animate-pulse-slow"
              />
              <span className="hidden sm:block font-heading font-bold text-xl text-foreground">
                Mooring Booking
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to="/explore"
                className="font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {t('nav.explore')}
              </Link>
              <Link
                to="/how-it-works"
                className="font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {t('nav.howItWorks')}
              </Link>
              <Link
                to="/become-provider"
                className="font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {t('nav.becomeProvider')}
              </Link>
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 font-medium text-secondary hover:text-secondary/80 transition-colors bg-secondary/10 px-3 py-2 rounded-full"
              >
                <Ship size={20} />
                {t('nav.aiAssistant')}
              </button>
            </nav>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-gradient-ocean font-medium shadow-card hover:shadow-hover transition-shadow">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="font-medium">
                      {t('nav.signIn', 'Sign In')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-gradient-ocean font-medium shadow-card hover:shadow-hover transition-shadow">
                      {t('nav.getStarted', 'Get Started')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center gap-3">
              <ThemeToggle />
              <LanguageSwitcher />
              <button
                onClick={() => setIsChatOpen(true)}
                className="p-2.5 text-secondary bg-secondary/10 rounded-full"
                aria-label="AI Captain"
              >
                <Ship size={24} />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-foreground"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col gap-4">
                <Link
                  to="/explore"
                  className="font-medium text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.explore')}
                </Link>
                <Link
                  to="/how-it-works"
                  className="font-medium text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.howItWorks')}
                </Link>
                <Link
                  to="/become-provider"
                  className="font-medium text-foreground/80 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.becomeProvider')}
                </Link>
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  {user ? (
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button className="bg-gradient-ocean w-full">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="justify-start w-full">
                          {t('nav.signIn', 'Sign In')}
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button className="bg-gradient-ocean w-full">
                          {t('nav.getStarted', 'Get Started')}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AIChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default Header;