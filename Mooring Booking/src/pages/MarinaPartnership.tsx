import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Anchor, Building, Check, QrCode, Shield, Users, Star, Headphones, Globe, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const MarinaPartnershipPage = () => {
  const { t } = useTranslation();

  const partnerFeatures = [
    { icon: Star, title: t('marina.featuredTitle'), desc: t('marina.featuredDesc') },
    { icon: Globe, title: t('marina.whiteLabelTitle'), desc: t('marina.whiteLabelDesc') },
    { icon: Headphones, title: t('marina.prioritySupportTitle'), desc: t('marina.prioritySupportDesc') },
    { icon: Anchor, title: t('marina.directRentalTitle'), desc: t('marina.directRentalDesc') },
    { icon: Shield, title: t('marina.reducedCommissionTitle'), desc: t('marina.reducedCommissionDesc') },
    { icon: Users, title: t('marina.coMarketingTitle'), desc: t('marina.coMarketingDesc') },
  ];

  const pricingFeatures = [
    t('marina.featuredTitle'),
    t('marina.whiteLabelTitle'),
    t('marina.prioritySupportTitle'),
    t('marina.directRentalTitle'),
    t('marina.reducedCommissionTitle'),
    t('marina.coMarketingTitle'),
    t('pricing.analyticsDashboard', 'Custom analytics dashboard'),
    t('pricing.instantBooking', 'Free onboarding & setup'),
    t('pricing.customerMessaging', 'Bulk listing management'),
  ];

  const [formData, setFormData] = useState({
    marinaName: "", location: "", contactName: "", email: "", phone: "",
    numberOfBerths: "", currentSystem: "", website: "", whiteLabel: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof formData)[] = ['marinaName', 'location', 'contactName', 'email', 'phone', 'numberOfBerths'];
    for (const field of required) {
      if (!formData[field].trim()) {
        toast.error('Please fill in all required fields (*) before submitting.');
        return;
      }
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    if (!emailOk) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success(t('marina.submitSuccess', 'Partnership inquiry submitted! Our B2B team will contact you within 24 hours.'));
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-20 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 right-10 opacity-10 animate-float"><Building size={100} className="text-gold" /></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-6">
                <Building size={16} />
                <span className="text-sm font-medium">{t('marina.badge')}</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                {t('marina.heroTitle')}
                <span className="block text-gold">{t('marina.heroHighlight')}</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">{t('marina.heroSubtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">{t('marina.benefitsTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {partnerFeatures.map((f) => (
                <div key={f.title} className="bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-shadow">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4"><f.icon className="text-secondary" size={28} /></div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-lg mx-auto bg-card rounded-2xl p-8 shadow-hover ring-2 ring-gold">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-4">
                <Star size={16} /><span className="text-sm font-medium">{t('marina.b2bPlan')}</span>
              </div>
              <div className="font-heading text-5xl font-bold text-primary mb-2">€99<span className="text-2xl text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground mb-6">{t('marina.allInclusive')}</p>
              <ul className="space-y-3 text-left mb-8">
                {pricingFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground"><Check className="text-success flex-shrink-0" size={16} /> {f}</li>
                ))}
              </ul>
              <a href="#partnership-form">
                <Button size="lg" className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold h-14">{t('marina.applyPartnership')}</Button>
              </a>
            </div>
          </div>
        </section>

        <section id="partnership-form" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-4">{t('marina.applicationTitle')}</h2>
              <p className="text-muted-foreground text-center mb-8">{t('marina.applicationSubtitle')}</p>
              <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl p-8 shadow-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><Label>{t('marina.marinaName')} *</Label><Input required placeholder="e.g., ACI Marina Split" value={formData.marinaName} onChange={e => setFormData(p => ({...p, marinaName: e.target.value}))} className="mt-2" /></div>
                  <div><Label>{t('marina.location')} *</Label><Input required placeholder="City, Country" value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))} className="mt-2" /></div>
                  <div><Label>{t('marina.contactPerson')} *</Label><Input required placeholder="Full name" value={formData.contactName} onChange={e => setFormData(p => ({...p, contactName: e.target.value}))} className="mt-2" /></div>
                  <div><Label>{t('marina.email')} *</Label><Input required type="email" placeholder="marina@example.com" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="mt-2" /></div>
                  <div><Label>{t('marina.phone')} *</Label><Input required type="tel" placeholder="+385 21 123 456" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="mt-2" /></div>
                  <div><Label>{t('marina.numberOfBerths')} *</Label><Input required type="number" placeholder="e.g., 250" value={formData.numberOfBerths} onChange={e => setFormData(p => ({...p, numberOfBerths: e.target.value}))} className="mt-2" /></div>
                  <div><Label>{t('marina.currentSystem')}</Label><Input placeholder="e.g., Manual, Custom software" value={formData.currentSystem} onChange={e => setFormData(p => ({...p, currentSystem: e.target.value}))} className="mt-2" /></div>
                  <div><Label>{t('marina.website')}</Label><Input placeholder="https://marina.com" value={formData.website} onChange={e => setFormData(p => ({...p, website: e.target.value}))} className="mt-2" /></div>
                </div>
                <div>
                  <Label>{t('marina.whiteLabelInterest')}</Label>
                  <Select value={formData.whiteLabel} onValueChange={v => setFormData(p => ({...p, whiteLabel: v}))}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('marina.yesInterested')}</SelectItem>
                      <SelectItem value="maybe">{t('marina.maybeInterested')}</SelectItem>
                      <SelectItem value="no">{t('marina.notInterested')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('marina.additionalMessage')}</Label>
                  <Textarea placeholder={t('marina.messagePlaceholder', 'Tell us about your marina and what you\'re looking for...')} value={formData.message} onChange={e => setFormData(p => ({...p, message: e.target.value}))} className="mt-2 min-h-[100px]" />
                </div>
                <Button type="submit" className="w-full bg-gradient-ocean font-semibold h-12">
                  <Send className="mr-2" size={18} />{t('marina.submitApplication')}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MarinaPartnershipPage;
