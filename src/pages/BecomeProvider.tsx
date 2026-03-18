import { useState, useCallback, useEffect } from "react";
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
  { code: "HR", name: "Hrvatska", flag: "🇭🇷" },
  { code: "GR", name: "Grčka", flag: "🇬🇷" },
  { code: "IT", name: "Italija", flag: "🇮🇹" },
  { code: "ES", name: "Španjolska", flag: "🇪🇸" },
  { code: "FR", name: "Francuska", flag: "🇫🇷" },
  { code: "TR", name: "Turska", flag: "🇹🇷" },
  { code: "AL", name: "Albanija", flag: "🇦🇱" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "SI", name: "Slovenija", flag: "🇸🇮" },
  { code: "ME", name: "Crna Gora", flag: "🇲🇪" },
  { code: "CY", name: "Cipar", flag: "🇨🇾" },
];

const amenities = [
  { id: "water", label: "Pitka voda", icon: "💧" },
  { id: "electricity", label: "Struja", icon: "⚡" },
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "toilet", label: "WC", icon: "🚽" },
  { id: "shower", label: "Tuš", icon: "🚿" },
  { id: "fuel", label: "Gorivo", icon: "⛽" },
  { id: "restaurant", label: "Restoran", icon: "🍽️" },
];

const paymentMethods = [
  { id: "cash", label: "Gotovina", icon: "💵" },
  { id: "card", label: "Kreditna kartica", icon: "💳" },
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "googlepay", label: "Google Pay", icon: "📱" },
];

const winterServices = [
  { id: "winterization", label: "Zimska priprema", icon: "🔧" },
  { id: "hull_cleaning", label: "Čišćenje trupa", icon: "🧹" },
  { id: "mast_storage", label: "Skladištenje jarbola", icon: "🏗️" },
  { id: "electricity_winter", label: "Struja", icon: "⚡" },
  { id: "water_winter", label: "Voda", icon: "💧" },
  { id: "security", label: "24/7 Osiguranje", icon: "🔒" },
];

const mooringTypes = [
  { id: "vez_u_marini", label: "Vez u marini", icon: "⚓" },
  { id: "bova", label: "Bova", icon: "🔴" },
  { id: "dok", label: "Dok", icon: "🏗️" },
  { id: "sidriste", label: "Sidrište", icon: "⛵" },
  { id: "obalni_vez", label: "Obalni vez", icon: "🪢" },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Povećajte Svoj Prihod",
    description: "Objavite vaše vezove na dokovima, bovama ili u marini i gledajte kako AI kapetan pronalazi goste.",
    stat: "85%",
    statLabel: "Zarade ostaje vama"
  },
  {
    icon: Shield,
    title: "Jednostavno i Transparentno",
    description: "Samo 15% provizije na uspješne rezervacije. Bez početnih troškova, bez skrivenih naknada.",
    stat: "15%",
    statLabel: "Poštena provizija"
  },
  {
    icon: Megaphone,
    title: "Marketing Alati",
    description: "Dobijte jedinstven QR kod i affiliate link. Dijelite na društvenim mrežama i zaradite više.",
    stat: "€5/mj",
    statLabel: "Marketing paket"
  },
  {
    icon: Users,
    title: "Pridružite se Davateljima",
    description: "Budite dio rastuće mediteranske zajednice vezova. Podrška uključena.",
    stat: "11",
    statLabel: "Mediteranskih zemalja"
  },
];

const testimonials = [
  {
    quote: "Bio sam skeptičan u početku, ali Mooring Booking je promijenio sve. Moja privatna bova sada donosi €6.000 dodatno po sezoni!",
    author: "Marko K.",
    location: "Dubrovnik, Hrvatska",
    earnings: "€6.200/sezona",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    quote: "Platforma je toliko jednostavna za korištenje. Postavio sam svoj dok za 10 minuta i imao prvu rezervaciju za 2 dana.",
    author: "Giuseppe R.",
    location: "Portofino, Italija",
    earnings: "€4.800/sezona",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  },
  {
    quote: "Konačno poštena alternativa davanju veza prijateljima besplatno. Sada me plaćaju kako treba.",
    author: "Elena P.",
    location: "Santorini, Grčka",
    earnings: "€3.500/sezona",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    quote: "Moj vez u marini je stajao prazan 6 mjeseci godišnje. Sada zarađujem €15.000+ godišnje od rezervacija koje nikad nisam očekivao!",
    author: "Luka M.",
    location: "Dubrovnik, Hrvatska",
    earnings: "€15.400/god",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
  },
  {
    quote: "50% mog prihoda sada dolazi od Mooring Bookinga. QR kod funkcija olakšava pristup nautičarima koji dolaze!",
    author: "Dimitris K.",
    location: "Mykonos, Grčka",
    earnings: "€25.000/sezona",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop"
  },
  {
    quote: "Imam 3 privatne bove i zarađujem od njih više nego na redovnom poslu. Mooring Booking je to omogućio!",
    author: "Marco T.",
    location: "Amalfi, Italija",
    earnings: "€18.500/sezona",
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
            Ukupno prijava: <strong className="text-gold">{mooringCount}</strong>
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
    windProtection: "good",
    amenities: [] as string[],
    maxBoatLength: "",
    maxDraft: "",
    pricePerNight: "",
    discount: [10],
    paymentMethods: [] as string[],
    photos: [] as File[],
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

  // Pre-fill form from lead data when authenticated user loads page
  useEffect(() => {
    if (!user?.email) return;
    const fetchLeadData = async () => {
      try {
        const { data: lead } = await supabase
          .from('fb_leads')
          .select('full_name, email, phone, city, country, mooring_type, mooring_quantities')
          .eq('email', user.email)
          .maybeSingle();
        if (lead) {
          const quantities = (lead.mooring_quantities as Record<string, number>) || {};
          const totalUnits = Object.values(quantities).reduce((sum: number, v: number) => sum + (v || 0), 0);
          setFormData(prev => ({
            ...prev,
            country: lead.country || prev.country,
            region: lead.city || prev.region,
            phone: lead.phone || prev.phone,
            mooringUnits: totalUnits > 0 ? String(totalUnits) : prev.mooringUnits,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch lead data:', err);
      }
    };
    fetchLeadData();
  }, [user?.email]);

  const downloadTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `MOORING BOOKING - OPĆI UVJETI KORIŠTENJA
========================================
Zadnje ažurirano: 18. ožujka 2026.
Operater: Intelligent Matrix

1. PLATFORMA
Mooring Booking je online tržište koje povezuje davatelje vezova s korisnicima koji traže vez za plovilo. Platforma djeluje kao posrednik i ne posjeduje, ne upravlja niti kontrolira vezove navedene na platformi.

2. KORISNIČKI RAČUNI
Za korištenje određenih funkcionalnosti potrebna je registracija. Korisnik se obvezuje:
- Pružiti točne, aktualne i potpune informacije
- Održavati i redovito ažurirati svoje podatke
- Čuvati lozinku sigurnom i povjerljivom
- Preuzeti punu odgovornost za sve aktivnosti na računu
- Odmah nas obavijestiti o neovlaštenom korištenju

3. REZERVACIJE I PLAĆANJA
Za korisnike:
- Rezervacije se potvrđuju nakon uspješne obrade plaćanja
- Prikazane cijene uključuju sve primjenjive popuste platforme
- Pravila otkazivanja variraju po vezu; pregledajte prije rezervacije
- Koordinate za navigaciju dostupne tek nakon potvrđene rezervacije i plaćanja

Za davatelje:
- Provizija od 15% naplaćuje se na SVE rezervacije obrađene putem Platforme
- Stripe naknade (~2.9% + €0.30) oduzimaju se od ukupnog iznosa PRIJE podjele 15/85
- Davatelji mogu ponuditi popust 0-50% putem Platforme
- Isplate se obrađuju unutar 3-5 radnih dana nakon prijave

4. OBVEZE DAVATELJA
Davatelji se obvezuju:
- Pružiti točne opise i fotografije vezova
- Održavati točan kalendar dostupnosti
- Pravovremeno odgovarati na zahtjeve za rezervaciju
- Osigurati da vezovi zadovoljavaju lokalne sigurnosne standarde
- Poštivati sve potvrđene rezervacije
- Plaćati proviziju od 15% na sve rezervacije bez iznimke
- Potpisati izjavu o pravu raspolaganja
- Održavati valjano osiguranje odgovornosti gdje to zakon zahtijeva

5. PRIJENOS PODATAKA
Korištenjem Platforme korisnici pristaju na prijenos osobnih podataka nasljedniku u slučaju prodaje, spajanja ili promjene vlasništva. Nasljednik je vezan istim obvezama privatnosti. Korisnici će biti obaviješteni unutar 30 dana.

6. OGRANIČENJE ODGOVORNOSTI
Intelligent Matrix NIJE odgovoran za:
- Stanje, sigurnost ili zakonitost bilo kojeg veza
- Osobne ozljede ili štetu na imovini
- Financijske gubitke
- Vremenske/okolišne događaje
- Radnje trećih strana
MAKSIMALNA ODGOVORNOST: manja od ukupnih naknada plaćenih u 12 mjeseci ili €500.

7. ZABRANJENE AKTIVNOSTI
- Listanje vezova bez zakonskog prava raspolaganja
- Pružanje lažnih informacija
- Zaobilaženje platforme radi izbjegavanja provizije
- Uznemiravanje drugih korisnika
- Kršenje primjenjivih zakona

8. RJEŠAVANJE SPOROVA
Sporovi se najprije rješavaju pregovorima u roku od 30 dana. Ako pregovori ne uspiju, sporovi se rješavaju arbitražom prema češkom pravu. Sudovi u Pragu imaju isključivu nadležnost.

9. KONTAKT
Intelligent Matrix
Email: legal@mooring-booking.com
Email: info@intelligent-matrix.com
Adresa: Prag, Češka
Telefon: +420 739 328 337

© 2026 Mooring Booking. Sva prava pridržana.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mooring_Booking_Opci_Uvjeti.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `MOORING BOOKING - POLITIKA PRIVATNOSTI
=======================================
Zadnje ažurirano: 18. ožujka 2026.
Operater: Intelligent Matrix

1. PRIKUPLJANJE PODATAKA
Prikupljamo sljedeće osobne podatke:
- Ime i prezime, email adresu, broj telefona
- Lokaciju veza (GPS koordinate)
- Podatke o rezervacijama i plaćanjima
- Fotografije vezova

2. KORIŠTENJE PODATAKA
Vaše podatke koristimo za:
- Pružanje i poboljšanje usluge platforme
- Obradu rezervacija i plaćanja
- Komunikaciju s vama o vašim rezervacijama
- Slanje obavijesti i promocija (uz vašu suglasnost)

3. DIJELJENJE PODATAKA
Vaše podatke dijelimo:
- S drugim korisnicima platforme (ime, kontakt za rezervaciju)
- S pružateljima platnih usluga (Stripe)
- Prema zakonskim zahtjevima

4. VAŠA PRAVA (GDPR)
Imate pravo na:
- Pristup vašim osobnim podacima
- Ispravak netočnih podataka
- Brisanje podataka ("pravo na zaborav")
- Ograničenje obrade
- Prenosivost podataka
- Prigovor na obradu

5. SIGURNOST PODATAKA
Koristimo industrijsko-standardne mjere zaštite uključujući enkripciju, siguran pristup i redovite revizije.

6. KONTAKT
Za pitanja o privatnosti:
Email: privacy@mooring-booking.com
Adresa: Prag, Češka

© 2026 Mooring Booking. Sva prava pridržana.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mooring_Booking_Politika_Privatnosti.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

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

    // Validate required fields
    if (!formData.mooringName.trim()) {
      toast({ title: "Unesite naziv veza", description: "Molimo unesite naziv vašeg veza.", variant: "destructive" });
      return;
    }
    if (!formData.country) {
      toast({ title: "Odaberite državu", description: "Molimo odaberite državu iz popisa.", variant: "destructive" });
      return;
    }
    if (!formData.region.trim()) {
      toast({ title: "Unesite lokaciju", description: "Molimo unesite grad/luku.", variant: "destructive" });
      return;
    }
    if (!formData.pricePerNight || parseFloat(formData.pricePerNight) <= 0) {
      toast({ title: "Unesite cijenu", description: "Molimo unesite cijenu po noći.", variant: "destructive" });
      return;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Unesite telefon", description: "Molimo unesite kontakt telefon.", variant: "destructive" });
      return;
    }
    if (!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer) {
      toast({ title: "Prihvatite uvjete", description: "Molimo označite sve izjave i suglasnosti na dnu forme.", variant: "destructive" });
      return;
    }
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
        description: "", windProtection: "good",
        amenities: [], maxBoatLength: "", maxDraft: "", pricePerNight: "",
        discount: [10], paymentMethods: [], photos: [],
        phone: "", whatsapp: "",
        winterStorage: false, winterStorageType: "wet",
        winterPriceMonthly: "", winterServices: [],
        marketingTools: false, premiumListing: false,
        insuranceMediation: false, now4today: false, mooringUnits: "1",
      });
      setDeclarations({ ownership: false, commission: false, terms: false, dataTransfer: false });
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
    mooring_types: [] as string[],
    mooring_quantities: {} as Record<string, number>,
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);


  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Manual validation for fields that HTML5 can't validate
    if (!leadFormData.country) {
      toast({ title: "Odaberite državu", description: "Molimo odaberite državu iz popisa.", variant: "destructive" });
      return;
    }
    if (leadFormData.mooring_types.length === 0) {
      toast({ title: "Odaberite tip veza", description: "Molimo označite barem jedan tip veza.", variant: "destructive" });
      return;
    }

    // Validate quantities - set any empty ones to 1
    const cleanedQuantities: Record<string, number> = {};
    for (const typeId of leadFormData.mooring_types) {
      const val = leadFormData.mooring_quantities[typeId];
      cleanedQuantities[typeId] = (val && val > 0) ? val : 1;
    }

    setLeadSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://bblxawscmyzelinidkmb.supabase.co'}/functions/v1/process-fb-lead`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...leadFormData,
            mooring_type: leadFormData.mooring_types.join(', '),
            mooring_quantities: cleanedQuantities,
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
                    <span className="text-sm font-medium">Pridružite se davateljima vezova</span>
                  </div>
                  <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                    Objavite svoje vezove koje imate
                    <span className="block text-gold">i pretvorite ih u prihod</span>
                  </h1>
                  <p className="text-lg text-primary-foreground/80 mb-8">
                    Objavite vaše vezove na dokovima, bovama ili u marini i gledajte kako ih AI kapetan pronalazi — rezervacije dolaze.
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
                      <span>Dostupno u 11 mediteranskih zemalja</span>
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
                        <select
                          value={leadFormData.country}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, country: e.target.value }))}
                          className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          required
                        >
                          <option value="">Izaberite</option>
                          {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Tip veza (označite jedan ili više) *</Label>
                      <div className="space-y-2 mt-2">
                        {mooringTypes.map((mt) => {
                          const isChecked = leadFormData.mooring_types.includes(mt.id);
                          return (
                            <div key={mt.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${isChecked ? 'bg-secondary/10 border-secondary' : 'bg-muted border-transparent'}`}>
                              <Checkbox
                                id={`lead_mooring_${mt.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  setLeadFormData(prev => {
                                    const newQuantities = { ...prev.mooring_quantities };
                                    if (checked) {
                                      newQuantities[mt.id] = 1;
                                    } else {
                                      delete newQuantities[mt.id];
                                    }
                                    return {
                                      ...prev,
                                      mooring_types: checked
                                        ? [...prev.mooring_types, mt.id]
                                        : prev.mooring_types.filter(t => t !== mt.id),
                                      mooring_quantities: newQuantities,
                                      has_mooring: true,
                                    };
                                  });
                                }}
                              />
                              <Label htmlFor={`lead_mooring_${mt.id}`} className="text-sm cursor-pointer flex items-center gap-1 flex-1">
                                <span>{mt.icon}</span> {mt.label}
                              </Label>
                              {isChecked && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">Kom:</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={leadFormData.mooring_quantities[mt.id] ?? ''}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const val = raw === '' ? 0 : parseInt(raw);
                                      if (raw !== '' && (isNaN(val) || val < 0)) return;
                                      setLeadFormData(prev => ({
                                        ...prev,
                                        mooring_quantities: { ...prev.mooring_quantities, [mt.id]: val },
                                      }));
                                    }}
                                    onBlur={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!val || val < 1) {
                                        setLeadFormData(prev => ({
                                          ...prev,
                                          mooring_quantities: { ...prev.mooring_quantities, [mt.id]: 1 },
                                        }));
                                      }
                                    }}
                                    className="w-16 h-8 text-center text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
                    Digitalni ugovor o suglasnosti
                  </h1>
                  <p className="text-muted-foreground">
                    Molimo pregledajte uvjete prije objavljivanja vašeg veza.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-muted rounded-lg p-4 text-sm text-foreground leading-relaxed max-h-60 overflow-y-auto">
                    <h3 className="font-semibold mb-2">Sažetak uvjeta korištenja</h3>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                      <li>Potvrđujem da sam vlasnik ili ovlašteni korisnik navedenog veza.</li>
                      <li>Suglasan/na sam s provizijom od 15% na svaku potvrđenu rezervaciju.</li>
                      <li>Prihvaćam Opće uvjete korištenja platforme Mooring Booking.</li>
                      <li>Suglasan/na sam s prijenosom podataka u skladu s GDPR-om.</li>
                      <li>Objavljene fotografije su moje vlasništvo ili imam pravo korištenja.</li>
                      <li>Cijena po noći je konačna i uključuje sve naknade sa strane davatelja.</li>
                      <li>Ažurirat ću dostupnost kalendara redovito.</li>
                      <li>U slučaju otkazivanja, primjenjuju se politike otkazivanja platforme.</li>
                      {formData.marketingTools && <li>Suglasan/na sam s dodatnom uslugom marketinških alata (€5/mj).</li>}
                      {formData.premiumListing && <li>Suglasan/na sam s uslugom premium listanja (€9.99/mj).</li>}
                      {formData.insuranceMediation && <li>Suglasan/na sam s uslugom posredovanja osiguranja (€9.99/god).</li>}
                      {formData.now4today && <li>Suglasan/na sam s uslugom Now4Today — last-minute dostupnost.</li>}
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gold/10 rounded-lg border border-gold/20">
                    <Checkbox
                      id="finalConsent"
                      checked={consentAccepted}
                      onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                    />
                    <Label htmlFor="finalConsent" className="text-sm leading-relaxed cursor-pointer font-medium">
                      Pročitao/la sam i prihvaćam sve navedene uvjete korištenja i suglasan/na sam s objavom mog veza na platformi Mooring Booking.
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowConsent(false); setConsentAccepted(false); }}
                  >
                    ← Natrag na uređivanje
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-ocean font-semibold h-12"
                    disabled={!consentAccepted || isSubmitting}
                    onClick={handleFinalConsent}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                        {uploadingPhotos ? 'Učitavanje fotografija...' : 'Objavljujem...'}
                      </>
                    ) : (
                      <>
                        <Check className="mr-2" size={20} />
                        Potvrđujem i objavljujem
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Ovaj digitalni potpis ima pravnu snagu sukladno eIDAS regulativi EU.
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
                Objavite vaš vez
              </h1>
              <p className="text-muted-foreground">
                Ispunite podatke o vašem vezu da biste ga objavili na platformi
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Anchor className="text-secondary" size={24} />
                  Osnovni podaci
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="mooringName">Naziv veza *</Label>
                    <Input
                      id="mooringName"
                      placeholder="npr. Marina Split - vez A12"
                      value={formData.mooringName}
                      onChange={(e) => setFormData(prev => ({ ...prev, mooringName: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label>Država *</Label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    >
                      <option value="">Odaberite državu</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="region">Grad / Regija *</Label>
                    <Input
                      id="region"
                      placeholder="npr. Split"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <MapPin size={16} className="text-secondary" />
                      GPS koordinate *
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-2 mb-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Geografska širina</label>
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
                        <label className="text-xs text-muted-foreground mb-1 block">Geografska dužina</label>
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
                    <Label htmlFor="description">Opis veza *</Label>
                    <Textarea
                      id="description"
                      placeholder="Opišite vaš vez, lokaciju, pogodnosti..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-2 min-h-[120px]"
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/500 znakova
                    </p>
                  </div>
                </div>
              </div>

              {/* Mooring Details */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Shield className="text-secondary" size={24} />
                  Detalji veza
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Zaštita od vjetra *</Label>
                    <Select
                      value={formData.windProtection}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, windProtection: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">🛡️ Izvrsna</SelectItem>
                        <SelectItem value="good">✅ Dobra</SelectItem>
                        <SelectItem value="moderate">⚠️ Umjerena</SelectItem>
                        <SelectItem value="poor">❌ Slaba</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxBoatLength">Maks. dužina plovila (m) *</Label>
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
                    <Label htmlFor="maxDraft">Maks. gaz (m) *</Label>
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
                  <div className="md:col-span-2">
                    <Label>Tip veza i broj komada</Label>
                    <div className="space-y-2 mt-2">
                      {mooringTypes.map((mt) => {
                        const isChecked = formData.amenities.includes(`type_${mt.id}`) || false;
                        return (
                          <div key={mt.id} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${isChecked ? 'bg-secondary/10 border-secondary' : 'bg-muted border-transparent'}`}>
                            <Checkbox
                              id={`form_mooring_${mt.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                setFormData(prev => {
                                  const typeKey = `type_${mt.id}`;
                                  const newAmenities = checked
                                    ? [...prev.amenities, typeKey]
                                    : prev.amenities.filter(a => a !== typeKey);
                                  return { ...prev, amenities: newAmenities };
                                });
                              }}
                            />
                            <Label htmlFor={`form_mooring_${mt.id}`} className="text-sm cursor-pointer flex items-center gap-1 flex-1">
                              <span>{mt.icon}</span> {mt.label}
                            </Label>
                            {isChecked && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Kom:</span>
                                <Input
                                  type="number"
                                  min={1}
                                  defaultValue={1}
                                  onChange={(e) => {
                                    // Update total mooring units
                                    setTimeout(() => {
                                      const allInputs = document.querySelectorAll('[data-mooring-qty]') as NodeListOf<HTMLInputElement>;
                                      let total = 0;
                                      allInputs.forEach(inp => { total += parseInt(inp.value) || 0; });
                                      setFormData(prev => ({ ...prev, mooringUnits: String(total || 1) }));
                                    }, 0);
                                  }}
                                  data-mooring-qty={mt.id}
                                  className="w-16 h-8 text-center text-sm"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Označite tipove vezova koje nudite i unesite broj komada za svaki.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Pogodnosti</Label>
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
                  Zimski vez / Skladištenje
                </h2>
                <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">Nudite li zimsko skladištenje?</Label>
                    <p className="text-sm text-muted-foreground">Sezona: studeni - ožujak</p>
                  </div>
                  <Switch
                    checked={formData.winterStorage}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, winterStorage: checked }))}
                  />
                </div>
                {formData.winterStorage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Tip skladištenja *</Label>
                      <Select
                        value={formData.winterStorageType}
                        onValueChange={(value: "wet" | "dry" | "both") => setFormData(prev => ({ ...prev, winterStorageType: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wet">🌊 U moru</SelectItem>
                          <SelectItem value="dry">🏗️ Na suhom</SelectItem>
                          <SelectItem value="both">🔄 Oboje</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="winterPrice">Cijena zimskog veza (€/mjesec) *</Label>
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
                      <Label>Zimske usluge</Label>
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
                  Cijena i plaćanje
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pricePerNight">Cijena po noći (€) *</Label>
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
                    <Label>Popust: {formData.discount[0]}%</Label>
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
                              <span className="text-xs bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full">+20% premija</span>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Omogućite rezervacije za isti dan uz premiju od 20%
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
                            <span className="text-muted-foreground">Osnovna cijena:</span>
                            <span className="text-foreground">€{formData.pricePerNight}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-orange-600">Now4Today cijena:</span>
                            <span className="text-orange-600">€{(parseFloat(formData.pricePerNight) * 1.2).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            ⚡ Dostupno danas za €{(parseFloat(formData.pricePerNight) * 1.2).toFixed(2)}.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Načini plaćanja *</Label>
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
                  Fotografije veza
                </h2>
                <p className="text-muted-foreground text-sm mb-4">Dodajte fotografije vašeg veza. Kvalitetne slike privlače više gostiju.</p>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary/50 transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Upload className="mx-auto text-muted-foreground mb-4" size={40} />
                  <p className="text-muted-foreground">Kliknite ili povucite slike ovdje</p>
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
                  Kalendar dostupnosti
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Označite dane kada je vaš vez dostupan. Možete postaviti i prilagođenu cijenu za pojedine dane.
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
                  Kontakt informacije
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
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
                      WhatsApp broj (opcionalno)
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
                      Primajte obavijesti o rezervacijama putem WhatsAppa
                    </p>
                  </div>
                </div>
              </div>

              {/* Izjave i suglasnosti */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="text-secondary" size={24} />
                  Izjave i suglasnosti
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-warning/10 border-2 border-warning/40 rounded-lg">
                    <Checkbox
                      id="ownership"
                      checked={declarations.ownership}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, ownership: checked as boolean }))}
                    />
                    <div>
                      <Label htmlFor="ownership" className="text-sm font-semibold text-foreground cursor-pointer block mb-1">
                        ⚖️ Izjava o pravu raspolaganja
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Potvrđujem da sam vlasnik ili ovlašteni korisnik navedenog veza i da imam zakonsko pravo raspolaganja istim. Odgovoran/na sam za točnost unesenih podataka.
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
                      💰 Suglasan/na sam s provizijom od 15% na svaku potvrđenu rezervaciju putem Mooring Booking platforme. Preostalih 85% zarade je moje.
                    </Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox
                      id="dataTransfer"
                      checked={declarations.dataTransfer}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, dataTransfer: checked as boolean }))}
                    />
                    <Label htmlFor="dataTransfer" className="text-sm leading-relaxed cursor-pointer">
                      🔒 Suglasan/na sam da Mooring Booking obrađuje moje osobne podatke (ime, kontakt, lokacija veza) u svrhu pružanja usluge, u skladu s GDPR regulativom i Politikom privatnosti.
                    </Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={declarations.terms}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, terms: checked as boolean }))}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      📋 Pročitao/la sam i prihvaćam <a href="#" onClick={downloadTerms} className="text-secondary underline">Opće uvjete korištenja</a> i <a href="#" onClick={downloadPrivacy} className="text-secondary underline">Politiku privatnosti</a> platforme Mooring Booking.
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
                  Odustani
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-ocean font-semibold h-12"
                  disabled={!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer}
                >
                  <QrCode className="mr-2" size={20} />
                  Objavi vez
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
