import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Anchor, Check, TrendingUp, Shield, QrCode, Users, ArrowRight, Star,
  MapPin, Upload, Calendar, CreditCard, FileText, Camera, X, Snowflake,
  MessageSquare, Crown, Megaphone, Phone as PhoneIcon, Zap, ShieldCheck, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import MonthlyCalendar, { CalendarDay } from "@/components/MonthlyCalendar";
import AdBanner from "@/components/AdBanner";
import CoordinatePickerMap from "@/components/provider/CoordinatePickerMap";

const countries = [
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
];

const amenities = [
  { id: "water", label: "Fresh Water", icon: "💧" },
  { id: "electricity", label: "Electricity", icon: "⚡" },
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "toilet", label: "Toilet", icon: "🚽" },
  { id: "shower", label: "Shower", icon: "🚿" },
  { id: "fuel", label: "Fuel", icon: "⛽" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
];

const paymentMethods = [
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "maestro", label: "Maestro", icon: "💳" },
  { id: "visa", label: "Visa/Mastercard", icon: "💳" },
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "googlepay", label: "Google Pay", icon: "📱" },
];

const winterServices = [
  { id: "winterization", label: "Winterization", icon: "🔧" },
  { id: "hull_cleaning", label: "Hull Cleaning", icon: "🧹" },
  { id: "mast_storage", label: "Mast Storage", icon: "🏗️" },
  { id: "electricity_winter", label: "Electricity", icon: "⚡" },
  { id: "water_winter", label: "Water", icon: "💧" },
  { id: "security", label: "24/7 Security", icon: "🔒" },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Your Income",
    description: "Providers report 300% average revenue increase. Your unused mooring is worth money.",
    stat: "€5,000+",
    statLabel: "Avg. annual earnings"
  },
  {
    icon: Shield,
    title: "Simple & Transparent",
    description: "Only 15% commission on successful bookings. No upfront costs, no hidden fees.",
    stat: "15%",
    statLabel: "Fair commission"
  },
  {
    icon: Megaphone,
    title: "Marketing Tools",
    description: "Get your unique QR code and affiliate link. Share on social media and earn more.",
    stat: "€5/mo",
    statLabel: "Marketing kit"
  },
  {
    icon: Users,
    title: "Join 10,000+ Providers",
    description: "Be part of the Mediterranean's largest mooring community. Support included.",
    stat: "10,000+",
    statLabel: "Active providers"
  },
];

const testimonials = [
  {
    quote: "I was skeptical at first, but Mooring Booking changed everything. My private buoy now brings in €6,000 extra per season!",
    author: "Marko K.",
    location: "Dubrovnik, Croatia",
    earnings: "€6,200/season",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    quote: "The platform is so easy to use. I listed my dock in 10 minutes and had my first booking within 2 days.",
    author: "Giuseppe R.",
    location: "Portofino, Italy",
    earnings: "€4,800/season",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  },
  {
    quote: "Finally a fair alternative to giving my mooring away for nothing to friends. Now I get paid properly.",
    author: "Elena P.",
    location: "Santorini, Greece",
    earnings: "€3,500/season",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    quote: "My marina berth was sitting empty 6 months a year. Now I earn €15,000+ annually from bookings I never expected!",
    author: "Luka M.",
    location: "Dubrovnik, Croatia",
    earnings: "€15,400/year",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
  },
  {
    quote: "50% of my income now comes from Mooring Booking. The QR code feature makes it so easy for walk-in sailors!",
    author: "Dimitris K.",
    location: "Mykonos, Greece",
    earnings: "€25,000/season",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop"
  },
  {
    quote: "I have 3 private buoys and earn more from them than my regular job. Mooring Booking made this possible!",
    author: "Marco T.",
    location: "Amalfi, Italy",
    earnings: "€18,500/season",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop"
  },
];

const generateCalendarDays = (): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const startDate = new Date(2026, 0, 1);
  const endDate = new Date(2026, 11, 31);
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push({
      date: new Date(currentDate),
      available: Math.random() > 0.2,
      customPrice: undefined,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};

const ProviderMiniHeader = ({ mooringCount }: { mooringCount: number }) => (
  <div className="bg-gradient-ocean py-4 px-6">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Anchor size={28} className="text-gold" />
        <span className="text-primary-foreground font-heading font-bold text-lg">Mooring Booking</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
          <MapPin size={16} className="text-gold" />
          <span className="text-primary-foreground text-sm">
            <strong className="text-gold">{mooringCount}</strong> {mooringCount === 1 ? 'vez postavljen' : 'vezova postavljeno'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const BecomeProviderPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [mooringCount, setMooringCount] = useState(0);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [formData, setFormData] = useState({
    mooringName: "",
    country: "",
    region: "",
    latitude: "",
    longitude: "",
    description: "",
    concessionNumber: "",
    windProtection: "good",
    amenities: [] as string[],
    maxBoatLength: "",
    maxDraft: "",
    pricePerNight: "",
    discount: [10],
    paymentMethods: [] as string[],
    photos: [] as File[],
    address: "",
    phone: "",
    whatsapp: "",
    winterStorage: false,
    winterStorageType: "wet" as "wet" | "dry" | "both",
    winterPriceMonthly: "",
    winterServices: [] as string[],
    marketingTools: false,
    premiumListing: false,
    insuranceMediation: false,
    now4today: false,
    mooringUnits: "1",
  });
  const [declarations, setDeclarations] = useState({
    ownership: false,
    commission: false,
    terms: false,
    dataTransfer: false,
  });
  const [calendarDays, setCalendarDays] = useState(generateCalendarDays());

  const toggleAmenity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  const togglePayment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(id)
        ? prev.paymentMethods.filter(p => p !== id)
        : [...prev.paymentMethods, id]
    }));
  };

  const toggleWinterService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      winterServices: prev.winterServices.includes(id)
        ? prev.winterServices.filter(s => s !== id)
        : [...prev.winterServices, id]
    }));
  };

  const toggleCalendarDay = (index: number) => {
    setCalendarDays(prev => prev.map((day, i) =>
      i === index ? { ...day, available: !day.available } : day
    ));
  };

  const handleDayPriceChange = (index: number, price: number) => {
    setCalendarDays(prev => prev.map((day, i) =>
      i === index ? { ...day, customPrice: price > 0 ? price : undefined } : day
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer) return;
    setShowConsent(true);
  };

  const uploadPhotos = useCallback(async (): Promise<string[]> => {
    if (formData.photos.length === 0) return [];
    setUploadingPhotos(true);
    const urls: string[] = [];
    try {
      for (const file of formData.photos) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage
          .from('mooring-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from('mooring-images')
          .getPublicUrl(filePath);
        urls.push(urlData.publicUrl);
      }
    } finally {
      setUploadingPhotos(false);
    }
    return urls;
  }, [formData.photos, user]);

  const handleFinalConsent = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // 1. Upload photos
      const imageUrls = await uploadPhotos();

      // 2. Prepare availability (only blocked days and custom-priced days)
      const availability = calendarDays
        .filter(day => !day.available || (day.customPrice && day.customPrice > 0))
        .map(day => ({
          date: day.date.toISOString().split('T')[0],
          available: day.available,
          custom_price: day.customPrice || 0,
        }));

      // 3. Call RPC
      const { data, error } = await supabase.rpc('publish_provider_profile', {
        p_mooring_name: formData.mooringName,
        p_country: formData.country,
        p_region: formData.region,
        p_latitude: parseFloat(formData.latitude),
        p_longitude: parseFloat(formData.longitude),
        p_description: formData.description,
        p_wind_protection: formData.windProtection,
        p_amenities: formData.amenities,
        p_max_boat_length: parseFloat(formData.maxBoatLength) || 0,
        p_max_draft: parseFloat(formData.maxDraft) || 0,
        p_mooring_units: parseInt(formData.mooringUnits) || 1,
        p_price_per_night: parseFloat(formData.pricePerNight) || 0,
        p_discount_percent: formData.discount[0],
        p_payment_methods: formData.paymentMethods,
        p_now4today: formData.now4today,
        p_winter_storage: formData.winterStorage,
        p_winter_storage_type: formData.winterStorageType,
        p_winter_price_monthly: parseFloat(formData.winterPriceMonthly) || 0,
        p_winter_services: formData.winterServices,
        p_marketing_tools: formData.marketingTools,
        p_premium_listing: formData.premiumListing,
        p_insurance_mediation: formData.insuranceMediation,
        p_image_urls: imageUrls,
        p_address: formData.address,
        p_phone: formData.phone,
        p_whatsapp: formData.whatsapp,
        p_availability: availability,
      });

      if (error) throw error;

      setConsentAccepted(false);
      setShowConsent(false);
      setShowForm(false);
      setJustSubmitted(true);
      setMooringCount(prev => prev + 1);
      // Reset form for adding another mooring
      setFormData({
        mooringName: "", country: "", region: "", latitude: "", longitude: "",
        description: "", concessionNumber: "", windProtection: "good",
        amenities: [], maxBoatLength: "", maxDraft: "", pricePerNight: "",
        discount: [10], paymentMethods: [], photos: [],
        address: "", phone: "", whatsapp: "",
        winterStorage: false, winterStorageType: "wet",
        winterPriceMonthly: "", winterServices: [],
        marketingTools: false, premiumListing: false,
        insuranceMediation: false, now4today: false, mooringUnits: "1",
      });
      setDeclarations({ ownership: false, commission: false, terms: false, data: false, winterResponsibility: false });
      setPhotoPreviews([]);
      setCalendarDays(generateCalendarDays());
      toast({
        title: "✅ Vez objavljen!",
        description: "Vaš vez je sada na pregledu. Obavijestit ćemo vas kad bude odobren.",
      });
    } catch (err: any) {
      console.error('Publish error:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to publish profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [leadFormData, setLeadFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    has_mooring: false,
    mooring_type: "",
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const mooringTypes = [
    { id: "vez_u_marini", label: "Vez u marini / Marina berth", icon: "⚓" },
    { id: "privatna_bova", label: "Privatna bova / Private buoy", icon: "🔴" },
    { id: "privatni_dok", label: "Privatni dok / Private dock", icon: "🏗️" },
    { id: "sidriste", label: "Sidrište / Anchorage", icon: "⛵" },
    { id: "obalni_vez", label: "Obalni vez / Shore mooring", icon: "🪢" },
  ];

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://bblxawscmyzelinidkmb.supabase.co'}/functions/v1/process-fb-lead`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...leadFormData,
            fb_campaign_name: 'Website Lead Form',
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setLeadSubmitted(true);
        toast({
          title: "✅ Prijava uspješna!",
          description: "Provjerite email za link za pristup.",
        });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err: any) {
      toast({
        title: "Greška",
        description: err.message || "Nešto je pošlo po zlu. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setLeadSubmitting(false);
    }
  };

  const monthlyAddOnCost = (formData.marketingTools ? 5 : 0) + (formData.premiumListing ? 9.99 : 0);
  const yearlyAddOnCost = formData.insuranceMediation ? 9.99 : 0;

  // Lead submitted success screen
  if (leadSubmitted && !user) {
    return (
      <div className="min-h-screen">
        <main>
          <section className="min-h-screen flex items-center justify-center bg-gradient-ocean relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-lg mx-auto text-center">
                <div className="mb-8">
                  <Anchor size={40} className="text-gold mx-auto mb-2" />
                  <span className="text-primary-foreground/60 text-sm font-medium">Mooring Booking</span>
                </div>
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="text-gold" size={40} />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Prijava uspješna! 🎉
                </h1>
                <p className="text-primary-foreground/80 text-lg mb-6">
                  Poslali smo vam email na <strong className="text-gold">{leadFormData.email}</strong> s linkom za pristup.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left mb-8">
                  <p className="text-primary-foreground font-medium mb-3">Sljedeći koraci:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-gold text-gold-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">1</span>
                      <span className="text-primary-foreground/80">Otvorite email i kliknite na link</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-gold text-gold-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">2</span>
                      <span className="text-primary-foreground/80">Dodajte slike i detalje o vezu</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-gold text-gold-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">3</span>
                      <span className="text-primary-foreground/80">Počnite primati rezervacije!</span>
                    </div>
                  </div>
                </div>
                <p className="text-primary-foreground/60 text-sm">
                  Niste primili email? Provjerite spam folder ili <a href="mailto:support@mooring-booking.com" className="text-gold hover:underline">kontaktirajte nas</a>.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!showForm && !user) {
    // Unauthenticated user — show lead capture form
    return (
      <div className="min-h-screen">
        <main>
          {/* Hero with Lead Form */}
          <section className="py-16 bg-gradient-ocean relative overflow-hidden">
            <div className="absolute top-10 left-10 opacity-10 animate-float">
              <Anchor size={100} className="text-gold" />
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                {/* Left - Text */}
                <div>
                  <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full mb-6">
                    <Star size={16} />
                    <span className="text-sm font-medium">Join 10,000+ Providers</span>
                  </div>
                  <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                    {t('providerCta.title')}
                    <span className="block text-gold">{t('providerCta.titleHighlight')}</span>
                  </h1>
                  <p className="text-lg text-primary-foreground/80 mb-8">
                    {t('providerCta.subtitle')}
                  </p>
                  <div className="space-y-3 text-primary-foreground/90">
                    <div className="flex items-center gap-3">
                      <Check className="text-gold flex-shrink-0" size={20} />
                      <span>Besplatno listanje — bez pretplate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="text-gold flex-shrink-0" size={20} />
                      <span>85% zarade je vaše (samo 15% komisija)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="text-gold flex-shrink-0" size={20} />
                      <span>Pomorci iz 11 mediteranskih zemalja</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="text-gold flex-shrink-0" size={20} />
                      <span>Prosječna zarada: €5.000+ po sezoni</span>
                    </div>
                  </div>
                </div>

                {/* Right - Lead Form */}
                <div className="bg-card rounded-2xl p-8 shadow-hover">
                  <div className="text-center mb-6">
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                      Registrirajte se besplatno
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Popunite formu i dobit ćete pristup na email
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="lead_name">Ime i prezime *</Label>
                      <div className="relative mt-1">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="lead_name"
                          placeholder="Ivan Horvat"
                          value={leadFormData.full_name}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="lead_email">Email adresa *</Label>
                      <div className="relative mt-1">
                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="lead_email"
                          type="email"
                          placeholder="ivan@email.com"
                          value={leadFormData.email}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="lead_phone">Telefon *</Label>
                      <div className="relative mt-1">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="lead_phone"
                          type="tel"
                          placeholder="+385 91 234 5678"
                          value={leadFormData.phone}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lead_city">Grad *</Label>
                        <Input
                          id="lead_city"
                          placeholder="Split"
                          value={leadFormData.city}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label>Država *</Label>
                        <Select
                          value={leadFormData.country}
                          onValueChange={(value) => setLeadFormData(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Izaberite" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.flag} {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Tip veza *</Label>
                      <Select
                        value={leadFormData.mooring_type}
                        onValueChange={(value) => setLeadFormData(prev => ({ ...prev, mooring_type: value, has_mooring: true }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Izaberite tip veza" />
                        </SelectTrigger>
                        <SelectContent>
                          {mooringTypes.map((mt) => (
                            <SelectItem key={mt.id} value={mt.id}>
                              {mt.icon} {mt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Checkbox
                        id="lead_has_mooring"
                        checked={leadFormData.has_mooring}
                        onCheckedChange={(checked) => setLeadFormData(prev => ({ ...prev, has_mooring: checked as boolean }))}
                      />
                      <Label htmlFor="lead_has_mooring" className="text-sm cursor-pointer">
                        Trenutno imam vez koji želim iznajmljivati
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg"
                      disabled={leadSubmitting}
                    >
                      {leadSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                          Šaljem...
                        </>
                      ) : (
                        <>
                          🚀 Registrirajte se besplatno
                          <ArrowRight className="ml-2" size={20} />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Besplatno · Bez kreditne kartice · 15% komisija samo na rezervacije
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    );
  }

  if (!showForm && user) {
    // Authenticated user — show success or prompt to add mooring
    return (
      <div className="min-h-screen bg-muted">
        <ProviderMiniHeader mooringCount={mooringCount} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {justSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-600" size={32} />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                    Vez uspješno objavljen! 🎉
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    Vaš vez je sada na pregledu. Obavijestit ćemo vas kad bude odobren.
                  </p>
                  <p className="text-sm text-green-700 font-medium">
                    Ukupno vezova: {mooringCount}
                  </p>
                </div>
              )}

              <div className="bg-card rounded-2xl p-8 shadow-hover text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Anchor className="text-gold" size={32} />
                </div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {justSubmitted ? 'Dodajte još jedan vez' : 'Dodajte vaš vez'}
                </h1>
                <p className="text-muted-foreground mb-8">
                  {justSubmitted
                    ? 'Imate više vezova? Dodajte ih sve i povećajte zaradu!'
                    : 'Popunite podatke o vašem vezu i počnite zarađivati. Besplatno, bez rizika.'
                  }
                </p>

                <div className="space-y-3 text-left mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="text-gold flex-shrink-0" size={18} />
                    <span>Besplatno listanje — bez pretplate</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="text-gold flex-shrink-0" size={18} />
                    <span>85% zarade je vaše (samo 15% komisija)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="text-gold flex-shrink-0" size={18} />
                    <span>Pomorci iz 11 mediteranskih zemalja</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14"
                  onClick={() => { setShowForm(true); setJustSubmitted(false); }}
                >
                  {justSubmitted ? '➕ Dodaj još jedan vez' : '⚓ Dodaj vez'}
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Digital Consent Modal
  if (showConsent) {
    return (
      <div className="min-h-screen bg-muted">
        <ProviderMiniHeader mooringCount={mooringCount} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-2xl p-8 shadow-hover">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-secondary" size={32} />
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                    Digital Consent Agreement
                  </h1>
                  <p className="text-muted-foreground">
                    {t('provider.reviewTerms')}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-muted rounded-lg p-4 text-sm text-foreground leading-relaxed max-h-60 overflow-y-auto">
                    <h3 className="font-semibold mb-2">{t('provider.consentSummaryTitle')}</h3>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                      <li>{t('provider.consentTerm1')}</li>
                      <li>{t('provider.consentTerm2')}</li>
                      <li>{t('provider.consentTerm3')}</li>
                      <li>{t('provider.consentTerm4')}</li>
                      <li>{t('provider.consentTerm5')}</li>
                      <li>{t('provider.consentTerm6')}</li>
                      <li>{t('provider.consentTerm7')}</li>
                      <li>{t('provider.consentTerm8')}</li>
                      {formData.marketingTools && <li>{t('provider.consentTermMarketing')}</li>}
                      {formData.premiumListing && <li>{t('provider.consentTermPremium')}</li>}
                      {formData.insuranceMediation && <li>{t('provider.consentTermInsurance')}</li>}
                      {formData.now4today && <li>{t('provider.consentTermNow4Today')}</li>}
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gold/10 rounded-lg border border-gold/20">
                    <Checkbox
                      id="finalConsent"
                      checked={consentAccepted}
                      onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                    />
                    <Label htmlFor="finalConsent" className="text-sm leading-relaxed cursor-pointer font-medium">
                      {t('provider.consentRequired')}
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowConsent(false); setConsentAccepted(false); }}
                  >
                    {t('provider.backToEdit')}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-ocean font-semibold h-12"
                    disabled={!consentAccepted || isSubmitting}
                    onClick={handleFinalConsent}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                        {uploadingPhotos ? t('provider.uploadingPhotos') : t('provider.publishing')}
                      </>
                    ) : (
                      <>
                        <Check className="mr-2" size={20} />
                        {t('provider.acceptPublish')}
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {t('provider.eIdas')}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen bg-muted">
      <ProviderMiniHeader mooringCount={mooringCount} />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Form Header */}
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('provider.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('provider.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Anchor className="text-secondary" size={24} />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="mooringName">{t('provider.mooringName')} *</Label>
                    <Input
                      id="mooringName"
                      placeholder={t('provider.mooringNamePlaceholder')}
                      value={formData.mooringName}
                      onChange={(e) => setFormData(prev => ({ ...prev, mooringName: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="concessionNumber">{t('provider.concessionNumber')} *</Label>
                    <Input
                      id="concessionNumber"
                      placeholder={t('provider.concessionNumberPlaceholder')}
                      value={formData.concessionNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, concessionNumber: e.target.value }))}
                      className="mt-2"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('provider.concessionNumberDesc')}</p>
                  </div>
                  <div>
                    <Label>{t('provider.country')} *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('provider.selectCountry')} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="region">{t('provider.region')} *</Label>
                    <Input
                      id="region"
                      placeholder={t('provider.regionPlaceholder')}
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <MapPin size={16} className="text-secondary" />
                      {t('provider.coordinates')} *
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-2 mb-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                        <Input
                          placeholder="e.g. 43.5081"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          required
                          type="number"
                          step="0.000001"
                          min="-90"
                          max="90"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                        <Input
                          placeholder="e.g. 16.4402"
                          value={formData.longitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                          required
                          type="number"
                          step="0.000001"
                          min="-180"
                          max="180"
                        />
                      </div>
                    </div>
                    <CoordinatePickerMap
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onCoordinatesChange={(lat, lng) =>
                        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
                      }
                    />
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        📍 <span className="font-mono">{parseFloat(formData.latitude).toFixed(6)}°N, {parseFloat(formData.longitude).toFixed(6)}°E</span>
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">{t('provider.description')} *</Label>
                    <Textarea
                      id="description"
                      placeholder={t('provider.descriptionPlaceholder')}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-2 min-h-[120px]"
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/500 {t('provider.charCount')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mooring Details */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Shield className="text-secondary" size={24} />
                  Mooring Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>{t('provider.windProtection')} *</Label>
                    <Select
                      value={formData.windProtection}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, windProtection: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">🛡️ {t('provider.excellent')}</SelectItem>
                        <SelectItem value="good">✅ {t('provider.good')}</SelectItem>
                        <SelectItem value="moderate">⚠️ {t('provider.moderate')}</SelectItem>
                        <SelectItem value="poor">❌ {t('provider.poor')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxBoatLength">{t('provider.maxBoatLength')} *</Label>
                    <Input
                      id="maxBoatLength"
                      type="number"
                      placeholder="15"
                      value={formData.maxBoatLength}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxBoatLength: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDraft">{t('provider.maxDraft')} *</Label>
                    <Input
                      id="maxDraft"
                      type="number"
                      step="0.1"
                      placeholder="3.5"
                      value={formData.maxDraft}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDraft: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mooringUnits">{t('provider.mooringUnits')}</Label>
                    <Select
                      value={formData.mooringUnits}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, mooringUnits: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="1" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('provider.mooringUnitsDesc')}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>{t('provider.amenities')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {amenities.map((amenity) => (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.amenities.includes(amenity.id)
                            ? "bg-secondary/10 border-secondary text-secondary"
                            : "bg-muted border-border text-muted-foreground hover:border-secondary/50"
                            }`}
                        >
                          <span>{amenity.icon}</span>
                          <span className="text-sm font-medium">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Winter Storage */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Snowflake className="text-secondary" size={24} />
                  {t('provider.winterBerth')}
                </h2>
                <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">{t('provider.offerWinterStorage')}</Label>
                    <p className="text-sm text-muted-foreground">{t('provider.winterSeason')}</p>
                  </div>
                  <Switch
                    checked={formData.winterStorage}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, winterStorage: checked }))}
                  />
                </div>
                {formData.winterStorage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>{t('provider.winterStorageType')} *</Label>
                      <Select
                        value={formData.winterStorageType}
                        onValueChange={(value: "wet" | "dry" | "both") => setFormData(prev => ({ ...prev, winterStorageType: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wet">🌊 {t('provider.wetStorage')}</SelectItem>
                          <SelectItem value="dry">🏗️ {t('provider.dryStorage')}</SelectItem>
                          <SelectItem value="both">🔄 {t('provider.bothStorage')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="winterPrice">{t('provider.winterPriceMonthly')} *</Label>
                      <Input
                        id="winterPrice"
                        type="number"
                        placeholder="250"
                        value={formData.winterPriceMonthly}
                        onChange={(e) => setFormData(prev => ({ ...prev, winterPriceMonthly: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>{t('provider.winterServices')}</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        {winterServices.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => toggleWinterService(service.id)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.winterServices.includes(service.id)
                              ? "bg-secondary/10 border-secondary text-secondary"
                              : "bg-muted border-border text-muted-foreground hover:border-secondary/50"
                              }`}
                          >
                            <span>{service.icon}</span>
                            <span className="text-sm font-medium">{service.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="text-secondary" size={24} />
                  {t('provider.pricingPayment')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pricePerNight">{t('provider.pricePerNight')} *</Label>
                    <Input
                      id="pricePerNight"
                      type="number"
                      placeholder="45"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label>{t('provider.discount')}: {formData.discount[0]}%</Label>
                    <Slider
                      value={formData.discount}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, discount: value }))}
                      min={0}
                      max={50}
                      step={5}
                      className="mt-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>0%</span>
                      <span>10%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Now4Today */}
                  <div className="md:col-span-2">
                    <div className={`p-4 rounded-lg border-2 transition-all ${formData.now4today ? 'border-orange-500 bg-orange-500/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <Zap className="text-orange-500" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              Now4Today
                              <span className="text-xs bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full">{t('provider.now4todaySurcharge')}</span>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t('provider.now4todayDesc')}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.now4today}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, now4today: checked }))}
                        />
                      </div>
                      {formData.now4today && formData.pricePerNight && (
                        <div className="mt-3 bg-orange-500/10 rounded-lg p-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('provider.basePrice')}:</span>
                            <span className="text-foreground">€{formData.pricePerNight}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-orange-600">{t('provider.now4todayPrice')}:</span>
                            <span className="text-orange-600">€{(parseFloat(formData.pricePerNight) * 1.2).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            ⚡ {t('provider.now4todayAvailable')} €{(parseFloat(formData.pricePerNight) * 1.2).toFixed(2)}.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>{t('provider.paymentMethods')} *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => togglePayment(method.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.paymentMethods.includes(method.id)
                            ? "bg-secondary/10 border-secondary text-secondary"
                            : "bg-muted border-border text-muted-foreground hover:border-secondary/50"
                            }`}
                        >
                          <span>{method.icon}</span>
                          <span className="text-sm font-medium">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Paid Add-Ons — hidden for new providers until they have moorings */}
              {false && <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Crown className="text-gold" size={24} />
                  {t('provider.premiumAddOns')}
                </h2>
                <div className="space-y-4">
                  {/* Marketing Tools */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${formData.marketingTools ? 'border-gold bg-gold/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                          <Megaphone className="text-gold" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{t('provider.marketingTools')}</h3>
                          <p className="text-sm text-muted-foreground">{t('provider.marketingToolsDesc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-lg text-gold">€5<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                        <Switch
                          checked={formData.marketingTools}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingTools: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Premium Listing */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${formData.premiumListing ? 'border-gold bg-gold/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                          <Crown className="text-gold" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{t('provider.premiumListing')}</h3>
                          <p className="text-sm text-muted-foreground">{t('provider.premiumListingDesc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-lg text-gold">€9.99<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                        <Switch
                          checked={formData.premiumListing}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, premiumListing: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insurance Mediation */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${formData.insuranceMediation ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="text-emerald-500" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{t('provider.mooringInsurance')}</h3>
                          <p className="text-sm text-muted-foreground">{t('provider.mooringInsuranceDesc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-lg text-emerald-500">€9.99<span className="text-sm font-normal text-muted-foreground">/yr</span></span>
                        <Switch
                          checked={formData.insuranceMediation}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, insuranceMediation: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {monthlyAddOnCost > 0 && (
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <span className="text-sm text-muted-foreground">{t('provider.monthlyAddOnTotal')}: </span>
                      <span className="font-heading font-bold text-foreground">€{monthlyAddOnCost.toFixed(2)}/mo</span>
                    </div>
                  )}
                  {yearlyAddOnCost > 0 && (
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <span className="text-sm text-muted-foreground">{t('provider.yearlyAddOnTotal')}: </span>
                      <span className="font-heading font-bold text-foreground">€{yearlyAddOnCost.toFixed(2)}/yr</span>
                    </div>
                  )}

                  {/* Active Services Summary */}
                  {(formData.marketingTools || formData.premiumListing || formData.insuranceMediation) && (
                    <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <BarChart3 size={16} className="text-secondary" />
                        {t('provider.activePromotions')}
                      </h4>
                      <div className="space-y-2">
                        {formData.marketingTools && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Check size={14} className="text-success" />
                              <span className="text-foreground">{t('provider.marketingToolsActive')}</span>
                            </span>
                            <span className="text-muted-foreground">€5/mo • {t('provider.active')}</span>
                          </div>
                        )}
                        {formData.premiumListing && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Check size={14} className="text-success" />
                              <span className="text-foreground">{t('provider.premiumListingActive')}</span>
                            </span>
                            <span className="text-muted-foreground">€9.99/mo • {t('provider.active')}</span>
                          </div>
                        )}
                        {formData.insuranceMediation && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Check size={14} className="text-success" />
                              <span className="text-foreground">{t('provider.mooringInsuranceActive')}</span>
                            </span>
                            <span className="text-muted-foreground">€9.99/yr • {t('provider.active')}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
                        {t('provider.servicesBillingNote')}
                      </p>
                    </div>
                  )}
                </div>
              </div>}

              {/* Stripe Integration — hidden for new providers */}
              {false && <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="text-secondary" size={24} />
                  {t('provider.stripeIntegration')}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('provider.stripeDesc')} {t('provider.stripePayoutsNote')}
                </p>
                <div className="space-y-4">
                  <div>
                    <Label>{t('provider.stripeAccountId')}</Label>
                    <Input
                      placeholder="acct_xxxxxxxxxx"
                      className="mt-2"
                    />
                  </div>
                  <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                    <CreditCard className="mr-2" size={18} />
                    {t('provider.connectStripe')}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t('provider.noStripeAccount')} <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">{t('provider.createStripeFree')}</a>
                  </p>
                </div>
              </div>}

              {/* Photos */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Camera className="text-secondary" size={24} />
                  {t('provider.uploadPhotos')}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">{t('provider.uploadPhotosDesc')}</p>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary/50 transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Upload className="mx-auto text-muted-foreground mb-4" size={40} />
                  <p className="text-muted-foreground">{t('provider.dragDrop')}</p>
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
                    }}
                  />
                </div>
                {formData.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                    {formData.photos.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ad Banner */}
              <AdBanner position="inline" size="medium" />

              {/* Calendar */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Calendar className="text-secondary" size={24} />
                  {t('provider.calendar')}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('provider.calendarDesc')} {t('provider.calendarCustomPrice')}
                </p>
                <MonthlyCalendar
                  year={2026}
                  calendarDays={calendarDays}
                  onToggle={toggleCalendarDay}
                  onPriceChange={handleDayPriceChange}
                  basePrice={formData.pricePerNight ? parseFloat(formData.pricePerNight) : undefined}
                />
              </div>

              {/* Contact Info */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <MapPin className="text-secondary" size={24} />
                  {t('provider.contactInfo')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="address">{t('provider.address')} *</Label>
                    <Input
                      id="address"
                      placeholder={t('provider.addressPlaceholder')}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('provider.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+385 99 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-success" />
                      {t('provider.whatsappNumber')}
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="+385 99 123 4567"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('provider.notificationsWhatsapp')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Declarations */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="text-secondary" size={24} />
                  {t('provider.declarations')}
                </h2>
                <div className="space-y-4">
                  {/* First declaration: Right of Disposal — visually prominent */}
                  <div className="flex items-start gap-3 p-4 bg-warning/10 border-2 border-warning/40 rounded-lg">
                    <Checkbox
                      id="ownership"
                      checked={declarations.ownership}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, ownership: checked as boolean }))}
                    />
                    <div>
                      <Label htmlFor="ownership" className="text-sm font-semibold text-foreground cursor-pointer block mb-1">
                        ⚖️ {t('provider.declarationRightOfDisposal', 'Izjava o pravu raspolaganja')}
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('provider.declaration1')}
                      </p>
                      <p className="text-xs text-muted-foreground/70 leading-relaxed mt-2 italic border-t border-warning/20 pt-2">
                        {t('provider.disposalDisclaimer', 'By submitting this declaration, you confirm that you have the legal right of disposal over this mooring and are responsible for the accuracy of the provided data. Mooring Booking platform is not responsible for false declarations.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox
                      id="commission"
                      checked={declarations.commission}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, commission: checked as boolean }))}
                    />
                    <Label htmlFor="commission" className="text-sm leading-relaxed cursor-pointer">
                      {t('provider.declaration2')}
                    </Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox
                      id="dataTransfer"
                      checked={declarations.dataTransfer}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, dataTransfer: checked as boolean }))}
                    />
                    <Label htmlFor="dataTransfer" className="text-sm leading-relaxed cursor-pointer">
                      {t('provider.dataTransferConsent2')}
                    </Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={declarations.terms}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, terms: checked as boolean }))}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      {t('provider.termsAgree')}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  {t('provider.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-ocean font-semibold h-12"
                  disabled={!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer}
                >
                  <QrCode className="mr-2" size={20} />
                  {t('provider.publishProfile')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BecomeProviderPage;
