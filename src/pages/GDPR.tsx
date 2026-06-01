import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const GDPRPage = () => {
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
              <Shield className="text-gold mx-auto mb-6" size={48} />
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                GDPR Notice for Marina Operators
              </h1>
              <p className="text-primary-foreground/80 mb-2">Version 2.0 | Mooring Booking.com s.r.o.</p>
              <p className="text-primary-foreground/80 mb-2">{"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
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

              {/* 1. WHO THIS NOTICE IS FOR */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">1. WHO THIS NOTICE IS FOR</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>This notice is addressed to natural persons — private individuals, sole traders and self-employed operators — who manage nautical facilities (marinas, docks, anchorages, buoy fields, restaurants with berths, private mooring concessions) whose business contact data appears on the Mooring Booking or AI Captain platforms under Layer 2 (Concierge Booking) or Layer 3 (Explore & Navigate) without a signed Partnership Agreement.</p>
                  <p><strong className="text-foreground">This notice does NOT apply to:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Legal entities</strong> (limited companies, joint-stock companies, registered partnerships): business data of legal entities is not personal data under GDPR Article 4(1) and GDPR does not apply.</li>
                    <li><strong>Premium Partners (Layer 1)</strong> who have executed a Partnership Agreement: their data processing is governed by the Partnership Agreement and Privacy Policy v2.0.</li>
                  </ul>
                </div>
              </div>

              {/* 2. DATA CONTROLLER */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">2. IDENTITY OF THE DATA CONTROLLER</h2>
                <div className="text-muted-foreground space-y-2">
                  <p><strong className="text-foreground">Mooring Booking.com s.r.o.</strong></p>
                  <p>{"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
                  <p>Registered number (I{"ČO"}): [INSERT]</p>
                  <p>Data protection contact: <strong className="text-foreground">privacy@mooring-booking.com</strong></p>
                  <p>General contact: <strong className="text-foreground">info@mooring-booking.com</strong> | +420 739 328 337</p>
                </div>
              </div>

              {/* 3. WHICH DATA APPEARS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">3. WHICH OF YOUR DATA APPEARS ON THE PLATFORM AND IN WHICH LAYER</h2>
                <div className="space-y-6 text-muted-foreground">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">3.1 Layer 2 — Concierge Booking</h3>
                    <p className="text-sm text-blue-600 font-semibold mb-2">&#128309; Concierge Booking — Upon Request</p>
                    <p>Your facility may appear in Layer 2 if the Company has identified it from publicly available sources and is able to transmit booking requests to you on behalf of Customers. Data that may be displayed: facility name, GPS coordinates, telephone number you have publicly published for business enquiries, email address published for business contact, website URL, capacity and publicly advertised pricing.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">3.2 Layer 3 — Explore & Navigate</h3>
                    <p className="text-sm text-green-600 font-semibold mb-2">&#128506;&#65039; Navigate Only — No Booking Available</p>
                    <p>Your facility may appear in Layer 3 as a navigational reference only. No booking service is provided and no contact data is transmitted to Customers. Data that may be displayed: facility name, GPS coordinates, publicly available navigational data (depth, VHF channel, wind protection) from nautical databases.</p>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">3.3 What Is Never Displayed</h3>
                    <p>Personal identification documents; personal tax identification numbers not publicly published; data about personal assets unrelated to the business activity; health, political or religious data; any data not publicly available and not directly related to your nautical business activity.</p>
                  </div>
                </div>
              </div>

              {/* 4. SOURCES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">4. SOURCES OF YOUR DATA</h2>
                <div className="text-muted-foreground">
                  <p className="mb-4">Data appearing in Layer 2 and Layer 3 listings is sourced exclusively from the following publicly available sources:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-foreground">OpenStreetMap</strong> — licensed under Open Database Licence (ODbL v1.0), containing geographic and business data entered by the contributor community or sourced from public registries</li>
                    <li><strong className="text-foreground">Google Maps Platform</strong> — Places API providing business data that operators themselves have entered or confirmed in Google Business Profile</li>
                    <li><strong className="text-foreground">Official maritime authority and harbour master registries</strong> — publicly available by law for navigational safety</li>
                    <li><strong className="text-foreground">Publicly accessible websites and tourism portals</strong> where you have published your own business contact data</li>
                    <li><strong className="text-foreground">Publicly available nautical databases</strong> including OpenSeaMap and official Electronic Navigational Charts (ENC S-57 format)</li>
                  </ul>
                </div>
              </div>

              {/* 5. LEGAL BASIS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">5. LEGAL BASIS FOR PROCESSING YOUR DATA</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">5.1 Applicable Legal Basis:</strong> Processing of your publicly published business contact data is based on the legitimate interest of the Company and third parties under Article 6(1)(f) GDPR, in accordance with the three-part test confirmed by the Court of Justice of the European Union in C-621/22 (Koninklijke Nederlandse Lawn Tennisbond v. Autoriteit Persoonsgegevens, 4 October 2024) and EDPB Guidelines 01/2024 on legitimate interests.</p>
                  <p><strong className="text-foreground">5.2 Purpose Test:</strong> The Company's legitimate interest is to provide comprehensive and accurate information about nautical infrastructure to users planning Mediterranean voyages. This interest also serves the broader public interest in navigational safety.</p>
                  <p><strong className="text-foreground">5.3 Necessity Test:</strong> Display of facility name, location and contact data publicly published by the operator is necessary to fulfil this purpose. Without these data, the service cannot function. Processing is limited to the minimum data necessary.</p>
                  <p><strong className="text-foreground">5.4 Balancing Test:</strong> Your legitimate interests and fundamental rights are protected by the following: data processed is exclusively that which you yourself made publicly available for business purposes; the display context is informational and neutral; processing does not include private personal data; you have a clear and simple right to removal described in Section 7; display of your facility may generate business benefit by increasing your visibility to sailors.</p>
                  <p><strong className="text-foreground">5.5 Relevant Case Law:</strong> This legal basis is consistent with established practice: Google Maps displays business data without prior consent; TripAdvisor displays data on 8+ million tourism facilities; Navionics and similar nautical platforms display data from public databases. CJEU C-621/22 confirmed that purely commercial interests can qualify as legitimate interests.</p>
                </div>
              </div>

              {/* 6. PURPOSES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">6. PURPOSES OF PROCESSING AND HOW YOUR DATA IS USED</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Your facility data is used exclusively for:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Layer 2:</strong> displaying your facility as a Concierge Booking option to sailors searching in your geographic area, and transmitting structured booking requests to you on behalf of Customers</li>
                    <li><strong>Layer 3:</strong> displaying your facility as a navigational reference point in AI Captain recommendations and Platform search results</li>
                    <li>AI Captain route and navigation recommendations that may reference your facility</li>
                  </ul>
                  <p className="mt-4">Your data is <strong className="text-foreground">NOT</strong> used for: profiling, automated decision-making with legal effect, direct marketing to you personally, or sharing with third parties for commercial purposes.</p>
                </div>
              </div>

              {/* 7. YOUR RIGHTS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">7. YOUR RIGHTS AS A DATA SUBJECT</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>As a natural person whose personal data is processed, you have the following rights under GDPR exercisable free of charge at privacy@mooring-booking.com:</p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li><strong className="text-foreground">7.1 Right of Access — Article 15 GDPR:</strong> You may request confirmation of whether we process personal data relating to you and a copy of such data.</li>
                    <li><strong className="text-foreground">7.2 Right to Rectification — Article 16 GDPR:</strong> You may request correction of inaccurate data about your facility. Corrections processed within 5 business days of identity verification.</li>
                    <li><strong className="text-foreground">7.3 Right to Erasure — Article 17 GDPR:</strong> You may request deletion of personal data. Erasure requests processed within 5 business days. Note: following erasure, your data may remain available via the original sources (Google Maps, OpenStreetMap, harbour master registries) over which we have no control.</li>
                    <li><strong className="text-foreground">7.4 Right to Object — Article 21 GDPR:</strong> You may object to processing based on legitimate interest at any time. We will assess whether compelling legitimate grounds exist that override your interests.</li>
                    <li><strong className="text-foreground">7.5 Right to Restriction — Article 18 GDPR:</strong> You may request restriction of processing pending resolution of your objection.</li>
                    <li><strong className="text-foreground">7.6 Right to Lodge a Complaint:</strong> With the Czech Data Protection Office ({"Úřad pro ochranu osobních údajů"}, Pplk. Sochora 27, 170 00 Praha 7, www.uoou.cz) or the supervisory authority in your country of residence.</li>
                  </ul>
                </div>
              </div>

              {/* 8. REMOVAL PROCEDURE */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">8. REMOVAL AND CORRECTION REQUEST PROCEDURE</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>To request removal or correction of your facility data, send a written request to <strong className="text-foreground">privacy@mooring-booking.com</strong> with the subject line <strong>"Removal Request — Marina Operator"</strong> or <strong>"Correction Request — Marina Operator"</strong>.</p>
                  <p>Your request must include:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Facility name and location</li>
                    <li>Description of your relationship to the facility (owner, concessionaire, authorised operator)</li>
                    <li>Description of what you wish removed or corrected and the reason</li>
                  </ul>
                  <p>For identity verification we may request basic documentation such as a concession decision, trade licence, company extract or other public document confirming your relationship to the facility.</p>
                  <p>We will respond within <strong className="text-foreground">5 business days</strong> of receipt of a complete request. Removal or correction will be implemented within <strong className="text-foreground">15 business days</strong>.</p>
                  <p className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-sm"><strong className="text-foreground">Important:</strong> periodic refreshing of the database from public sources may result in reappearance of previously removed data if it remains available in the original public sources. In that case, please contact us again or request removal directly from the source (Google Business Profile, OpenStreetMap, relevant harbour master authority).</p>
                </div>
              </div>

              {/* 9. RETENTION */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">9. RETENTION PERIODS</h2>
                <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground">
                  <ul className="space-y-2">
                    <li><strong className="text-foreground">Facility data in active database:</strong> for the duration of Platform operations or until receipt of a valid removal request.</li>
                    <li><strong className="text-foreground">Anonymised booking data:</strong> data about facilities that have been subject of booking requests may be retained in anonymised form for statistical analysis after removal.</li>
                    <li><strong className="text-foreground">Removal/correction request records:</strong> 7 years from request date to demonstrate GDPR compliance.</li>
                  </ul>
                </div>
              </div>

              {/* 10. INTERNATIONAL TRANSFERS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">10. INTERNATIONAL DATA TRANSFERS</h2>
                <p className="text-muted-foreground">Where personal data is transferred outside the EEA in connection with Platform operations (e.g., to Stripe, Google or AI model providers), the Company ensures appropriate safeguards under Chapter V GDPR including Standard Contractual Clauses (Implementing Decision 2021/914). Primary Platform infrastructure is hosted within the EU.</p>
              </div>

              {/* 11. CONSISTENCY */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">11. CONSISTENCY WITH OTHER PLATFORM DOCUMENTS</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>This GDPR Notice is consistent with and supplements:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Master Terms of Service v3.0</strong> — in particular Sections 1.14, 2.3, 4.2 and 4.3</li>
                    <li><strong>Privacy Policy v2.0</strong> — in particular Sections 4.4 and 5.2</li>
                    <li><strong>Cookie Policy v2.0</strong> — in particular Section 5</li>
                  </ul>
                  <p>In the event of inconsistency between this Notice and the above documents regarding processing of personal data of natural persons who are not registered Platform users, this Notice prevails as lex specialis.</p>
                </div>
              </div>

              {/* 12. CHANGES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">12. CHANGES TO THIS NOTICE</h2>
                <p className="text-muted-foreground">This Notice may be amended to reflect changes in applicable law, changes in data collection from facilities, or supervisory authority decisions. The current version is always available at mooring-booking.com/gdpr-notice.</p>
              </div>

              {/* 13. CONTACT */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">13. CONTACT</h2>
                <div className="text-muted-foreground space-y-2">
                  <p><strong className="text-foreground">Mooring Booking.com s.r.o.</strong> | I{"ČO"} 29543631 · DI{"Č"} CZ29543631 | {"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
                  <p>Data protection: <strong className="text-foreground">privacy@mooring-booking.com</strong></p>
                  <p>General: <strong className="text-foreground">info@mooring-booking.com</strong> | +420 739 328 337</p>
                  <p>Subject line for requests: <strong>"Removal Request — Marina Operator"</strong> or <strong>"Correction Request — Marina Operator"</strong></p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center text-muted-foreground py-4">
                <p>GDPR Notice for Marina Operators v2.0 — consistent with Master Terms of Service v3.0, Privacy Policy v2.0 and Cookie Policy v2.0.</p>
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

export default GDPRPage;
