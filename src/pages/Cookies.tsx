import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Cookie, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiesPage = () => {
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
              <Cookie className="text-gold mx-auto mb-6" size={48} />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                Cookie Policy
              </h1>
              <p className="text-primary-foreground/80 mb-2">Version 2.0 | Mooring Booking.com s.r.o.</p>
              <p className="text-primary-foreground/80 mb-2">{"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
              <p className="text-primary-foreground/80 mb-2">Applies to: mooring-booking.com | ai-captain.app</p>
              <p className="text-primary-foreground/80 mb-6">Effective April 2026</p>
              <Button
                onClick={handleDownloadPdf}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Download className="mr-2" size={18} />
                Download PDF
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">

              {/* 1. INTRODUCTION */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">1. INTRODUCTION AND LEGAL BASIS</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Mooring Booking.com s.r.o. uses cookies and similar tracking technologies on the Mooring Booking platform (mooring-booking.com) and AI Captain application (ai-captain.app). This Cookie Policy explains what cookies are, which we use, why, who has access to cookie data, and how to manage your preferences.</p>
                  <p>This Cookie Policy is an integral part of the legal package including Master Terms of Service v3.0 and Privacy Policy v2.0. It is compliant with: GDPR (EU) 2016/679; ePrivacy Directive 2002/58/EC and national implementations; EDPB Guidelines 05/2020 on consent; EDPB Guidelines 03/2022 on dark patterns; and applicable national electronic communications laws in EU Mediterranean jurisdictions.</p>
                </div>
              </div>

              {/* 2. WHAT ARE COOKIES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">2. WHAT ARE COOKIES AND SIMILAR TECHNOLOGIES</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">2.1 Cookies:</strong> Small text files stored on your device when you visit the Platform. Session cookies are deleted when you close your browser. Persistent cookies remain until their defined expiry or until manually deleted.</p>
                  <p><strong className="text-foreground">2.2 Web Beacons and Pixels:</strong> Small invisible images or code embedded in pages or emails that record certain user actions, such as page visits or email opens. Meta Pixel and Google Ads Conversion Tag function partly as web beacons.</p>
                  <p><strong className="text-foreground">2.3 Local Storage and Session Storage:</strong> Browser mechanisms that store data directly in the browser without server transmission on each request. Used for user preferences and session state necessary for Platform operation.</p>
                  <p><strong className="text-foreground">2.4 Mobile App Identifiers:</strong> In mobile versions of the Platform, device identifiers analogous to cookies are used for analytics purposes with your consent, in compliance with iOS App Tracking Transparency and Android privacy frameworks.</p>
                </div>
              </div>

              {/* 3. COOKIE CATEGORIES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">3. COOKIE CATEGORIES AND COMPLETE LIST</h2>
                <div className="space-y-8 text-muted-foreground">

                  {/* 3.1 Strictly Necessary */}
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">3.1 Strictly Necessary Cookies — Always Active</h3>
                    <p className="mb-4">These cookies are essential for basic technical Platform operation. They cannot be disabled without preventing Platform functionality. Legal basis: performance of contract (Article 6(1)(b) GDPR) and legitimate interest (Article 6(1)(f) GDPR). No consent required per Recital 25 ePrivacy Directive.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead><tr className="border-b border-border"><th className="text-left p-2 text-foreground">Cookie</th><th className="text-left p-2 text-foreground">Domain</th><th className="text-left p-2 text-foreground">Duration</th><th className="text-left p-2 text-foreground">Purpose</th></tr></thead>
                        <tbody className="divide-y divide-border">
                          <tr><td className="p-2 font-mono text-xs">mb_session</td><td className="p-2">mooring-booking.com</td><td className="p-2">Session</td><td className="p-2">Manages user session state and authentication across all three service layers.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_csrf_token</td><td className="p-2">mooring-booking.com</td><td className="p-2">Session</td><td className="p-2">Protects against CSRF attacks.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_cookie_consent</td><td className="p-2">mooring-booking.com</td><td className="p-2">12 months</td><td className="p-2">Records your cookie consent decision.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_auth_token</td><td className="p-2">mooring-booking.com</td><td className="p-2">30 days</td><td className="p-2">Maintains login state for "remember me".</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_booking_state</td><td className="p-2">mooring-booking.com</td><td className="p-2">Session</td><td className="p-2">Preserves booking form state across steps in Layer 1 and Layer 2 flows.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_stripe_session</td><td className="p-2">mooring-booking.com + Stripe</td><td className="p-2">Session</td><td className="p-2">Manages secure Stripe payment session including Stripe Authorize holds for Layer 2.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_layer_preference</td><td className="p-2">mooring-booking.com</td><td className="p-2">Session</td><td className="p-2">Remembers which service layer filter the user last selected.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">ai_session</td><td className="p-2">ai-captain.app</td><td className="p-2">Session</td><td className="p-2">Manages AI Captain conversation session state.</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3.2 Functional */}
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">3.2 Functional Cookies — Require Consent</h3>
                    <p className="mb-4">These cookies improve user experience by remembering preferences. Not required for basic operation. Legal basis: consent (Article 6(1)(a) GDPR).</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead><tr className="border-b border-border"><th className="text-left p-2 text-foreground">Cookie</th><th className="text-left p-2 text-foreground">Duration</th><th className="text-left p-2 text-foreground">Purpose</th></tr></thead>
                        <tbody className="divide-y divide-border">
                          <tr><td className="p-2 font-mono text-xs">mb_language</td><td className="p-2">12 months</td><td className="p-2">Remembers selected interface language from 15 supported languages.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_map_prefs</td><td className="p-2">6 months</td><td className="p-2">Remembers map view preferences including zoom level and region.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_search_filters</td><td className="p-2">3 months</td><td className="p-2">Remembers last used search filters.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_vessel_profile</td><td className="p-2">12 months</td><td className="p-2">Caches vessel profile data to pre-populate booking forms.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_notification_prefs</td><td className="p-2">12 months</td><td className="p-2">Remembers in-Platform notification preferences.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_currency</td><td className="p-2">12 months</td><td className="p-2">Remembers selected price display currency.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">ai_conversation_context</td><td className="p-2">Session</td><td className="p-2">Temporarily preserves AI Captain conversation context. Deleted on browser close.</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3.3 Analytics */}
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">3.3 Analytics Cookies — Require Consent</h3>
                    <p className="mb-4">These cookies collect anonymised data about Platform use to improve services. Legal basis: consent (Article 6(1)(a) GDPR).</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead><tr className="border-b border-border"><th className="text-left p-2 text-foreground">Cookie</th><th className="text-left p-2 text-foreground">Provider</th><th className="text-left p-2 text-foreground">Duration</th><th className="text-left p-2 text-foreground">Purpose</th></tr></thead>
                        <tbody className="divide-y divide-border">
                          <tr><td className="p-2 font-mono text-xs">_ga</td><td className="p-2">Google Analytics 4</td><td className="p-2">24 months</td><td className="p-2">Distinguishes unique visitors. IP anonymisation active.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">_ga[ID]</td><td className="p-2">Google Analytics 4</td><td className="p-2">24 months</td><td className="p-2">Maintains session state in GA4.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">_gid</td><td className="p-2">Google Analytics 4</td><td className="p-2">24 hours</td><td className="p-2">Distinguishes users within a 24-hour period.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_analytics_session</td><td className="p-2">mooring-booking.com</td><td className="p-2">Session</td><td className="p-2">Measures booking funnel effectiveness across all three service layers.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_layer_analytics</td><td className="p-2">mooring-booking.com</td><td className="p-2">38 weeks</td><td className="p-2">Tracks which service layers are used most frequently.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_perf</td><td className="p-2">mooring-booking.com</td><td className="p-2">38 weeks</td><td className="p-2">Measures page load performance and AI Captain response times.</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-sm">Google Analytics DPA: Google LLC processed under DPA with SCC. GA Opt-out: tools.google.com/dlpage/gaoptout.</p>
                  </div>

                  {/* 3.4 Marketing */}
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">3.4 Marketing and Conversion Cookies — Require Explicit Consent</h3>
                    <p className="mb-4">These cookies measure advertising campaign effectiveness. Legal basis: explicit consent (Article 6(1)(a) GDPR). Declining these cookies does not affect Platform functionality.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead><tr className="border-b border-border"><th className="text-left p-2 text-foreground">Cookie</th><th className="text-left p-2 text-foreground">Provider</th><th className="text-left p-2 text-foreground">Duration</th><th className="text-left p-2 text-foreground">Purpose</th></tr></thead>
                        <tbody className="divide-y divide-border">
                          <tr><td className="p-2 font-mono text-xs">_fbp</td><td className="p-2">Meta Pixel</td><td className="p-2">90 days</td><td className="p-2">Measures Meta advertising campaign effectiveness and remarketing.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">_fbc</td><td className="p-2">Meta Pixel</td><td className="p-2">90 days</td><td className="p-2">Tracks clicks on Meta ads for conversion attribution.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">_gcl_au</td><td className="p-2">Google Ads</td><td className="p-2">90 days</td><td className="p-2">Measures Google advertising campaign conversions.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">_gcl_aw</td><td className="p-2">Google Ads</td><td className="p-2">90 days</td><td className="p-2">Attributes conversions to specific Google Ads campaigns.</td></tr>
                          <tr><td className="p-2 font-mono text-xs">mb_campaign_ref</td><td className="p-2">mooring-booking.com</td><td className="p-2">30 days</td><td className="p-2">Records traffic source and campaign for channel measurement.</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-sm">Meta and Google are joint controllers for pixel/tag data collection per CJEU C-40/17 (Fashion ID).</p>
                  </div>
                </div>
              </div>

              {/* 4. CONSENT MANAGEMENT */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">4. CONSENT MANAGEMENT</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">4.1 Cookie Consent Banner:</strong> Upon first visit to the Platform, a Cookie Consent Banner is displayed providing transparent information about cookie categories and enabling granular consent management. The banner is designed in compliance with EDPB Guidelines 03/2022 and does not use dark patterns. The decline button for optional cookies is equally prominent and accessible as the accept button.</p>
                  <p><strong className="text-foreground">4.2 Granular Management:</strong> You may separately accept or decline: functional cookies, analytics cookies, and marketing cookies. Strictly necessary cookies cannot be declined.</p>
                  <p><strong className="text-foreground">4.3 Modifying or Withdrawing Consent:</strong> Consent may be modified or withdrawn at any time via the "Manage Cookies" link in the footer of every Platform page, via account Settings &gt; Privacy and Cookies, or via browser settings. Withdrawal does not affect the lawfulness of processing based on consent prior to withdrawal.</p>
                  <p><strong className="text-foreground">4.4 Browser-Level Management:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Google Chrome: chrome://settings/cookies</li>
                    <li>Mozilla Firefox: about:preferences#privacy</li>
                    <li>Apple Safari macOS: Safari &gt; Preferences &gt; Privacy</li>
                    <li>Apple Safari iOS: Settings &gt; Safari &gt; Privacy & Security</li>
                    <li>Microsoft Edge: edge://settings/privacy</li>
                  </ul>
                  <p className="text-sm">Note: blocking strictly necessary cookies may prevent correct Platform operation.</p>
                  <p><strong className="text-foreground">4.5 Third-Party Opt-Out Tools:</strong> Google Analytics Opt-out: tools.google.com/dlpage/gaoptout | Meta ad preferences: facebook.com/ads/preferences | Google ad preferences: adssettings.google.com | European industry opt-out: youronlinechoices.eu</p>
                </div>
              </div>

              {/* 5. LAYER-SPECIFIC */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">5. LAYER-SPECIFIC COOKIE USAGE</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="border-l-4 border-yellow-500 pl-4"><strong className="text-foreground">&#11088; Layer 1 — Premium Marinas:</strong> All cookie categories may be active. Stripe session cookies are strictly necessary for payment processing. Analytics cookies track booking completion rates for dashboard reporting to Premium Partners (aggregated and anonymised data only).</p>
                  <p className="border-l-4 border-blue-500 pl-4"><strong className="text-foreground">&#128309; Layer 2 — Concierge Booking:</strong> mb_booking_state and mb_stripe_session are strictly necessary to maintain Stripe Authorize hold state across booking form steps. If these cookies are blocked, the Layer 2 booking flow cannot function correctly.</p>
                  <p className="border-l-4 border-green-500 pl-4"><strong className="text-foreground">&#128506;&#65039; Layer 3 — Explore & Navigate:</strong> Only strictly necessary session and map preference cookies are active. No payment cookies are set. ai_session is used when the user queries AI Captain for navigation guidance about Layer 3 locations.</p>
                </div>
              </div>

              {/* 6. AI CAPTAIN */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">6. AI CAPTAIN APPLICATION — SPECIFIC NOTES</h2>
                <p className="text-muted-foreground">The AI Captain application at ai-captain.app uses the same cookie categories described in Section 3. The ai_session cookie is strictly necessary for conversational continuity within one session. It does not contain conversation content — content is stored server-side and subject to the Privacy Policy v2.0 retention schedule. AI Captain session cookies are deleted on browser close and contain no personally identifiable information.</p>
              </div>

              {/* 7. CHILDREN */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">7. CHILDREN AND MINORS</h2>
                <p className="text-muted-foreground">The Platform is not directed to persons under 18 years of age. The Company does not knowingly collect personal data from minors through cookies or otherwise. If you believe a minor has used the Platform, contact privacy@mooring-booking.com immediately.</p>
              </div>

              {/* 8. CHANGES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">8. CHANGES TO THIS POLICY</h2>
                <p className="text-muted-foreground">This Cookie Policy may be amended to reflect changes in applicable law, new Platform features, changes in third-party services, or supervisory authority decisions. Material changes affecting cookies for which you have given consent will be notified at least 30 days before taking effect.</p>
              </div>

              {/* 9. CONTACT */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">9. CONTACT</h2>
                <div className="text-muted-foreground space-y-2">
                  <p><strong className="text-foreground">Mooring Booking.com s.r.o.</strong> | I{"ČO"} 29543631 · DI{"Č"} CZ29543631 | {"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
                  <p>Data protection: <strong className="text-foreground">privacy@mooring-booking.com</strong></p>
                  <p>General: <strong className="text-foreground">info@mooring-booking.com</strong> | Tel: +420 739 328 337</p>
                  <p>Supervisory authority: {"Úřad pro ochranu osobních údajů"} (uoou.cz)</p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center text-muted-foreground py-4">
                <p>Cookie Policy v2.0 — consistent with Master Terms of Service v3.0, Privacy Policy v2.0 and GDPR Notice for Marina Operators v2.0.</p>
                <p>&copy; Mooring Booking.com s.r.o. All rights reserved.</p>
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
