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
  { id: "card", label: "Credit Card", icon: "💳" },
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

const mooringTypes = [
  { id: "vez_u_marini", label: "Marina Berth", icon: "⚓" },
  { id: "bova", label: "Buoy", icon: "🔴" },
  { id: "dok", label: "Dock", icon: "🏗️" },
  { id: "sidriste", label: "Anchorage", icon: "⛵" },
  { id: "obalni_vez", label: "Shore Mooring", icon: "🪢" },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Boost Your Income",
    description: "List your berths on docks, buoys or marinas and watch the AI captain find guests for you.",
    stat: "85%",
    statLabel: "Earnings stay with you"
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
    description: "Get a unique QR code and affiliate link. Share on social media and earn more.",
    stat: "€5/mo",
    statLabel: "Marketing package"
  },
  {
    icon: Users,
    title: "Join Our Providers",
    description: "Be part of the growing Mediterranean mooring community. Support included.",
    stat: "11",
    statLabel: "Mediterranean countries"
  },
];

const testimonials = [
  {
    quote: "I was skeptical at first, but Mooring Booking changed everything. My private buoy now brings in an extra €6,000 per season!",
    author: "Marko K.",
    location: "Dubrovnik, Croatia",
    earnings: "€6,200/season",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    quote: "The platform is so easy to use. I set up my dock in 10 minutes and had my first booking within 2 days.",
    author: "Giuseppe R.",
    location: "Portofino, Italy",
    earnings: "€4,800/season",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  },
  {
    quote: "Finally a fair alternative to giving berths to friends for free. Now I get paid properly.",
    author: "Elena P.",
    location: "Santorini, Greece",
    earnings: "€3,500/season",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    quote: "My marina berth was sitting empty for 6 months a year. Now I earn €15,000+ annually from bookings I never expected!",
    author: "Luka M.",
    location: "Dubrovnik, Croatia",
    earnings: "€15,400/year",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
  },
  {
    quote: "50% of my income now comes from Mooring Booking. The QR code feature makes it so easy for visiting sailors!",
    author: "Dimitris K.",
    location: "Mykonos, Greece",
    earnings: "€25,000/season",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop"
  },
  {
    quote: "I have 3 private buoys and I earn more from them than from my regular job. Mooring Booking made that possible!",
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

const ProviderMiniHeader = ({ mooringCount }: { mooringCount: number }) => {
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    window.location.reload(); // Force full page reload to reset React state
  };
  return (
    <div className="bg-gradient-ocean py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Anchor size={28} className="text-gold" />
          <span className="text-primary-foreground font-heading font-bold text-lg">Mooring Booking</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 hidden sm:flex">
            <MapPin size={16} className="text-gold" />
            <span className="text-primary-foreground text-sm">
              Total Listings: <strong className="text-gold">{mooringCount}</strong>
            </span>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-white hover:text-white/80 hover:bg-white/10 ml-2"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

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

  // Handle OAuth callback — when Google redirects back after login
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      // PKCE flow: exchange code for session
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    } else if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
      // Implicit flow: tokens in hash
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    }
  }, []);

  // Pre-fill form from lead data when authenticated user loads page
  // Also: ensure Google OAuth users get provider role + lead entry
  useEffect(() => {
    if (!user?.email) return;
    const setupUser = async () => {
      try {
        // Set user_role to 'provider' if not already set
        const currentRole = user.user_metadata?.user_role;
        if (!currentRole) {
          await supabase.auth.updateUser({
            data: { user_role: 'provider' }
          });
        }

        // Check if lead exists, create if not (e.g. Google OAuth users)
        const { data: existingLead } = await supabase
          .from('fb_leads')
          .select('id, full_name, email, phone, city, country, mooring_type, mooring_quantities')
          .eq('email', user.email)
          .maybeSingle();

        if (existingLead) {
          // Pre-fill form from existing lead
          const quantities = (existingLead.mooring_quantities as Record<string, number>) || {};
          const totalUnits = Object.values(quantities).reduce((sum: number, v: number) => sum + (v || 0), 0);
          setFormData(prev => ({
            ...prev,
            country: existingLead.country || prev.country,
            region: existingLead.city || prev.region,
            phone: existingLead.phone || prev.phone,
            mooringUnits: totalUnits > 0 ? String(totalUnits) : prev.mooringUnits,
          }));
        } else {
          // Create lead entry for Google OAuth user
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          await supabase.from('fb_leads').insert({
            full_name: fullName,
            email: user.email,
            status: 'registered',
            has_mooring: false,
          });
        }
      } catch (err) {
        console.error('Failed to setup user:', err);
      }
    };
    setupUser();
  }, [user?.email]);

  const downloadTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `MOORING BOOKING - GENERAL TERMS OF USE
=======================================
Last updated: 18 March 2026.
Operator: Intelligent Matrix

1. PLATFORM
Mooring Booking is an online marketplace connecting mooring providers with users looking for a berth for their vessel. The platform acts as an intermediary and does not own, operate, or control any moorings listed on the platform.

2. USER ACCOUNTS
Use of certain features requires registration. The user agrees to:
- Provide accurate, current, and complete information
- Maintain and regularly update their data
- Keep their password secure and confidential
- Take full responsibility for all activities on the account
- Notify us immediately of any unauthorised use

3. BOOKINGS AND PAYMENTS
For users:
- Bookings are confirmed after successful payment processing
- Displayed prices include all applicable platform discounts
- Cancellation policies vary by mooring; review before booking
- Navigation coordinates are available only after a confirmed, paid booking

For providers:
- A 15% commission is charged on ALL bookings processed via the Platform
- Stripe fees (~2.9% + €0.30) are deducted from the total BEFORE the 15/85 split
- Providers may offer discounts of 0–50% via the Platform
- Payouts are processed within 3–5 business days after request

4. PROVIDER OBLIGATIONS
Providers agree to:
- Provide accurate descriptions and photos of moorings
- Maintain an accurate availability calendar
- Respond promptly to booking requests
- Ensure moorings meet local safety standards
- Honour all confirmed bookings
- Pay the 15% commission on all bookings without exception
- Sign a declaration of right of disposal
- Maintain valid liability insurance where required by law

5. DATA TRANSFER
By using the Platform, users consent to the transfer of personal data to a successor in the event of a sale, merger, or change of ownership. The successor is bound by the same privacy obligations. Users will be notified within 30 days.

6. LIMITATION OF LIABILITY
Intelligent Matrix is NOT liable for:
- The condition, safety, or legality of any mooring
- Personal injury or property damage
- Financial losses
- Weather/environmental events
- Third-party actions
MAXIMUM LIABILITY: the lesser of all fees paid in 12 months or €500.

7. PROHIBITED ACTIVITIES
- Listing moorings without legal right of disposal
- Providing false information
- Bypassing the platform to avoid commission
- Harassing other users
- Violating applicable laws

8. DISPUTE RESOLUTION
Disputes are first resolved through negotiation within 30 days. If negotiations fail, disputes are settled by arbitration under Czech law. Courts in Prague have exclusive jurisdiction.

9. CONTACT
Intelligent Matrix
Email: legal@mooring-booking.com
Email: info@intelligent-matrix.com
Address: Prague, Czech Republic
Phone: +420 739 328 337

© 2026 Mooring Booking. All rights reserved.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mooring_Booking_Terms_of_Use.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `MOORING BOOKING - PRIVACY POLICY
=================================
Last updated: 18 March 2026.
Operator: Intelligent Matrix

1. DATA COLLECTION
We collect the following personal data:
- Full name, email address, phone number
- Mooring location (GPS coordinates)
- Booking and payment data
- Mooring photos

2. USE OF DATA
We use your data to:
- Provide and improve the platform service
- Process bookings and payments
- Communicate with you about your bookings
- Send notifications and promotions (with your consent)

3. DATA SHARING
We share your data:
- With other platform users (name, contact for booking)
- With payment service providers (Stripe)
- As required by law

4. YOUR RIGHTS (GDPR)
You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete data ("right to be forgotten")
- Restrict processing
- Data portability
- Object to processing

5. DATA SECURITY
We use industry-standard protection measures including encryption, secure access, and regular audits.

6. CONTACT
For privacy questions:
Email: privacy@mooring-booking.com
Address: Prague, Czech Republic

© 2026 Mooring Booking. All rights reserved.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mooring_Booking_Privacy_Policy.txt';
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
      toast({ title: "Enter mooring name", description: "Please enter the name of your mooring.", variant: "destructive" });
      return;
    }
    if (!formData.country) {
      toast({ title: "Select country", description: "Please select a country from the list.", variant: "destructive" });
      return;
    }
    if (!formData.region.trim()) {
      toast({ title: "Enter location", description: "Please enter the city/port.", variant: "destructive" });
      return;
    }

    if (!formData.phone.trim()) {
      toast({ title: "Enter phone", description: "Please enter a contact phone number.", variant: "destructive" });
      return;
    }
    if (!declarations.ownership || !declarations.terms || !declarations.dataTransfer) {
      toast({ title: "Accept the terms", description: "Please check all declarations and consents at the bottom of the form.", variant: "destructive" });
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
        p_latitude: parseFloat(formData.latitude) || 0,
        p_longitude: parseFloat(formData.longitude) || 0,
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

      // Auto-approve: set mooring status to 'approved' so it's live immediately
      if (data) {
        await supabase
          .from('moorings')
          .update({ status: 'approved' })
          .eq('id', data);
      }

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
        title: "✅ Mooring Published!",
        description: "Your mooring is now live and visible to all guests.",
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
      toast({ title: "Select country", description: "Please select a country from the list.", variant: "destructive" });
      return;
    }
    if (leadFormData.mooring_types.length === 0) {
      toast({ title: "Select mooring type", description: "Please check at least one mooring type.", variant: "destructive" });
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
          title: "✅ Registration successful!",
          description: "Check your email for the access link.",
        });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
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
                  Registration successful! 🎉
                </h1>
                <p className="text-primary-foreground/80 text-lg mb-6">
                  We sent an email to <strong className="text-gold">{leadFormData.email}</strong> with your access link.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left mb-8">
                  <p className="text-primary-foreground font-medium mb-3">Next steps:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-gold text-gold-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">1</span>
                      <span className="text-primary-foreground/80">Open the email and click the link</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-gold text-gold-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">2</span>
                      <span className="text-primary-foreground/80">Add photos and details about your mooring</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-gold text-gold-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">3</span>
                      <span className="text-primary-foreground/80">Start receiving bookings!</span>
                    </div>
                  </div>
                </div>
                <p className="text-primary-foreground/60 text-sm">
                  Didn't receive the email? Check your spam folder or <a href="mailto:support@mooring-booking.com" className="text-gold hover:underline">contact us</a>.
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
                    <span className="text-sm font-medium">Join our mooring providers</span>
                  </div>
                  <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                    List your moorings
                    <span className="block text-gold">and turn them into income</span>
                  </h1>
                  <p className="text-lg text-primary-foreground/80 mb-8">
                    List your berths on docks, buoys or in a marina and watch the AI captain find them — bookings come to you.
                  </p>
                  <div className="space-y-3 text-primary-foreground/90">
                    <div className="flex items-center gap-3">
                      <Check className="text-gold flex-shrink-0" size={20} />
                      <span>Free listing — no subscription</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="text-gold flex-shrink-0" size={20} />
                      <span>85% earnings are yours (only 15% commission)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="text-gold flex-shrink-0" size={20} />
                      <span>Available in 11 Mediterranean countries</span>
                    </div>
                  </div>
                </div>

                {/* Right - Lead Form */}
                <div className="bg-card rounded-2xl p-8 shadow-hover">
                  <div className="text-center mb-6">
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                      Register for free
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Fill in the form and you'll receive access via email
                    </p>
                  </div>

                  <div className="mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 font-medium bg-white hover:bg-gray-50 text-gray-900 border-gray-200"
                      onClick={async () => {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: { redirectTo: `${window.location.origin}/become-provider` },
                        });
                        if (error) {
                          toast({
                            title: "Error",
                            description: "Google sign-in failed. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </Button>
                    
                    <div className="flex items-center gap-3 my-4">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-xs text-muted-foreground uppercase font-medium">or fill in the form</span>
                      <div className="h-px bg-border flex-1" />
                    </div>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="lead_name">Full Name *</Label>
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
                      <Label htmlFor="lead_email">Email Address *</Label>
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
                      <Label htmlFor="lead_phone">Phone *</Label>
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
                        <Label htmlFor="lead_city">City *</Label>
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
                        <Label>Country *</Label>
                        <select
                          value={leadFormData.country}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, country: e.target.value }))}
                          className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          required
                        >
                          <option value="">Select</option>
                          {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Mooring Type (select one or more) *</Label>
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
                                  <span className="text-xs text-muted-foreground">Qty:</span>
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
                        I currently have a mooring I want to rent out
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
                          Submitting...
                        </>
                      ) : (
                        <>
                          🚀 Register for Free
                          <ArrowRight className="ml-2" size={20} />
                        </>
                      )}
                    </Button>



                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Free · No credit card · 15% commission only on bookings
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
                    Mooring Published! 🎉
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    Your mooring is now under review. We'll notify you once it's approved.
                  </p>
                  <p className="text-sm text-green-700 font-medium">
                    Total moorings: {mooringCount}
                  </p>
                </div>
              )}

              <div className="bg-card rounded-2xl p-8 shadow-hover text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Anchor className="text-gold" size={32} />
                </div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3" translate="no">
                  {justSubmitted ? 'Add Another Mooring' : 'Add Your Moorings'}
                </h1>
                <p className="text-muted-foreground mb-8">
                  {justSubmitted
                    ? 'Have more moorings? Add them all and increase your earnings!'
                    : 'Fill in the details about your moorings and increase your income. Free, no risk.'
                  }
                </p>

                <div className="space-y-3 text-left mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="text-gold flex-shrink-0" size={18} />
                    <span>Free listing — no subscription</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="text-gold flex-shrink-0" size={18} />
                    <span>85% earnings are yours (only 15% commission)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="text-gold flex-shrink-0" size={18} />
                    <span>Sailors from 11 Mediterranean countries</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14"
                  onClick={() => { setShowForm(true); setJustSubmitted(false); }}
                >
                  <span translate="no">{justSubmitted ? '➕ Add Another Mooring' : '⚓ Add Moorings'}</span>
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
                    Please review the terms before publishing your mooring.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-muted rounded-lg p-4 text-sm text-foreground leading-relaxed max-h-60 overflow-y-auto">
                    <h3 className="font-semibold mb-2">Summary of Terms of Use</h3>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                      <li>I confirm that I am the owner or authorised user of the listed mooring.</li>
                      <li>I agree to a 15% commission on every confirmed booking.</li>
                      <li>I accept the General Terms and Conditions of the Mooring Booking platform.</li>
                      <li>I agree to the transfer of my data in accordance with GDPR.</li>
                      <li>Published photos are my property or I have the right to use them.</li>
                      <li>The price per night is final and includes all costs on the provider's side.</li>
                      <li>I will keep my availability calendar up to date regularly.</li>
                      <li>In the event of cancellation, the platform's cancellation policies apply.</li>
                      {formData.marketingTools && <li>I agree to the additional Marketing Tools service (€5/mo).</li>}
                      {formData.premiumListing && <li>I agree to the Premium Listing service (€9.99/mo).</li>}
                      {formData.insuranceMediation && <li>I agree to the Insurance Mediation service (€9.99/yr).</li>}
                      {formData.now4today && <li>I agree to the Now4Today service — last-minute availability.</li>}
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gold/10 rounded-lg border border-gold/20">
                    <Checkbox
                      id="finalConsent"
                      checked={consentAccepted}
                      onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                    />
                    <Label htmlFor="finalConsent" className="text-sm leading-relaxed cursor-pointer font-medium">
                      I have read and accept all the terms listed above and agree to the publication of my mooring on the Mooring Booking platform.
                    </Label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 h-12"
                    onClick={() => { setShowConsent(false); setConsentAccepted(false); }}
                  >
                    ← Back to editing
                  </Button>
                  <Button
                    className="w-full sm:flex-1 bg-gradient-ocean font-semibold h-12"
                    disabled={!consentAccepted || isSubmitting}
                    onClick={handleFinalConsent}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                        {uploadingPhotos ? 'Uploading photos...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        <Check className="mr-2" size={20} />
                        Confirm
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  This digital signature has legal force under the EU eIDAS regulation.
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
                Publish Your Mooring
              </h1>
              <p className="text-muted-foreground">
                Fill in the details about your mooring to publish it on the platform
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
                    <Label htmlFor="mooringName">Mooring Name *</Label>
                    <Input
                      id="mooringName"
                      placeholder="e.g. Marina Split - Berth A12"
                      value={formData.mooringName}
                      onChange={(e) => setFormData(prev => ({ ...prev, mooringName: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label>Country *</Label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="region">City / Region *</Label>
                    <Input
                      id="region"
                      placeholder="e.g. Split"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="mt-2"
                      required
                    />
                  </div>
                  {false && <div className="md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <MapPin size={16} className="text-secondary" />
                      GPS Coordinates *
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-2 mb-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                        <Input
                          placeholder="e.g. 43.5081"
                          value={formData.latitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
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
                  </div>}
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Mooring Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your mooring, location, amenities..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-2 min-h-[120px]"
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/500 characters
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
                    <Label>Wind Protection *</Label>
                    <Select
                      value={formData.windProtection}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, windProtection: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">🛡️ Excellent</SelectItem>
                        <SelectItem value="good">✅ Good</SelectItem>
                        <SelectItem value="moderate">⚠️ Moderate</SelectItem>
                        <SelectItem value="poor">❌ Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxBoatLength">Max. Boat Length (m) *</Label>
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
                    <Label htmlFor="maxDraft">Max. Draft (m) *</Label>
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
                    <Label>Mooring Type and Quantity</Label>
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
                                <span className="text-xs text-muted-foreground">Qty:</span>
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

                  </div>
                  <div className="md:col-span-2">
                    <Label>Amenities</Label>
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

              {/* Winter Storage — hidden for quick registration */}
              {false && <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Snowflake className="text-secondary" size={24} />
                  Winter Mooring / Storage
                </h2>
                <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">Do you offer winter storage?</Label>
                    <p className="text-sm text-muted-foreground">Season: November – March</p>
                  </div>
                  <Switch
                    checked={formData.winterStorage}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, winterStorage: checked }))}
                  />
                </div>
                {formData.winterStorage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Storage Type *</Label>
                      <Select
                        value={formData.winterStorageType}
                        onValueChange={(value: "wet" | "dry" | "both") => setFormData(prev => ({ ...prev, winterStorageType: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wet">🌊 In the water</SelectItem>
                          <SelectItem value="dry">🏗️ On land (dry)</SelectItem>
                          <SelectItem value="both">🔄 Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="winterPrice">Winter Mooring Price (€/month) *</Label>
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
                      <Label>Winter Services</Label>
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
              </div>}

              {/* Pricing — hidden for quick registration */}
              {false && <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="text-secondary" size={24} />
                  Pricing & Payment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pricePerNight">Price per Night (€) *</Label>
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
                    <Label>Discount: {formData.discount[0]}%</Label>
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
                              <span className="text-xs bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full">+20% premium</span>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Enable same-day bookings with a 20% premium
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

                </div>
              </div>}

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

              {/* Photos — hidden for quick registration */}
              {false && <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Camera className="text-secondary" size={24} />
                  Mooring Photos
                </h2>
                <p className="text-muted-foreground text-sm mb-4">Add photos of your mooring. High-quality images attract more guests.</p>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary/50 transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Upload className="mx-auto text-muted-foreground mb-4" size={40} />
                  <p className="text-muted-foreground">Click or drag images here</p>
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
              </div>}

              {/* Ad Banner — hidden */}
              {false && <AdBanner position="inline" size="medium" />}

              {/* Calendar — hidden for quick registration */}
              {false && <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Calendar className="text-secondary" size={24} />
                  Availability Calendar
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Mark the days when your mooring is available. You can also set a custom price for individual days.
                </p>
                <MonthlyCalendar
                  year={2026}
                  calendarDays={calendarDays}
                  onToggle={toggleCalendarDay}
                  onPriceChange={handleDayPriceChange}
                  basePrice={formData.pricePerNight ? parseFloat(formData.pricePerNight) : undefined}
                />
              </div>}

              {/* Contact Info */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <MapPin className="text-secondary" size={24} />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+385 99 123 4567"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          phone: val,
                          whatsapp: (!prev.whatsapp || prev.whatsapp === prev.phone) ? val : prev.whatsapp
                        }));
                      }}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-success" />
                      WhatsApp number (optional)
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
                      Receive booking notifications via WhatsApp
                    </p>
                  </div>
                </div>
              </div>

              {/* Izjave i suglasnosti */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="text-secondary" size={24} />
                  Declarations & Consents
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
                        ⚖️ Declaration of Right of Disposal
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        I confirm that I am the owner or authorised user of the listed mooring and have the legal right of disposal. I am responsible for the accuracy of the information provided.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox
                      id="dataTransfer"
                      checked={declarations.dataTransfer}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, dataTransfer: checked as boolean }))}
                    />
                    <Label htmlFor="dataTransfer" className="text-sm leading-relaxed cursor-pointer">
                      🔒 I agree that Mooring Booking processes my personal data (name, contact, mooring location) for the purpose of providing the service, in accordance with the GDPR regulation and Privacy Policy.
                    </Label>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={declarations.terms}
                      onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, terms: checked as boolean }))}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      📋 I have read and accept the <a href="#" onClick={downloadTerms} className="text-secondary underline">General Terms of Use</a> and <a href="#" onClick={downloadPrivacy} className="text-secondary underline">Privacy Policy</a> of the Mooring Booking platform.
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-ocean font-semibold h-12"
                  disabled={!declarations.ownership || !declarations.terms || !declarations.dataTransfer}
                >
                  <QrCode className="mr-2" size={20} />
                  Publish Mooring
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
