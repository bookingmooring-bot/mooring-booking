import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MooringForm, { MooringFormData } from "@/components/provider/MooringForm";
import { CalendarDay } from "@/components/MonthlyCalendar";

const AddMooring = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePublish = async (formData: MooringFormData, calendarDays: CalendarDay[]) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            // 1. Upload photos
            const imageUrls: string[] = [];
            for (const file of formData.photos) {
                const fileExt = file.name.split('.').pop();
                const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error } = await supabase.storage
                    .from('mooring-images')
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });

                if (error) throw error;

                const { data: urlData } = supabase.storage
                    .from('mooring-images')
                    .getPublicUrl(filePath);
                imageUrls.push(urlData.publicUrl);
            }

            // 2. Prepare availability
            const availability = calendarDays
                .filter(day => !day.available || (day.customPrice && day.customPrice > 0))
                .map(day => ({
                    date: day.date.toISOString().split('T')[0],
                    available: day.available,
                    custom_price: day.customPrice || 0,
                }));

            // 3. Call RPC. We can use the existing `publish_provider_profile` RPC.
            // If the user is already a 'provider', the DB just keeps their role.
            // However, check if `publish_provider_profile` supports inserting new moorings properly
            // under the same user. Yes, it does a simple INSERT into the moorings table.
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
                p_discount_percent: formData.discount[0] || 0,
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

            if (error) {
                console.error('RPC Error details:', error);
                throw error;
            }

            toast({
                title: "✅ Mooring Added!",
                description: "Your new mooring has been submitted and is pending review.",
            });
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Adding mooring error:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to add new mooring. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted">
            <Header />
            <main className="pt-28 pb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-10 text-center">
                            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                                Add New Mooring
                            </h1>
                            <p className="text-muted-foreground">
                                Expand your portfolio by adding another location.
                            </p>
                        </div>

                        <MooringForm
                            onSubmit={handlePublish}
                            isSubmitting={isSubmitting}
                            submitLabel="Submit New Mooring"
                            isNewProvider={false}
                        />

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AddMooring;
