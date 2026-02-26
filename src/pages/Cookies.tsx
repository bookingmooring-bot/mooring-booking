import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Cookie, Settings, BarChart3, Target, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const CookiesPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-ocean">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Cookie className="text-gold mx-auto mb-6" size={48} />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                {t('legal.cookiesTitle')}
              </h1>
              <p className="text-primary-foreground/80">{t('legal.cookiesLastUpdated', 'Last updated: January 1, 2026')}</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-xl p-8 shadow-card mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{t('cookies.whatAreCookies')}</h2>
                <p className="text-muted-foreground">{t('cookies.whatAreCookiesText')}</p>
              </div>

              <div className="space-y-8">
                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Settings className="text-secondary" size={24} />
                    {t('cookies.essentialTitle')}
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{t('cookies.essentialText')}</p>
                    <div className="bg-muted rounded-lg p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-foreground">
                            <th className="pb-2">{t('cookies.cookie')}</th>
                            <th className="pb-2">{t('cookies.purpose')}</th>
                            <th className="pb-2">{t('cookies.duration')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr><td className="py-1">session_id</td><td>{t('cookies.userAuth')}</td><td>{t('cookies.session')}</td></tr>
                          <tr><td className="py-1">csrf_token</td><td>{t('cookies.security')}</td><td>{t('cookies.session')}</td></tr>
                          <tr><td className="py-1">cookie_consent</td><td>{t('cookies.storeCookiePrefs')}</td><td>1 {t('cookies.year', 'year')}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <BarChart3 className="text-secondary" size={24} />
                    {t('cookies.analyticsTitle')}
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{t('cookies.analyticsText')}</p>
                    <div className="bg-muted rounded-lg p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-foreground">
                            <th className="pb-2">{t('cookies.cookie')}</th>
                            <th className="pb-2">{t('cookies.purpose')}</th>
                            <th className="pb-2">{t('cookies.duration')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr><td className="py-1">_ga</td><td>Google Analytics</td><td>2 {t('cookies.years', 'years')}</td></tr>
                          <tr><td className="py-1">_gid</td><td>Google Analytics</td><td>24 {t('cookies.hours', 'hours')}</td></tr>
                          <tr><td className="py-1">_gat</td><td>{t('cookies.rateLimiting')}</td><td>1 {t('cookies.minute', 'minute')}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Target className="text-secondary" size={24} />
                    {t('cookies.marketingTitle')}
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{t('cookies.marketingText')}</p>
                    <div className="bg-muted rounded-lg p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-foreground">
                            <th className="pb-2">{t('cookies.cookie')}</th>
                            <th className="pb-2">{t('cookies.purpose')}</th>
                            <th className="pb-2">{t('cookies.duration')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr><td className="py-1">affiliate_ref</td><td>{t('cookies.affiliateTracking')}</td><td>30 {t('cookies.days', 'days')}</td></tr>
                          <tr><td className="py-1">utm_source</td><td>{t('cookies.campaignTracking')}</td><td>{t('cookies.session')}</td></tr>
                          <tr><td className="py-1">_fbp</td><td>Facebook Pixel</td><td>3 {t('cookies.months', 'months')}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Shield className="text-secondary" size={24} />
                    {t('cookies.managingTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('cookies.managingText')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('cookies.preferencesTitle')}</h2>
                  <p className="text-muted-foreground mb-6">{t('cookies.preferencesText')}</p>
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-ocean">{t('cookies.acceptAll')}</Button>
                    <Button variant="outline">{t('cookies.essentialOnly')}</Button>
                    <Button variant="outline">{t('cookies.customize')}</Button>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('cookies.contactTitle')}</h2>
                  <p className="text-muted-foreground">
                    {t('cookies.contactText')}{" "}
                    <a href="mailto:privacy@mooringbooking.com" className="text-secondary hover:underline">privacy@mooringbooking.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPage;