import { Suspense, lazy } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import { useTranslation } from "react-i18next";

const ContactMap = lazy(() => import("@/components/ContactMap"));

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute bottom-10 right-10 opacity-10 animate-float"><Anchor size={100} className="text-gold" /></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">{t('contact.heroTitle')}</h1>
              <p className="text-lg text-primary-foreground/80">{t('contact.heroSubtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-8">{t('contact.contactInfo')}</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Mail className="text-secondary" size={24} /></div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contact.emailTitle')}</h3>
                      <a href="mailto:info@mooring-booking.com" className="text-secondary hover:underline">info@mooring-booking.com</a>
                      <p className="text-muted-foreground text-sm mt-1">{t('contact.generalInquiries')}</p>
                      <a href="mailto:support@mooring-booking.com" className="text-secondary hover:underline block mt-2">support@mooring-booking.com</a>
                      <p className="text-muted-foreground text-sm mt-1">{t('contact.technicalSupport')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="text-secondary" size={24} /></div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contact.phoneTitle')}</h3>
                      <a href="tel:+436674464860" className="text-secondary hover:underline block">+43 667 446 4860</a>
                      <p className="text-muted-foreground text-sm mt-1">{t('contact.viennaOffice')}</p>
                      <a href="tel:+420739328337" className="text-secondary hover:underline block mt-2">+420 739 328 337</a>
                      <p className="text-muted-foreground text-sm mt-1">{t('contact.pragueOffice')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="text-secondary" size={24} /></div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contact.officesTitle')}</h3>
                      <p className="text-foreground">Mooring Booking.com</p>
                      <p className="text-muted-foreground text-sm">Vienna, Austria</p>
                      <p className="text-muted-foreground text-sm">Prague, Czech Republic</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Clock className="text-secondary" size={24} /></div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contact.businessHours')}</h3>
                      <p className="text-foreground">{t('contact.mondayFriday')}</p>
                      <p className="text-muted-foreground text-sm">9:00 AM - 6:00 PM (CET)</p>
                      <p className="text-foreground mt-2">{t('contact.saturday')}</p>
                      <p className="text-muted-foreground text-sm">10:00 AM - 2:00 PM (CET)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="font-heading font-semibold text-foreground mb-4">{t('contact.followUs')}</h3>
                  <div className="flex gap-4">
                    {['📘','📸','🐦','▶️'].map((e,i) => (
                      <a key={i} href="#" className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center hover:bg-secondary/20 transition-colors"><span className="text-xl">{e}</span></a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{t('contact.sendMessage')}</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-foreground mb-2">{t('contact.firstName')} *</label><Input placeholder="John" /></div>
                    <div><label className="block text-sm font-medium text-foreground mb-2">{t('contact.lastName')} *</label><Input placeholder="Doe" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-foreground mb-2">{t('contact.emailTitle')} *</label><Input type="email" placeholder="john@example.com" /></div>
                  <div><label className="block text-sm font-medium text-foreground mb-2">{t('contact.phone')}</label><Input type="tel" placeholder="+43 667 446 4860" /></div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('contact.subjectLabel')} *</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder={t('contact.selectSubject')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">{t('contact.bookingInquiry')}</SelectItem>
                        <SelectItem value="provider">{t('contact.becomeProvider')}</SelectItem>
                        <SelectItem value="affiliate">{t('contact.affiliateProgram')}</SelectItem>
                        <SelectItem value="support">{t('contact.technicalSupport')}</SelectItem>
                        <SelectItem value="partnership">{t('contact.businessPartnership')}</SelectItem>
                        <SelectItem value="press">{t('contact.pressMedia')}</SelectItem>
                        <SelectItem value="other">{t('contact.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><label className="block text-sm font-medium text-foreground mb-2">{t('contact.messageLabel')} *</label><Textarea placeholder={t('contact.messagePlaceholder')} rows={5} /></div>
                  <Button className="w-full bg-gradient-ocean font-semibold h-12"><Send className="mr-2" size={18} />{t('contact.sendBtn')}</Button>
                  <p className="text-muted-foreground text-xs text-center">{t('contact.formDisclaimer')}</p>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-4">{t('contact.ourOffices')}</h2>
            <p className="text-muted-foreground text-center mb-8">{t('contact.visitUs')}</p>
            <div className="max-w-4xl mx-auto">
              <MapErrorBoundary>
                <Suspense fallback={<div className="w-full h-[400px] rounded-xl overflow-hidden"><Skeleton className="w-full h-full" /></div>}>
                  <ContactMap />
                </Suspense>
              </MapErrorBoundary>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;