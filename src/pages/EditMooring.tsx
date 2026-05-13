import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MooringForm, { MooringFormData, generateCalendarDays } from "@/components/provider/MooringForm";
import { CalendarDay } from "@/components/MonthlyCalendar";
import { Loader2 } from "lucide-react";

const EditMooring = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialData, setInitialData] = useState<Partial<MooringFormData> | null>(null);
    const [initialCalendarDays, setInitialCalendarDays] = useState<CalendarDay[] | null>(null);

    useEffect(() => {
        const fetchMooringData = async () => {
            if (!id || !user) return;
            try {
                // Fetch mooring metadata
                const { data: dbMooring, error } = await supabase
                    .from('moorings')
                    .select('*, owner:profiles!owner_id(address, phone, whatsapp)')
                    .eq('id', id)
                    .eq('owner_id', user.id) // security check
                    .single();

                if (error) throw error;
                if (!dbMooring) throw new Error("Mooring not found");

                // We mock calendar parsing from DB logic loosely for now, or just provide full blank
                // In reality, we would fetch `mooring_availability` and populate `initialCalendarDays`
                // Setup base data mapping:
                setInitialData({
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
                    // To properly preload images we need File[] array, but we have string URIs 
                    // (It's acceptable to handle it differently, or just let users add to existing ones.
                    // For now we start empty to let them upload MORE if they want, but show note.)
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

                // Initialize empty baseline calendar to maintain state
                const baseline = generateCalendarDays();
                // Here we ideally fetch `mooring_availability` 
                const { data: availData } = await supabase
                    .from('mooring_availability')
                    .select('*')
                    .eq('mooring_id', id);

                if (availData) {
                    availData.forEach(ad => {
                        const dayIndex = baseline.findIndex(bd => bd.date.toISOString().split('T')[0] === ad.date);
                        if (dayIndex !== -1) {
                            baseline[dayIndex].available = ad.available;
                            baseline[dayIndex].customPrice = ad.custom_price || undefined;
                        }
                    });
                }
                setInitialCalendarDays(baseline);
            } catch (err: unknown) {
                toast({ title: "Error loading mooring", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMooringData();
    }, [id, user, navigate, toast]);

    const handlePublish = async (formData: MooringFormData, calendarDays: CalendarDay[]) => {
        if (!user || !id) return;
        setIsSubmitting(true);
        try {
            const imageUrls: string[] = [];
            // If there are new photos uploaded
            for (const file of formData.photos) {
                const fileExt = file.name.split('.').pop();
                const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('mooring-images')
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('mooring-images')
                    .getPublicUrl(filePath);
                imageUrls.push(urlData.publicUrl);
            }

            // Instead of an RPC, we individually update rows:
            const { error: updateError } = await supabase
                .from('moorings')
                .update({
                    name: formData.mooringName,
                    country: formData.country,
                    location: formData.region,
                    lat: parseFloat(formData.latitude),
                    lng: parseFloat(formData.longitude),
                    description: formData.description,
                    wind_protection: formData.windProtection,
                    amenities: formData.amenities,
                    max_boat_length: parseFloat(formData.maxBoatLength) || null,
                    max_draft: parseFloat(formData.maxDraft) || null,
                    mooring_units: parseInt(formData.mooringUnits) || 1,
                    price_per_night: parseFloat(formData.pricePerNight),
                    discount_percent: formData.discount[0] || 0,
                    payment_methods: formData.paymentMethods,
                    is_now4today: formData.now4today,
                    winter_storage: formData.winterStorage,
                    winter_storage_type: formData.winterStorageType,
                    winter_price_monthly: parseFloat(formData.winterPriceMonthly) || 0,
                    winter_services: formData.winterServices,
                    marketing_tools: formData.marketingTools,
                    is_premium_listing: formData.premiumListing,
                    insurance_mediation: formData.insuranceMediation,
                    status: 'pending', // Re-trigger moderation on sensitive edits (name/price)
                    // Note: If you want to merge images rather than replace, you'd fetch existing array
                    // and append. For now we append if new exist, else keep old. We do this smartly:
                    ...(imageUrls.length > 0 ? { image_urls: imageUrls } : {})
                })
                .eq('id', id)
                .eq('owner_id', user.id);

            if (updateError) throw updateError;

            // Update profile with contact info
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    address: formData.address,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update calendar availability:
            const availabilityList = calendarDays.map(day => ({
                mooring_id: id,
                date: day.date.toISOString().split('T')[0],
                available: day.available,
                custom_price: day.customPrice || 0
            }));

            // Upsert logic for calendar
            const { error: availError } = await supabase
                .from('mooring_availability')
                .upsert(availabilityList, { onConflict: 'mooring_id,date' });

            if (availError) throw availError;

            toast({
                title: "✅ Mooring Updated!",
                description: "Your edits have been submitted. Depending on changes, it might require review.",
            });
            navigate('/dashboard');
        } catch (err: unknown) {
            console.error('Updating mooring error:', err);
            toast({ title: "Error", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !initialData || !initialCalendarDays) {
        return (
            <div className="min-h-screen bg-muted flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted">
            <Header />
            <main className="pt-28 pb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-10 text-center">
                            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                                Edit Mooring
                            </h1>
                            <p className="text-muted-foreground">
                                Update details or adjust pricing for this specific mooring.
                            </p>
                        </div>

                        <MooringForm
                            initialData={initialData}
                            initialCalendarDays={initialCalendarDays}
                            onSubmit={handlePublish}
                            isSubmitting={isSubmitting}
                            submitLabel="Save Changes"
                            isNewProvider={false}
                        />

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EditMooring;
