import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProviderMoorings } from "@/hooks/useMoorings";
import { useToast } from "@/hooks/use-toast";
import MonthlyCalendar, { CalendarDay } from "@/components/MonthlyCalendar";
import { Loader2, Calendar as CalendarIcon, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { generateCalendarDays } from "@/components/provider/MooringForm";

const ProviderCalendar = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { data: moorings, isLoading: mooringsLoading } = useProviderMoorings(user?.id);

    const [selectedMooringId, setSelectedMooringId] = useState<string>("");
    const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
    const [isAvailLoading, setIsAvailLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Set default selected mooring once data loads
    useEffect(() => {
        if (moorings && moorings.length > 0 && !selectedMooringId) {
            setSelectedMooringId(moorings[0].id);
        }
    }, [moorings, selectedMooringId]);

    // Fetch availability when selected mooring changes
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!selectedMooringId || !user) return;

            setIsAvailLoading(true);
            setHasChanges(false);

            try {
                const baseline = generateCalendarDays();

                const { data: availData, error } = await supabase
                    .from('mooring_availability')
                    .select('*')
                    .eq('mooring_id', selectedMooringId);

                if (error) throw error;

                if (availData && availData.length > 0) {
                    availData.forEach(ad => {
                        const dayIndex = baseline.findIndex(bd => bd.date.toISOString().split('T')[0] === ad.date);
                        if (dayIndex !== -1) {
                            baseline[dayIndex].available = ad.available;
                            baseline[dayIndex].customPrice = ad.custom_price || undefined;
                        }
                    });
                }

                setCalendarDays(baseline);
            } catch (err: any) {
                toast({ title: "Error loading availability", description: err.message, variant: "destructive" });
            } finally {
                setIsAvailLoading(false);
            }
        };

        fetchAvailability();
    }, [selectedMooringId, user, toast]);

    const handleToggle = (index: number) => {
        setCalendarDays(prev => prev.map((day, i) => i === index ? { ...day, available: !day.available } : day));
        setHasChanges(true);
    };

    const handlePriceChange = (index: number, price: number) => {
        setCalendarDays(prev => prev.map((day, i) => i === index ? { ...day, customPrice: price > 0 ? price : undefined } : day));
        setHasChanges(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedMooringId || !user) return;
        setIsSaving(true);

        try {
            const availabilityList = calendarDays.map(day => ({
                mooring_id: selectedMooringId,
                date: day.date.toISOString().split('T')[0],
                available: day.available,
                custom_price: day.customPrice || 0,
                provider_id: user.id
            }));

            const { error } = await supabase
                .from('mooring_availability')
                .upsert(availabilityList, { onConflict: 'mooring_id,date' });

            if (error) throw error;

            toast({ title: "✅ Availability Saved", description: "Calendar has been successfully updated." });
            setHasChanges(false);
        } catch (err: any) {
            toast({ title: "Error saving changes", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (mooringsLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={24} /></div>;
    }

    if (!moorings || moorings.length === 0) {
        return (
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <p className="text-muted-foreground">You don't have any moorings yet to manage availability.</p>
            </div>
        );
    }

    const selectedMooringData = moorings.find(m => m.id === selectedMooringId);

    return (
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <CalendarIcon className="text-primary" /> Calendar & Availability
                </h2>

                {hasChanges && (
                    <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-gradient-ocean w-full sm:w-auto">
                        {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                        Save Changes
                    </Button>
                )}
            </div>

            <div className="mb-8">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Mooring to Manage</label>
                <Select value={selectedMooringId} onValueChange={setSelectedMooringId}>
                    <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select a mooring" />
                    </SelectTrigger>
                    <SelectContent>
                        {moorings.map((mooring) => (
                            <SelectItem key={mooring.id} value={mooring.id}>
                                {mooring.name} — ({mooring.location})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isAvailLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
            ) : (
                <div className="opacity-100 transition-opacity duration-300">
                    {selectedMooringId && (
                        <MonthlyCalendar
                            year={2026}
                            calendarDays={calendarDays}
                            onToggle={handleToggle}
                            onPriceChange={handlePriceChange}
                            basePrice={selectedMooringData?.price}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ProviderCalendar;
