import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, supabaseUrl } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CalendarDay } from "@/components/MonthlyCalendar";
import { MooringFormData, generateCalendarDays as generateFullCalendarDays } from "@/components/provider/MooringForm";
import { termsContent, privacyContent } from "@/data/providerConstants";

export interface ProviderFormData {
  mooringName: string;
  country: string;
  region: string;
  latitude: string;
  longitude: string;
  description: string;
  windProtection: string;
  amenities: string[];
  maxBoatLength: string;
  maxDraft: string;
  pricePerNight: string;
  discount: number[];
  paymentMethods: string[];
  photos: File[];
  phone: string;
  whatsapp: string;
  winterStorage: boolean;
  winterStorageType: "wet" | "dry" | "both";
  winterPriceMonthly: string;
  winterServices: string[];
  marketingTools: boolean;
  premiumListing: boolean;
  insuranceMediation: boolean;
  now4today: boolean;
  mooringUnits: string;
}

export interface Declarations {
  ownership: boolean;
  commission: boolean;
  terms: boolean;
  dataTransfer: boolean;
}

export interface AuthFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

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

const initialFormData: ProviderFormData = {
  mooringName: "",
  country: "",
  region: "",
  latitude: "",
  longitude: "",
  description: "",
  windProtection: "good",
  amenities: [],
  maxBoatLength: "",
  maxDraft: "",
  pricePerNight: "",
  discount: [10],
  paymentMethods: [],
  photos: [],
  phone: "",
  whatsapp: "",
  winterStorage: false,
  winterStorageType: "wet",
  winterPriceMonthly: "",
  winterServices: [],
  marketingTools: false,
  premiumListing: false,
  insuranceMediation: false,
  now4today: false,
  mooringUnits: "1",
};

export function useProviderForm() {
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [mooringCount, setMooringCount] = useState(0);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [lastMooringId, setLastMooringId] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [userMoorings, setUserMoorings] = useState<{ id: string; name: string; status: string }[]>([]);
  const [editingMooringId, setEditingMooringId] = useState<string | null>(null);
  const [isCompletingListing, setIsCompletingListing] = useState(false);
  const [fullMooringData, setFullMooringData] = useState<Partial<MooringFormData> | null>(null);
  const [fullCalendarDays, setFullCalendarDays] = useState<CalendarDay[] | null>(null);
  const [formData, setFormData] = useState<ProviderFormData>(initialFormData);
  const [declarations, setDeclarations] = useState<Declarations>({
    ownership: false,
    commission: false,
    terms: false,
    dataTransfer: false,
  });
  const [calendarDays, setCalendarDays] = useState(generateCalendarDays());
  const [autoOpenFromLead, setAutoOpenFromLead] = useState(false);
  const [mooringsLoaded, setMooringsLoaded] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authFormData, setAuthFormData] = useState<AuthFormData>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const fromLead = params.get('fromLead') === '1';
    const fbLeadId = params.get('fbld_id');
    if (fromLead) setAutoOpenFromLead(true);

    if (fbLeadId && /^\d{6,32}$/.test(fbLeadId)) {
      fetch(`${supabaseUrl}/functions/v1/resolve-fb-lead?fb_lead_id=${encodeURIComponent(fbLeadId)}`)
        .then(r => r.json())
        .then(data => {
          if (data?.magic_link_url) {
            window.location.href = data.magic_link_url;
          } else {
            setAutoOpenFromLead(true);
            window.history.replaceState(null, '', window.location.pathname + '?fromLead=1');
          }
        })
        .catch(() => {
          setAutoOpenFromLead(true);
          window.history.replaceState(null, '', window.location.pathname + '?fromLead=1');
        });
      return;
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    } else if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {
      const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
          if (!error) {
            window.history.replaceState(null, '', window.location.pathname + (fromLead ? '?fromLead=1' : ''));
          }
        });
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) window.history.replaceState(null, '', window.location.pathname);
        });
      }
    } else if (fromLead) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Auto-open form for authenticated users with 0 listings
  useEffect(() => {
    if (user && mooringsLoaded && mooringCount === 0 && !showForm && !justSubmitted) {
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [user, mooringsLoaded, mooringCount, showForm, justSubmitted]);

  // Pre-fill form from lead data
  useEffect(() => {
    if (!user?.email) return;
    const setupUser = async () => {
      try {
        const currentRole = user.user_metadata?.user_role;
        if (!currentRole) {
          await supabase.auth.updateUser({ data: { user_role: 'provider' } });
        }

        const { data: existingLead } = await supabase
          .from('fb_leads')
          .select('id, full_name, email, phone, city, country, mooring_type, mooring_quantities')
          .eq('email', user.email)
          .maybeSingle();

        if (existingLead) {
          const clean = (v: string | null | undefined): string =>
            !v || /^<test lead/i.test(v.trim()) ? '' : v;
          const quantities = (existingLead.mooring_quantities as Record<string, number>) || {};
          const totalUnits = Object.values(quantities).reduce((sum: number, v: number) => sum + (v || 0), 0);
          setFormData(prev => ({
            ...prev,
            country: clean(existingLead.country) || prev.country,
            region: clean(existingLead.city) || prev.region,
            phone: clean(existingLead.phone) || prev.phone,
            mooringUnits: totalUnits > 0 ? String(totalUnits) : prev.mooringUnits,
          }));
        } else {
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

  const refreshMoorings = useCallback(() => {
    if (!user?.id) return;
    supabase
      .from('moorings')
      .select('id, name, status')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setUserMoorings(data);
          setMooringCount(data.length);
        }
        setMooringsLoaded(true);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    refreshMoorings();
  }, [user?.id, refreshMoorings]);

  const loadMooringForEdit = async (mooringId: string) => {
    const { data, error } = await supabase
      .from('moorings')
      .select('*')
      .eq('id', mooringId)
      .single();
    if (error || !data) {
      toast({ title: 'Error', description: 'Could not load mooring data.', variant: 'destructive' });
      return;
    }
    setEditingMooringId(mooringId);
    setFormData(prev => ({
      ...prev,
      mooringName: data.name || '',
      country: data.country || '',
      region: data.location || '',
      latitude: String(data.lat || ''),
      longitude: String(data.lng || ''),
      description: data.description || '',
      windProtection: data.wind_protection || 'good',
      amenities: data.amenities || [],
      maxBoatLength: String(data.max_boat_length || ''),
      maxDraft: String(data.max_draft || ''),
      pricePerNight: String(data.price_per_night || ''),
      phone: data.owner_phone || '',
      whatsapp: data.owner_whatsapp || '',
      photos: [],
    }));
    setIsCompletingListing(false);
    setShowForm(true);
    setJustSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMooringForComplete = async (mooringId: string) => {
    try {
      const { data: dbMooring, error } = await supabase
        .from('moorings')
        .select('*, owner:profiles!owner_id(address, phone, whatsapp)')
        .eq('id', mooringId)
        .eq('owner_id', user!.id)
        .single();

      if (error || !dbMooring) throw new Error("Mooring not found");

      setFullMooringData({
        mooringName: dbMooring.name,
        country: dbMooring.country,
        region: dbMooring.location,
        latitude: String(dbMooring.lat),
        longitude: String(dbMooring.lng),
        description: dbMooring.description,
        windProtection: dbMooring.wind_protection,
        amenities: dbMooring.amenities,
        maxBoatLength: String(dbMooring.max_boat_length || ''),
        maxDraft: String(dbMooring.max_draft || ''),
        mooringUnits: String(dbMooring.mooring_units || 1),
        pricePerNight: String(dbMooring.price_per_night),
        discount: [dbMooring.discount_percent || 0],
        paymentMethods: dbMooring.payment_methods || [],
        photos: [],
        address: dbMooring.owner?.address || "",
        phone: dbMooring.owner?.phone || "",
        whatsapp: dbMooring.owner?.whatsapp || "",
        now4today: dbMooring.is_now4today || false,
        winterStorage: dbMooring.winter_storage || false,
        winterStorageType: dbMooring.winter_storage_type || "wet",
        winterPriceMonthly: String(dbMooring.winter_price_monthly || ""),
        winterServices: dbMooring.winter_services || [],
        marketingTools: dbMooring.marketing_tools || false,
        premiumListing: dbMooring.is_premium_listing || false,
        insuranceMediation: dbMooring.insurance_mediation || false,
      });

      const baseline = generateFullCalendarDays();
      const { data: availData } = await supabase
        .from('mooring_availability')
        .select('*')
        .eq('mooring_id', mooringId);

      if (availData) {
        availData.forEach((ad: { date: string; available: boolean; custom_price?: number }) => {
          const dayIndex = baseline.findIndex(bd => bd.date.toISOString().split('T')[0] === ad.date);
          if (dayIndex !== -1) {
            baseline[dayIndex].available = ad.available;
            baseline[dayIndex].customPrice = ad.custom_price || undefined;
          }
        });
      }
      setFullCalendarDays(baseline);
      setEditingMooringId(mooringId);
      setIsCompletingListing(true);
      setShowForm(true);
      setJustSubmitted(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: 'Could not load mooring data.', variant: 'destructive' });
    }
  };

  const handlePublishComplete = async (data: MooringFormData, days: CalendarDay[]) => {
    if (!user || !editingMooringId) return;
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of data.photos) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('mooring-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('mooring-images').getPublicUrl(filePath);
        imageUrls.push(urlData.publicUrl);
      }

      const { error: updateError } = await supabase
        .from('moorings')
        .update({
          name: data.mooringName,
          country: data.country,
          location: data.region,
          lat: parseFloat(data.latitude) || 0,
          lng: parseFloat(data.longitude) || 0,
          description: data.description,
          wind_protection: data.windProtection,
          amenities: data.amenities,
          max_boat_length: parseFloat(data.maxBoatLength) || null,
          max_draft: parseFloat(data.maxDraft) || null,
          mooring_units: parseInt(data.mooringUnits) || 1,
          price_per_night: parseFloat(data.pricePerNight),
          discount_percent: data.discount[0] || 0,
          payment_methods: data.paymentMethods,
          is_now4today: data.now4today,
          winter_storage: data.winterStorage,
          winter_storage_type: data.winterStorageType,
          winter_price_monthly: parseFloat(data.winterPriceMonthly) || 0,
          winter_services: data.winterServices,
          marketing_tools: data.marketingTools,
          is_premium_listing: data.premiumListing,
          insurance_mediation: data.insuranceMediation,
          status: 'pending',
          ...(imageUrls.length > 0 ? { image_urls: imageUrls } : {})
        })
        .eq('id', editingMooringId)
        .eq('owner_id', user.id);

      if (updateError) throw updateError;

      await supabase.from('profiles').update({
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp,
        role: 'provider'
      }).eq('id', user.id);

      const availabilityList = days.map(day => ({
        mooring_id: editingMooringId,
        date: day.date.toISOString().split('T')[0],
        available: day.available,
        custom_price: day.customPrice || 0
      }));

      const { error: availError } = await supabase
        .from('mooring_availability')
        .upsert(availabilityList, { onConflict: 'mooring_id,date' });

      if (availError) throw availError;

      toast({ title: "✅ Mooring Details Published!", description: "Your details have been saved." });

      setIsCompletingListing(false);
      setEditingMooringId(null);
      setShowForm(false);
      refreshMoorings();
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const blob = new Blob([termsContent], { type: 'text/plain;charset=utf-8' });
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
    const blob = new Blob([privacyContent], { type: 'text/plain;charset=utf-8' });
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
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Your session ended. Please sign in again to publish.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls = await uploadPhotos();
      const availability = calendarDays
        .filter(day => !day.available || (day.customPrice && day.customPrice > 0))
        .map(day => ({
          date: day.date.toISOString().split('T')[0],
          available: day.available,
          custom_price: day.customPrice || 0,
        }));

      await supabase
        .from('profiles')
        .update({ role: 'provider', phone: formData.phone })
        .eq('id', user!.id);

      if (editingMooringId) {
        const { error: updateError } = await supabase
          .from('moorings')
          .update({
            name: formData.mooringName,
            country: formData.country,
            location: formData.region,
            lat: parseFloat(formData.latitude) || 0,
            lng: parseFloat(formData.longitude) || 0,
            description: formData.description,
            amenities: formData.amenities,
            wind_protection: formData.windProtection,
            max_boat_length: parseFloat(formData.maxBoatLength) || 0,
            max_draft: parseFloat(formData.maxDraft) || 0,
            price_per_night: parseFloat(formData.pricePerNight) || 0,
            image_urls: imageUrls.length > 0 ? imageUrls : undefined,
            owner_phone: formData.phone,
            owner_whatsapp: formData.whatsapp || '',
            status: 'active',
          })
          .eq('id', editingMooringId)
          .eq('owner_id', user!.id);

        if (updateError) throw updateError;
        setLastMooringId(editingMooringId);
        setEditingMooringId(null);

        toast({
          title: '✅ Mooring Updated!',
          description: 'Your changes have been saved.',
        });
      } else {
        const { data: rpcData, error: rpcError } = await supabase.rpc('publish_provider_profile', {
          p_mooring_name: formData.mooringName,
          p_country: formData.country,
          p_region: formData.region,
          p_latitude: parseFloat(formData.latitude) || 0,
          p_longitude: parseFloat(formData.longitude) || 0,
          p_description: formData.description,
          p_wind_protection: formData.windProtection || 'good',
          p_amenities: formData.amenities,
          p_max_boat_length: 0,
          p_max_draft: 0,
          p_mooring_units: 1,
          p_price_per_night: 0,
          p_discount_percent: 0,
          p_payment_methods: [],
          p_now4today: false,
          p_winter_storage: false,
          p_winter_storage_type: 'wet',
          p_winter_price_monthly: 0,
          p_winter_services: [],
          p_marketing_tools: false,
          p_premium_listing: false,
          p_insurance_mediation: false,
          p_image_urls: imageUrls,
          p_phone: formData.phone,
          p_whatsapp: formData.whatsapp || '',
          p_availability: [],
        });

        if (rpcError) throw rpcError;

        if (rpcData) {
          setLastMooringId(rpcData);
          await supabase.from('moorings').update({ status: 'active' }).eq('id', rpcData);
        }
        setMooringCount(prev => prev + 1);
        setJustSubmitted(true);

        toast({
          title: '✅ Mooring Published!',
          description: 'Your mooring is live! Check your email to verify your account.',
        });

        // Fire-and-forget verification OTP — non-blocking by design, but log
        // failures in dev so a broken email flow doesn't fail silently.
        supabase.auth.signInWithOtp({
          email: user!.email!,
          options: { shouldCreateUser: false },
        }).catch((err) => {
          if (import.meta.env.DEV) console.warn('[publish] verification OTP failed:', err);
        });
      }

      setConsentAccepted(false);
      setShowConsent(false);
      setShowForm(false);
      refreshMoorings();
    } catch (err: unknown) {
      console.error('Publish error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to publish profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);

    try {
      if (authMode === 'register') {
        if (!authFormData.full_name || !authFormData.email || !authFormData.phone || !authFormData.password) {
          throw new Error("Please fill in all fields.");
        }

        const { error } = await signUp(authFormData.email, authFormData.password, authFormData.full_name);
        if (error) throw error;

        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-fb-lead`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                full_name: authFormData.full_name,
                email: authFormData.email,
                phone: authFormData.phone,
                has_mooring: true,
                fb_campaign_name: 'Website Lead Form (Short Auth)',
              }),
            }
          );
        } catch (e) {
          console.error("Lead save failed", e);
        }

        const { data: { session: sessionAfterSignup } } = await supabase.auth.getSession();
        if (!sessionAfterSignup) {
          const { error: signInErr } = await signIn(authFormData.email, authFormData.password);
          if (signInErr) throw signInErr;
        }

        toast({ title: "Account created!", description: "You can now add your mooring." });
      } else {
        const { error } = await signIn(authFormData.email, authFormData.password);
        if (error) throw error;
        toast({ title: "Welcome back!" });
      }

      if (authFormData.phone) {
        setFormData(prev => ({ ...prev, phone: authFormData.phone }));
      }

      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const description = msg.toLowerCase().includes("rate limit")
        ? "Too many attempts. Please wait a few minutes and try again."
        : msg || "Something went wrong.";
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
      setAuthSubmitting(false);
    }
  };

  const monthlyAddOnCost = (formData.marketingTools ? 5 : 0) + (formData.premiumListing ? 9.99 : 0);
  const yearlyAddOnCost = formData.insuranceMediation ? 9.99 : 0;

  return {
    user,
    navigate,
    toast,
    showForm, setShowForm,
    isSubmitting,
    uploadingPhotos,
    showConsent, setShowConsent,
    mooringCount,
    justSubmitted, setJustSubmitted,
    lastMooringId,
    consentAccepted, setConsentAccepted,
    userMoorings,
    editingMooringId, setEditingMooringId,
    isCompletingListing, setIsCompletingListing,
    fullMooringData,
    fullCalendarDays,
    formData, setFormData,
    declarations, setDeclarations,
    calendarDays,
    autoOpenFromLead,
    authMode, setAuthMode,
    authFormData, setAuthFormData,
    authSubmitting,
    monthlyAddOnCost,
    yearlyAddOnCost,
    loadMooringForEdit,
    loadMooringForComplete,
    handlePublishComplete,
    downloadTerms,
    downloadPrivacy,
    toggleAmenity,
    togglePayment,
    toggleWinterService,
    toggleCalendarDay,
    handleDayPriceChange,
    handleSubmit,
    handleFinalConsent,
    handleAuthSubmit,
    refreshMoorings,
  };
}
