import { Suspense, lazy, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, Anchor, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const ContactMap = lazy(() => import("@/components/ContactMap"));

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const ContactPage = () => {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", subject: "", message: "",
  });
  const [touched, setTouched] = useState({
    firstName: false, lastName: false, email: false, subject: false, message: false,
  });

  const errors = {
    firstName: !form.firstName.trim() ? "First name is required." : "",
    lastName: !form.lastName.trim() ? "Last name is required." : "",
    email: !form.email.trim()
      ? "Email is required."
      : !isValidEmail(form.email)
        ? "Enter a valid email address."
        : "",
    subject: !form.subject ? "Please select a subject." : "",
    message: form.message.trim().length < 10 ? "Message must be at least 10 characters." : "",
  };

  const isFormValid = Object.values(errors).every(e => !e);

  const touch = (field: keyof typeof touched) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, subject: true, message: true });
    if (!isFormValid) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    setTouched({ firstName: false, lastName: false, email: false, subject: false, message: false });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute bottom-10 right-10 opacity-10 animate-float"><Anchor size={100} className="text-gold" /></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">{t('contact.heroTitle')}</h1>
              <p className="text-lg text-primary-foreground/80">{t('contact.heroSubtitle')}</p>
            </div>
          </div>
        </section>

        {/* Contact info + form */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact info */}
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
                      <p className="text-foreground">Intelligent Matrix</p>
                      <p className="text-muted-foreground text-sm">Vienna, Austria</p>
                      <p className="text-muted-foreground text-sm">Prague, Czech Republic</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Clock className="text-secondary" size={24} /></div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-1">{t('contact.businessHours')}</h3>
                      <p className="text-foreground">{t('contact.mondayFriday')}</p>
                      <p className="text-muted-foreground text-sm">9:00 AM – 6:00 PM (CET)</p>
                      <p className="text-foreground mt-2">{t('contact.saturday')}</p>
                      <p className="text-muted-foreground text-sm">10:00 AM – 2:00 PM (CET)</p>
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

              {/* Form */}
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{t('contact.sendMessage')}</h2>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <CheckCircle className="text-success" size={56} />
                    <h3 className="font-heading text-xl font-bold text-foreground">Message Sent!</h3>
                    <p className="text-muted-foreground">We've received your message and will reply within 24 hours.</p>
                    <Button variant="outline" onClick={resetForm}>Send Another Message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('contact.firstName')} *</label>
                        <Input
                          placeholder="John"
                          value={form.firstName}
                          onChange={set('firstName')}
                          onBlur={() => touch('firstName')}
                          className={touched.firstName && errors.firstName ? 'border-destructive' : ''}
                        />
                        {touched.firstName && errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('contact.lastName')} *</label>
                        <Input
                          placeholder="Smith"
                          value={form.lastName}
                          onChange={set('lastName')}
                          onBlur={() => touch('lastName')}
                          className={touched.lastName && errors.lastName ? 'border-destructive' : ''}
                        />
                        {touched.lastName && errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('contact.emailTitle')} *</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={set('email')}
                        onBlur={() => touch('email')}
                        className={touched.email && errors.email ? 'border-destructive' : ''}
                      />
                      {touched.email && errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('contact.phone')}</label>
                      <Input type="tel" placeholder="+43 667 446 4860" value={form.phone} onChange={set('phone')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('contact.subjectLabel')} *</label>
                      <Select value={form.subject} onValueChange={v => { setForm(p => ({ ...p, subject: v })); touch('subject'); }}>
                        <SelectTrigger className={touched.subject && errors.subject ? 'border-destructive' : ''}>
                          <SelectValue placeholder={t('contact.selectSubject')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking">{t('contact.bookingInquiry')}</SelectItem>
                          <SelectItem value="provider">{t('contact.becomeProvider')}</SelectItem>
                          <SelectItem value="affiliate">{t('contact.affiliateProgram')}</SelectItem>
                          <SelectItem value="support">{t('contact.technicalSupportForm')}</SelectItem>
                          <SelectItem value="partnership">{t('contact.businessPartnership')}</SelectItem>
                          <SelectItem value="press">{t('contact.pressMedia')}</SelectItem>
                          <SelectItem value="other">{t('contact.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {touched.subject && errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t('contact.messageLabel')} *</label>
                      <Textarea
                        placeholder={t('contact.messagePlaceholder')}
                        rows={5}
                        value={form.message}
                        onChange={set('message')}
                        onBlur={() => touch('message')}
                        className={touched.message && errors.message ? 'border-destructive' : ''}
                      />
                      {touched.message && errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-gradient-ocean font-semibold h-12" disabled={sending}>
                      {sending ? (
                        <span className="flex items-center gap-2 justify-center">
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> Sending…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 justify-center"><Send size={18} /> {t('contact.sendBtn')}</span>
                      )}
                    </Button>
                    <p className="text-muted-foreground text-xs text-center">{t('contact.formDisclaimer')}</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
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
