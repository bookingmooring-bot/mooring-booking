import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, AlertTriangle, Scale, CreditCard, Shield, Users, Globe, Gavel, Ban, RefreshCw, Building, Lock, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
  const { t } = useTranslation();

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-ocean print:hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <FileText className="text-gold mx-auto mb-6" size={48} />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Opći uvjeti korištenja
              </h1>
              <p className="text-primary-foreground/80 mb-6">Zadnje ažurirano: 18. ožujka 2026.</p>
              <Button
                onClick={handleDownloadPdf}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="mr-2" size={18} />
                Preuzmi PDF
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-xl p-8 shadow-card mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{t('terms.agreementTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('terms.agreementText')}</p>
                <p className="text-muted-foreground">{t('terms.agreementText2')}</p>
              </div>

              <div className="space-y-8">
                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Building className="text-secondary" size={24} />
                    {t('terms.platformTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.platformDesc')} <strong className="text-foreground">{t('terms.platformBold')}</strong></p>
                    <p className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-warning-foreground">
                      <strong>{t('terms.asIsWarning')}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Users className="text-secondary" size={24} />
                    {t('terms.userAccountsTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.userAccountsText', 'To use certain features of the Platform, you must register for an account. You agree to:')}</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.userAccount1', 'Provide accurate, current, and complete information')}</li>
                      <li>{t('terms.userAccount2', 'Maintain and promptly update your information')}</li>
                      <li>{t('terms.userAccount3', 'Keep your password secure and confidential')}</li>
                      <li>{t('terms.userAccount4', 'Accept full responsibility for all activities under your account')}</li>
                      <li>{t('terms.userAccount5', 'Notify us immediately of any unauthorized use')}</li>
                      <li>{t('terms.userAccount6', 'Not create multiple accounts for fraudulent purposes')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <CreditCard className="text-secondary" size={24} />
                    {t('terms.bookingsTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p><strong className="text-foreground">{t('terms.forCustomers', 'For Customers:')}</strong></p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.customer1', 'Bookings are confirmed upon successful payment processing')}</li>
                      <li>{t('terms.customer2', 'Prices displayed include any applicable platform discounts')}</li>
                      <li>{t('terms.customer3', 'Cancellation policies vary by mooring; review before booking')}</li>
                      <li>{t('terms.customer4', 'Navigation coordinates are provided only after confirmed booking and payment')}</li>
                      <li>{t('terms.customer5', '"Now4Today" same-day bookings (01:00 AM to 11:00 PM) carry a mandatory 20% premium surcharge. The platform commission is calculated on the full increased amount.')}</li>
                      <li>{t('terms.customer6', 'Winter berth/storage bookings are subject to monthly pricing as displayed')}</li>
                    </ul>
                    <p className="mt-4"><strong className="text-foreground">{t('terms.forProviders', 'For Providers:')}</strong></p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.provider1', 'A 15% commission is charged on ALL bookings processed through the Platform')}</li>
                      <li>{t('terms.provider2', 'Stripe processing fees (approximately 2.9% + €0.30) are deducted from the total booking amount BEFORE the 15/85 commission split')}</li>
                      <li>{t('terms.provider3', 'Providers may offer 0-50% discount through the Platform')}</li>
                      <li>{t('terms.provider4', 'Payments are processed within 3-5 business days after checkout')}</li>
                      <li>{t('terms.provider5', 'Monthly invoices are issued for cash booking commissions')}</li>
                      <li>{t('terms.provider6', 'Failure to pay commissions may result in listing removal and account termination')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Shield className="text-secondary" size={24} />
                    {t('terms.providerResponsibilitiesTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.providerResponsibilitiesText', 'Mooring providers agree to and acknowledge the following obligations:')}</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.provResp1', 'Provide accurate descriptions and photos of their moorings')}</li>
                      <li>{t('terms.provResp2', 'Maintain accurate availability calendars')}</li>
                      <li>{t('terms.provResp3', 'Respond to booking requests promptly')}</li>
                      <li>{t('terms.provResp4', 'Ensure moorings meet applicable local safety standards')}</li>
                      <li>{t('terms.provResp5', 'Honor all confirmed bookings')}</li>
                      <li>{t('terms.provResp6', 'Pay the 15% commission on all Platform bookings without exception')}</li>
                      <li>{t('terms.provResp7', 'Sign the right-of-disposal declaration (Izjava o pravu raspolaganja) confirming legal authorization over the mooring')}</li>
                      <li>{t('terms.provResp8', 'Sign the commission payment agreement')}</li>
                      <li>{t('terms.provResp9', 'Maintain valid liability insurance where required by local law')}</li>
                      <li>{t('terms.provResp10', 'Comply with all applicable local, national, and international regulations')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <RefreshCw className="text-secondary" size={24} />
                    {t('terms.dataTransferTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.dataTransferText1', 'By using the Platform and accepting these Terms, all users expressly consent to the transfer of their personal data to any successor entity in the event of a sale, merger, acquisition, or any other change of ownership.')}</p>
                    <p>{t('terms.dataTransferText2', 'This consent extends to all data collected during the course of using the Platform.')}</p>
                    <p>{t('terms.dataTransferText3', 'The successor entity shall be bound by the same privacy obligations. Users will be notified within 30 days of completion.')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <AlertTriangle className="text-secondary" size={24} />
                    {t('terms.liabilityTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                      <strong className="text-foreground">{t('terms.liabilityWarning', 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:')}</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-3">
                      <li><strong className="text-foreground">{t('terms.noLiabilityMooring', 'No Liability for Mooring Conditions:')}</strong> {t('terms.noLiabilityMooringText', 'Intelligent Matrix is NOT liable for the condition, safety, structural integrity, legality, cleanliness, or suitability of any mooring.')}</li>
                      <li><strong className="text-foreground">{t('terms.noLiabilityInjury', 'No Liability for Personal Injury or Property Damage:')}</strong> {t('terms.noLiabilityInjuryText', 'Intelligent Matrix is NOT liable for any personal injury, death, illness, property damage, vessel damage, equipment damage, or any other physical harm.')}</li>
                      <li><strong className="text-foreground">{t('terms.noLiabilityFinancial', 'No Liability for Financial Loss:')}</strong> {t('terms.noLiabilityFinancialText', 'Intelligent Matrix is NOT liable for any financial losses, lost profits, lost revenue, lost bookings, or any other economic damages.')}</li>
                      <li><strong className="text-foreground">{t('terms.noLiabilityWeather', 'No Liability for Weather/Environmental Events:')}</strong> {t('terms.noLiabilityWeatherText', 'Intelligent Matrix is NOT liable for any damages resulting from weather conditions, storms, or any environmental factors.')}</li>
                      <li><strong className="text-foreground">{t('terms.noLiabilityThirdParty', 'No Liability for Third-Party Actions:')}</strong> {t('terms.noLiabilityThirdPartyText', 'Intelligent Matrix is NOT liable for the actions, omissions, negligence, or misconduct of any Provider, Customer, or third party.')}</li>
                      <li><strong className="text-foreground">{t('terms.aiCaptainDisclaimer', 'AI Captain Disclaimer:')}</strong> {t('terms.aiCaptainDisclaimerText', 'Weather forecasts, navigation advice, and all information provided by AI Captain is for informational purposes only and does NOT constitute professional maritime advice.')}</li>
                    </ul>
                    <p className="mt-4 font-semibold text-foreground">{t('terms.maxLiabilityCap', 'MAXIMUM LIABILITY CAP: In no event shall Intelligent Matrix\'s total aggregate liability exceed the lesser of: (a) the total fees paid by you in the 12 months preceding the claim; or (b) €500.')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Lock className="text-secondary" size={24} />
                    {t('terms.indemnificationTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.indemnificationText', 'You agree to indemnify, defend, and hold harmless Intelligent Matrix from and against any and all claims arising out of or relating to:')}</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.indem1', 'Your use of the Platform or any mooring booked through the Platform')}</li>
                      <li>{t('terms.indem2', 'Your violation of these Terms or any applicable law')}</li>
                      <li>{t('terms.indem3', 'Your content, listings, or interactions with other users')}</li>
                      <li>{t('terms.indem4', 'Any claim by a third party related to your mooring or services')}</li>
                      <li>{t('terms.indem5', 'Any injury, damage, or loss caused at or near your mooring')}</li>
                      <li>{t('terms.indem6', 'Your failure to comply with maritime safety regulations')}</li>
                      <li>{t('terms.indem7', 'Any tax obligations arising from your use of the Platform')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('terms.forceMajeureTitle')}</h2>
                  <p className="text-muted-foreground">{t('terms.forceMajeureText', 'Intelligent Matrix shall not be liable for any failure to perform its obligations where such failure results from circumstances beyond its reasonable control, including acts of God, natural disasters, pandemics, war, terrorism, government actions, power failures, internet outages, or any other force majeure event.')}</p>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('terms.intellectualPropertyTitle')}</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.ipText1', 'All intellectual property rights in the Platform, including the software, code, design, logos, trademarks, AI Captain technology, and algorithms, are and shall remain the exclusive property of Intelligent Matrix.')}</p>
                    <p>{t('terms.ipText2', 'By submitting content to the Platform, you grant Intelligent Matrix a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, modify, distribute, and display such content.')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Ban className="text-secondary" size={24} />
                    {t('terms.prohibitedTitle')}
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t('terms.prohibited1', 'Listing moorings you have no legal right of disposal (pravo raspolaganja) or valid concession over')}</li>
                    <li>{t('terms.prohibited2', 'Providing false, misleading, or fraudulent information')}</li>
                    <li>{t('terms.prohibited3', 'Circumventing the Platform to avoid commission fees')}</li>
                    <li>{t('terms.prohibited4', 'Contacting users outside the Platform to avoid fees')}</li>
                    <li>{t('terms.prohibited5', 'Harassing, threatening, or discriminating against other users')}</li>
                    <li>{t('terms.prohibited6', 'Violating any applicable laws, regulations, or maritime standards')}</li>
                    <li>{t('terms.prohibited7', 'Attempting to manipulate ratings, reviews, or search rankings')}</li>
                    <li>{t('terms.prohibited8', 'Using the Platform for illegal activities')}</li>
                    <li>{t('terms.prohibited9', 'Reverse engineering, decompiling, or copying Platform technology')}</li>
                    <li>{t('terms.prohibited10', 'Scraping, crawling, or automated data collection')}</li>
                    <li>{t('terms.prohibited11', 'Creating fake accounts or bookings')}</li>
                  </ul>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('terms.subscriptionTitle')}</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.subscriptionText', 'The Platform offers three subscription tiers: Basic (Free), Premium Monthly (€19.99/month), and Premium Annual (€9.99/month billed annually at €119.88).')}</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.sub1', 'Subscriptions auto-renew unless cancelled before the renewal date')}</li>
                      <li>{t('terms.sub2', 'No refunds for partial subscription periods')}</li>
                      <li>{t('terms.sub3', 'Intelligent Matrix reserves the right to modify pricing with 30 days notice')}</li>
                      <li>{t('terms.sub4', 'Free tier features may be limited or modified at any time')}</li>
                      <li>{t('terms.sub5', 'AI Captain usage limits (10 questions total for Basic) are enforced automatically')}</li>
                    </ul>
                    <h3 className="font-heading font-semibold text-foreground mt-4">{t('terms.providerAddOnsTitle', 'Optional Provider Add-Ons')}</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.addOn1', 'Marketing Tools — €5/month: QR code and affiliate link for your mooring')}</li>
                      <li>{t('terms.addOn2', 'Premium Listing — €9.99/month: Priority placement in search results')}</li>
                      <li>{t('terms.addOn3', 'Mooring Insurance — €9.99/year: Third-party liability protection and mooring security mediation')}</li>
                    </ul>
                    <h3 className="font-heading font-semibold text-foreground mt-4">{t('terms.now4TodayTitle', 'Now4Today Same-Day Bookings')}</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>{t('terms.now4today1', 'Now4Today is available for same-day bookings only (01:00 AM to 11:00 PM)')}</li>
                      <li>{t('terms.now4today2', 'A mandatory 20% surcharge is applied to the base price')}</li>
                      <li>{t('terms.now4today3', 'The 15% platform commission is calculated on the full surcharge-inclusive amount')}</li>
                      <li>{t('terms.now4today4', 'Owners can enable/disable Now4Today from their dashboard')}</li>
                    </ul>
                    <h3 className="font-heading font-semibold text-foreground mt-4">{t('terms.customPricingTitle', 'Custom Daily Pricing')}</h3>
                    <p>{t('terms.customPricingText', 'Providers may set custom prices per day via their dashboard calendar. Custom prices override the default nightly rate for the specified dates.')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Scale className="text-secondary" size={24} />
                    {t('terms.disputeTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.disputeText', 'Any disputes shall first be attempted to be resolved through good-faith negotiation for 30 days. If negotiation fails, disputes shall be resolved by binding arbitration under Czech law. The courts of Prague, Czech Republic shall have exclusive jurisdiction.')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Gavel className="text-secondary" size={24} />
                    {t('terms.generalTitle')}
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('terms.generalText', 'These Terms, together with the Privacy Policy, Cookie Policy, and GDPR Policy, constitute the entire agreement between you and Intelligent Matrix. If any provision is held invalid, the remaining provisions continue in full force.')}</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4">{t('terms.changesToTermsTitle')}</h2>
                  <p className="text-muted-foreground">{t('terms.changesToTermsText', 'We reserve the right to modify these Terms at any time. Material changes will be notified at least 30 days before taking effect. Continued use constitutes acceptance.')}</p>
                </div>

                <div className="bg-card rounded-xl p-8 shadow-card">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <Globe className="text-secondary" size={24} />
                    {t('terms.contactTitle')}
                  </h2>
                  <div className="text-muted-foreground">
                    <p>{t('terms.contactText', 'For questions about these Terms, contact:')}</p>
                    <div className="mt-4 text-foreground space-y-1">
                      <p className="font-semibold">Intelligent Matrix</p>
                      <p>Email: legal@mooring-booking.com</p>
                      <p>Email: info@intelligent-matrix.com</p>
                      <p>{t('terms.address', 'Address: Prague, Czech Republic')}</p>
                       <p>{t('terms.phone', 'Phone: +420 739 328 337')}</p>
                    </div>
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

export default TermsPage;