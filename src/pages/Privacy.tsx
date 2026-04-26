import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
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
                Privacy Policy
              </h1>
              <p className="text-primary-foreground/80 mb-2">Version 2.0 | Intelligent Matrix s.r.o.</p>
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
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">1. INTRODUCTION AND IDENTITY OF DATA CONTROLLER</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Intelligent Matrix s.r.o. ("Company", "we", "us"), operator of the Mooring Booking platform (mooring-booking.com) and AI Captain application (ai-captain.app), is the data controller for personal data processed through the Platform within the meaning of Article 4(7) of Regulation (EU) 2016/679 ("GDPR").</p>
                  <p>These Privacy Policy form an integral part of, and must be read together with, the Master Terms of Service v3.0. Defined terms used herein have the same meaning as in the Master Terms of Service v3.0.</p>
                  <p><strong className="text-foreground">Contact:</strong> privacy@mooring-booking.com | info@mooring-booking.com | +420 739 328 337</p>
                </div>
              </div>

              {/* 2. SCOPE */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">2. SCOPE OF APPLICATION</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>These Privacy Policy apply to all natural persons accessing or using the Platform, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Customers (sailors, boat owners, charter skippers) using the Platform to search for or book Mooring Services</li>
                    <li>Providers using the Platform as Premium Partners (Layer 1), Concierge Booking facilities (Layer 2), or referenced as Explore & Navigate locations (Layer 3)</li>
                    <li>Visitors to mooring-booking.com and ai-captain.app without a registered account</li>
                    <li>Affiliate partners and business users</li>
                    <li>Users of the AI Captain application at ai-captain.app</li>
                  </ul>
                  <p>These Policy do not apply to processing of business data of legal entities listed in Layer 2 or Layer 3 of the Platform, which do not constitute personal data within the meaning of Article 4(1) GDPR. Natural persons operating small facilities whose publicly published contact data appears in Layer 2 or Layer 3 are addressed in Section 4.4 and in the separate GDPR Notice for Marina Operators.</p>
                </div>
              </div>

              {/* 3. CATEGORIES OF PERSONAL DATA */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">3. CATEGORIES OF PERSONAL DATA COLLECTED</h2>
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">3.1 Data Provided Directly by Users</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Identity and contact data:</strong> full name, email address, telephone number, username and hashed password.</li>
                      <li><strong className="text-foreground">Vessel and nautical data:</strong> vessel name, registration number, length, draft, beam, vessel type, class of navigation licence, VHF channel and operational characteristics.</li>
                      <li><strong className="text-foreground">Provider listing data (Premium Partners — Layer 1):</strong> GPS coordinates and description of berths, photographs, pricing and availability calendar, business contact data visible to Customers only after confirmed payment in accordance with Section 4.2.4 of the Master Terms of Service v3.0.</li>
                      <li><strong className="text-foreground">Financial data:</strong> Stripe-generated payment token (the Company does not store card numbers or CVV codes), transaction history and billing information.</li>
                      <li><strong className="text-foreground">Communications:</strong> messages exchanged through the Platform messaging system and enquiries to customer support.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">3.2 Data Collected Automatically</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Device and access data:</strong> IP address, browser type and version, operating system, device identifiers, system language, date, time and duration of visit.</li>
                      <li><strong className="text-foreground">Platform usage data:</strong> pages visited, features used, search terms entered, search results clicked, and interaction with the booking process across all three service layers.</li>
                      <li><strong className="text-foreground">Location data:</strong> GPS coordinates of the vessel when the user actively uses GPS search features or AI Captain navigation recommendations, collected exclusively with active location permission on the device. Session GPS data is not stored permanently without the user's explicit save action.</li>
                      <li><strong className="text-foreground">AI Captain interaction data:</strong> content of queries submitted to AI Captain, responses received, and session metadata. Conversations are anonymised before storage for service improvement purposes.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">3.3 Data Received from Third Parties</h3>
                    <p>From Stripe Inc.: transaction confirmation and tokenised payment instrument identifier. From Google Maps Platform: geolocation data about nautical facilities without personal data character. From OpenStreetMap (ODbL v1.0 licence): geographic data about nautical infrastructure.</p>
                  </div>
                </div>
              </div>

              {/* 4. LEGAL BASES AND PURPOSES */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">4. LEGAL BASES AND PURPOSES OF PROCESSING</h2>
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">4.1 Performance of Contract — Article 6(1)(b) GDPR</h3>
                    <p>Account creation and management; booking processing across all three service layers; payment and payout processing; sending booking confirmations and status updates; providing AI Captain service; resolving disputes between Customers and Providers; managing subscriptions and optional services.</p>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">4.2 Legal Obligation — Article 6(1)(c) GDPR</h3>
                    <p>Financial and accounting records under Czech Act No. 563/1991 Sb. and applicable tax law; anti-money laundering obligations under Czech Act No. 253/2008 Sb.; responding to lawful requests of courts and public authorities.</p>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">4.3 Legitimate Interest — Article 6(1)(f) GDPR</h3>
                    <p>Fraud prevention and Platform security; service quality improvement and new feature development through analysis of anonymised usage patterns; displaying personalised venue recommendations based on saved preferences; sending transactional notifications and satisfaction enquiries; displaying anonymised analytics data to Providers via dashboard.</p>
                    <p className="mt-2">The three-part test required by CJEU C-621/22 (KNLTB, 4 October 2024) and EDPB Guidelines 01/2024 on legitimate interests has been applied to each processing purpose listed above. You may object to processing based on legitimate interest at any time at privacy@mooring-booking.com.</p>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">4.4 Special Legal Basis — Layer 2 and Layer 3 Non-Partner Data</h3>
                    <p>Data about nautical facilities operated by legal entities in Layer 2 and Layer 3 is not personal data under GDPR. For natural persons operating small marinas, docks, buoy fields or anchorages whose publicly published business contact data appears in Layer 2 or Layer 3, the legal basis is legitimate interest under Article 6(1)(f) GDPR. The data processed is limited to what the operator themselves made publicly available for business purposes. Full details are contained in the GDPR Notice for Marina Operators available at mooring-booking.com/gdpr-notice.</p>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">4.5 Layer-Specific Data Processing Notes</h3>
                    <div className="space-y-3">
                      <p className="border-l-4 border-yellow-500 pl-4"><strong className="text-foreground">&#11088; Layer 1 — Premium Marinas:</strong> Full payment data processed; Stripe Connect split payments; dashboard analytics; booking confirmation with full contact disclosure. Stripe DPA governs payment data.</p>
                      <p className="border-l-4 border-blue-500 pl-4"><strong className="text-foreground">&#128309; Layer 2 — Concierge Booking:</strong> Stripe Authorize hold without capture; Customer contact data transmitted to facility only upon confirmation; facility contact data released to Customer only after Stripe Capture. Booking request data retained for 7 years.</p>
                      <p className="border-l-4 border-green-500 pl-4"><strong className="text-foreground">&#128506;&#65039; Layer 3 — Explore & Navigate:</strong> No transaction data processed. Location reference data only. Users' GPS queries processed in session context and not stored beyond 30 days unless user explicitly saves.</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">4.6 Consent — Article 6(1)(a) GDPR</h3>
                    <p>Marketing communications by email, SMS or push notification; optional analytics and marketing cookies described in the Cookie Policy; targeted advertising based on usage patterns. Consent may be withdrawn at any time without adverse consequences for use of core Platform services.</p>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">4.7 Business Transition Consent</h3>
                    <p>By accepting the Master Terms of Service v3.0, users expressly consent under Articles 6(1)(a) and 49(1)(a) GDPR to the transfer of personal data to any successor entity in any sale, merger, acquisition or change of ownership of the Company or Platform. The successor is bound by the same data protection obligations. Users will be notified within 30 days. Consent may be withdrawn at privacy@mooring-booking.com.</p>
                  </div>
                </div>
              </div>

              {/* 5. RECIPIENTS AND DATA SHARING */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">5. RECIPIENTS AND DATA SHARING</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p><strong className="text-foreground">5.1 Providers — Layer 1:</strong> Customer contact data (name, vessel contact, ETA, vessel dimensions) is shared with the relevant Premium Partner exclusively after a completed paid booking and exclusively to the extent necessary to fulfil that booking.</p>
                  <p><strong className="text-foreground">5.2 Providers — Layer 2:</strong> Customer booking request data (vessel name, length, draft, arrival date, nights, telephone) is transmitted to the Layer 2 facility as a structured booking request. Facility contact data is released to the Customer only after Stripe Capture confirms payment.</p>
                  <p><strong className="text-foreground">5.3 Data Processors:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Stripe Inc. (USA) — payment processing under DPA with Standard Contractual Clauses (SCC, Implementing Decision 2021/914).</li>
                    <li>Google LLC (USA) — Maps Platform services under Google Cloud DPA with SCC.</li>
                    <li>AI model provider — AI Captain language model under DPA with SCC.</li>
                    <li>Analytics providers — anonymised platform performance measurement.</li>
                  </ul>
                  <p><strong className="text-foreground">5.4 Public Authorities:</strong> Personal data is disclosed to public authorities, courts and regulators only when required by applicable law, a final court order, or a lawful request of a competent authority, and only to the extent legally prescribed.</p>
                  <p><strong className="text-foreground">5.5 Advertising Partners:</strong> Anonymised and aggregated usage pattern data may be shared with advertising partners exclusively with prior user consent as described in Section 4.6. Data shared does not contain direct identifiers.</p>
                  <p><strong className="text-foreground">5.6 What We Never Share:</strong> Card numbers, CVV codes or bank account numbers are never stored or shared. Passwords are stored exclusively in hashed form. Vessel GPS data is not shared with third parties in a form that identifies a specific vessel or user.</p>
                </div>
              </div>

              {/* 6. INTERNATIONAL DATA TRANSFERS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">6. INTERNATIONAL DATA TRANSFERS</h2>
                <p className="text-muted-foreground">Personal data of EU/EEA users is primarily stored on servers within the European Economic Area. Where processing is entrusted to processors based outside the EEA (Stripe, Google, AI providers), the Company ensures appropriate safeguards under Chapter V GDPR including Standard Contractual Clauses approved by Implementing Decision 2021/914, supplemented where applicable by Transfer Impact Assessments.</p>
              </div>

              {/* 7. RETENTION PERIODS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">7. RETENTION PERIODS</h2>
                <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground">
                  <ul className="space-y-2">
                    <li><strong className="text-foreground">Account data:</strong> for the duration of the active account and 7 years after closure for legal compliance.</li>
                    <li><strong className="text-foreground">Booking and transaction data:</strong> 7 years from booking date.</li>
                    <li><strong className="text-foreground">AI Captain conversations:</strong> 12 months in anonymised form.</li>
                    <li><strong className="text-foreground">GPS session data:</strong> 30 days from session end unless explicitly saved.</li>
                    <li><strong className="text-foreground">Marketing data:</strong> until consent withdrawal.</li>
                    <li><strong className="text-foreground">Dispute-related data:</strong> until final resolution.</li>
                  </ul>
                </div>
              </div>

              {/* 8. YOUR RIGHTS */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">8. YOUR RIGHTS</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>Under GDPR and applicable national law you have the following rights, exercisable free of charge at privacy@mooring-booking.com:</p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li><strong className="text-foreground">Right of access (Article 15):</strong> confirmation of processing and copy of personal data</li>
                    <li><strong className="text-foreground">Right to rectification (Article 16):</strong> correction of inaccurate or incomplete data</li>
                    <li><strong className="text-foreground">Right to erasure (Article 17):</strong> deletion where data is no longer necessary, consent withdrawn, or processing unlawful — subject to legal retention obligations</li>
                    <li><strong className="text-foreground">Right to restriction (Article 18):</strong> restriction of processing pending resolution of accuracy or lawfulness objection</li>
                    <li><strong className="text-foreground">Right to data portability (Article 20):</strong> receipt of data in structured machine-readable format</li>
                    <li><strong className="text-foreground">Right to object (Article 21):</strong> objection to processing based on legitimate interest, including direct marketing, resulting in immediate cessation</li>
                    <li><strong className="text-foreground">Right to withdraw consent:</strong> at any time without effect on prior lawful processing</li>
                    <li><strong className="text-foreground">Right to lodge a complaint:</strong> with the Czech Data Protection Authority ({"Úřad pro ochranu osobních údajů"}, uoou.cz) or the supervisory authority in your country of residence</li>
                  </ul>
                  <p>Requests will be responded to within one calendar month. Complex or multiple requests may be extended by a further two months with prior notice.</p>
                </div>
              </div>

              {/* 9. DATA SECURITY */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">9. DATA SECURITY</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>The Company implements technical and organisational measures proportionate to processing risk under Article 32 GDPR, including TLS 1.2+ encryption in transit, encryption of sensitive data at rest, least-privilege access controls, regular security audits and penetration testing, and breach detection and management procedures.</p>
                  <p>In the event of a personal data breach likely to result in high risk to your rights and freedoms, you will be notified without undue delay under Article 34 GDPR.</p>
                </div>
              </div>

              {/* 10. AI CAPTAIN */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">10. AI CAPTAIN — SPECIFIC PRIVACY NOTES</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>AI Captain is powered by large language model technology. Interactions may include vessel location, vessel characteristics and personal preferences voluntarily shared. These are processed to provide the service. Conversations are anonymised within 12 months. Personal data of third parties mentioned in queries is deleted upon anonymisation. Do not share sensitive personal data of third parties in AI Captain conversations.</p>
                  <p>AI Captain recommendations prioritise Layer 1 Premium Partner facilities. This prioritisation is commercially arranged and disclosed in Master Terms of Service v3.0, Section 8.4.</p>
                </div>
              </div>

              {/* 11-12. CHANGES AND GOVERNING LAW */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">11. CHANGES TO THIS POLICY</h2>
                <p className="text-muted-foreground mb-6">Material changes will be notified at least 30 days before taking effect by email and Platform notice. Continued use after the effective date constitutes acceptance. Archives of previous versions are available on request at privacy@mooring-booking.com.</p>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">12. GOVERNING LAW</h2>
                <p className="text-muted-foreground">These Privacy Policy are interpreted and applied in accordance with EU law, in particular GDPR, and Czech law including Act No. 110/2019 Sb. EU consumer residents retain all rights guaranteed by mandatory provisions of their country of residence.</p>
              </div>

              {/* 13. CONTACT */}
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">13. CONTACT</h2>
                <div className="text-muted-foreground space-y-2">
                  <p>Data controller: <strong className="text-foreground">Intelligent Matrix s.r.o.</strong></p>
                  <p>{"Štěpánská"} 37, 110 00 Praha 1, {"Česká republika"}</p>
                  <p>Data protection contact: <strong className="text-foreground">privacy@mooring-booking.com</strong></p>
                  <p>General contact: <strong className="text-foreground">info@mooring-booking.com</strong> | +420 739 328 337</p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center text-muted-foreground py-4">
                <p>Privacy Policy v2.0 — consistent with Master Terms of Service v3.0, Cookie Policy v2.0 and GDPR Notice for Marina Operators v2.0.</p>
                <p>&copy; Intelligent Matrix s.r.o. All rights reserved.</p>
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
