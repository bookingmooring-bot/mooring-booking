import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const PrivacyPage = () => {
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
                {t('legal.privacyTitle')}
              </h1>
              <p className="text-primary-foreground/80">
                {t('legal.privacyLastUpdated')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <div className="bg-card rounded-xl p-8 shadow-card mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Eye className="text-secondary" size={24} />
                  {t('privacy.overview')}
                </h2>
                <p className="text-muted-foreground">
                  {t('privacy.overviewText')}
                </p>
              </div>

              <div className="space-y-8">
                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Database className="text-secondary" size={24} />
                    {t('privacy.infoCollectTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('privacy.infoCollectText', 'We collect the following types of information:')}</p>
                    <p><strong className="text-foreground">{t('privacy.personalData', 'Personal Information')}:</strong> {t('privacy.personalDataDesc', 'Name, email address, phone number, and payment information when you create an account or make a booking.')}</p>
                    <p><strong className="text-foreground">{t('privacy.locationData', 'Location Data')}:</strong> {t('privacy.locationDataDesc', 'GPS coordinates for navigation purposes, only after a booking is confirmed. We do not track your location continuously.')}</p>
                    <p><strong className="text-foreground">{t('privacy.usageData', 'Usage Data')}:</strong> {t('privacy.usageDataDesc', 'Information about how you interact with our platform, including pages visited, search queries, and booking history.')}</p>
                    <p><strong className="text-foreground">{t('privacy.deviceData', 'Device Information')}:</strong> {t('privacy.deviceDataDesc', 'Browser type, operating system, and device identifiers for security and optimization purposes.')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Lock className="text-secondary" size={24} />
                    {t('privacy.howWeUseTitle')}
                  </h2>
                  <p className="text-muted-foreground mb-4">{t('privacy.howWeUseText', 'We use your information to:')}</p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li>{t('privacy.use1', 'Process bookings and payments')}</li>
                    <li>{t('privacy.use2', 'Provide personalized recommendations via AI Captain')}</li>
                    <li>{t('privacy.use3', 'Process payments, calculate commissions, and manage Now4Today surcharges')}</li>
                    <li>{t('privacy.use4', 'Send booking notifications, weather alerts, and updates')}</li>
                    <li>{t('privacy.use5', 'Improve our platform and user experience')}</li>
                    <li>{t('privacy.use6', 'Comply with legal obligations')}</li>
                    <li>{t('privacy.use7', 'Manage provider add-on services (Marketing Tools, Premium Listing, Mooring Insurance)')}</li>
                    <li>{t('privacy.use8', 'Process custom daily pricing set by mooring providers')}</li>
                    <li>{t('privacy.use9', 'Display targeted advertisements based on anonymized usage patterns')}</li>
                  </ul>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <UserCheck className="text-secondary" size={24} />
                    {t('privacy.dataSharingTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('privacy.dataSharingText', 'We may share your information with:')}</p>
                    <p>{t('privacy.sharing1', 'Mooring providers — to fulfill your booking (contact details are only revealed after booking confirmation)')}</p>
                    <p>{t('privacy.sharing2', 'Payment service providers — Stripe for secure transaction processing')}</p>
                    <p>{t('privacy.sharing3', 'Analytics services — anonymized usage statistics for platform improvement')}</p>
                    <p>{t('privacy.sharing4', 'Legal authorities — when required by law or court order')}</p>
                    <p>{t('privacy.sharing5', 'Insurance partners — when providers opt into Mooring Insurance for liability mediation')}</p>
                    <p>{t('privacy.sharing6', 'Advertising partners — anonymized usage data for targeted ad placement')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('privacy.yourRightsTitle')}</h2>
                  <p className="text-muted-foreground mb-4">{t('privacy.yourRightsText', 'Under GDPR and applicable data protection laws, you have the right to:')}</p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li>{t('privacy.right1', 'Access, rectify, or delete your personal data')}</li>
                    <li>{t('privacy.right2', 'Restrict or object to processing')}</li>
                    <li>{t('privacy.right3', 'Receive your data in a portable format')}</li>
                    <li>{t('privacy.right4', 'Withdraw consent at any time')}</li>
                    <li>{t('privacy.right5', 'Lodge a complaint with a supervisory authority')}</li>
                  </ul>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('privacy.cookiesTitle')}</h2>
                  <p className="text-muted-foreground">
                    {t('privacy.cookiesText', 'We use cookies to provide and improve our services. For full details, see our Cookie Policy.')}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('privacy.dataSecurityTitle')}</h2>
                  <p className="text-muted-foreground">
                    {t('privacy.dataSecurityText', 'We use industry-standard encryption, secure servers, and regular security audits to protect your data. All network traffic is encrypted via TLS/SSL.')}
                  </p>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Mail className="text-secondary" size={24} />
                    {t('privacy.contactTitle')}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {t('privacy.contactText', 'For privacy questions, contact us at privacy@mooringbooking.com or via the contact form.')}
                  </p>
                  <div className="text-foreground">
                    <p>Intelligent Matrix</p>
                    <p>Email: privacy@mooring-booking.com</p>
                    <p>{t('terms.address', 'Address: Prague, Czech Republic')}</p>
                  </div>
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

export default PrivacyPage;
