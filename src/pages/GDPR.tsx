import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, UserCheck, Database, Download, Trash2, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const GDPRPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-ocean">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Shield className="text-gold mx-auto mb-6" size={48} />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                {t('legal.gdprTitle')}
              </h1>
              <p className="text-primary-foreground/80">{t('gdpr.subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-xl p-8 shadow-card mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{t('gdpr.commitmentTitle')}</h2>
                <p className="text-muted-foreground">{t('gdpr.commitmentText')}</p>
              </div>

              <div className="space-y-8">
                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <UserCheck className="text-secondary" size={24} />
                    {t('gdpr.rightsTitle')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['Access', 'Rectification', 'Erasure', 'Portability', 'Object', 'Restrict'].map(right => (
                      <div key={right} className="p-4 bg-muted rounded-lg">
                        <h3 className="font-heading font-semibold text-foreground mb-2">{t(`gdpr.right${right}`)}</h3>
                        <p className="text-muted-foreground text-sm">{t(`gdpr.right${right}Desc`)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Database className="text-secondary" size={24} />
                    {t('gdpr.legalBasisTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('gdpr.legalBasisText', 'We process your personal data based on the following legal grounds:')}</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3"><span className="text-secondary font-semibold">{t('gdpr.contract', 'Contract:')}</span><span>{t('gdpr.contractDesc', 'Processing necessary to fulfill our contract with you (bookings, payments)')}</span></li>
                      <li className="flex items-start gap-3"><span className="text-secondary font-semibold">{t('gdpr.consent', 'Consent:')}</span><span>{t('gdpr.consentDesc', 'Processing based on your explicit consent (marketing, analytics cookies)')}</span></li>
                      <li className="flex items-start gap-3"><span className="text-secondary font-semibold">{t('gdpr.legitimateInterest', 'Legitimate Interest:')}</span><span>{t('gdpr.legitimateInterestDesc', 'Processing for our legitimate business interests (fraud prevention, service improvement)')}</span></li>
                      <li className="flex items-start gap-3"><span className="text-secondary font-semibold">{t('gdpr.legalObligation', 'Legal Obligation:')}</span><span>{t('gdpr.legalObligationDesc', 'Processing required to comply with legal requirements')}</span></li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Globe className="text-secondary" size={24} />
                    {t('gdpr.internationalTitle')}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t('gdpr.internationalText', 'Your data may be transferred to and processed in countries outside the EEA. When this occurs, we ensure appropriate safeguards are in place.')}</p>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-6">{t('gdpr.exerciseTitle')}</h2>
                  <p className="text-muted-foreground mb-6">{t('gdpr.exerciseText', 'You can exercise your GDPR rights by using the options below or contacting our Data Protection Officer directly.')}</p>
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-ocean"><Download className="mr-2" size={18} />{t('gdpr.downloadData')}</Button>
                    <Button variant="outline"><Trash2 className="mr-2" size={18} />{t('gdpr.deleteAccount')}</Button>
                    <Button variant="outline"><Mail className="mr-2" size={18} />{t('gdpr.contactDPO')}</Button>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('gdpr.dpoTitle')}</h2>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-foreground font-medium">Intelligent Matrix - {t('gdpr.dpoTitle')}</p>
                    <p className="text-muted-foreground">Email: dpo@mooring-booking.com</p>
                    <p className="text-muted-foreground">{t('terms.address', 'Address: Prague, Czech Republic')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('gdpr.supervisoryTitle')}</h2>
                  <p className="text-muted-foreground">{t('gdpr.supervisoryText', 'If you believe your data protection rights have been violated, you have the right to lodge a complaint with a supervisory authority. The primary authority is ÚOOÚ (Úřad pro ochranu osobních údajů) in the Czech Republic. For users in Croatia, the relevant authority is AZOP (Personal Data Protection Agency).')}</p>
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

export default GDPRPage;