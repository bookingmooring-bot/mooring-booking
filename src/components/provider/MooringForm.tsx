import { useState, useCallback } from "react";
import {
    Anchor, Shield, Camera, X, Snowflake, MessageSquare, Crown, Megaphone,
    CreditCard, MapPin, Check, BarChart3, Zap, FileText, QrCode, Upload, Calendar
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
import MonthlyCalendar, { CalendarDay } from "@/components/MonthlyCalendar";
import CoordinatePickerMap from "./CoordinatePickerMap";

export const countries = [
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

export const amenitiesList = [
    { id: "water", label: "Fresh Water", icon: "💧" },
    { id: "electricity", label: "Electricity", icon: "⚡" },
    { id: "wifi", label: "WiFi", icon: "📶" },
    { id: "toilet", label: "Toilet", icon: "🚽" },
    { id: "shower", label: "Shower", icon: "🚿" },
    { id: "fuel", label: "Fuel", icon: "⛽" },
    { id: "restaurant", label: "Restaurant", icon: "🍽️" },
];

export const paymentMethodsList = [
    { id: "cash", label: "Cash", icon: "💵" },
    { id: "maestro", label: "Maestro", icon: "💳" },
    { id: "visa", label: "Visa/Mastercard", icon: "💳" },
    { id: "paypal", label: "PayPal", icon: "🅿️" },
    { id: "googlepay", label: "Google Pay", icon: "📱" },
];

export const winterServicesList = [
    { id: "winterization", label: "Winterization", icon: "🔧" },
    { id: "hull_cleaning", label: "Hull Cleaning", icon: "🧹" },
    { id: "mast_storage", label: "Mast Storage", icon: "🏗️" },
    { id: "electricity_winter", label: "Electricity", icon: "⚡" },
    { id: "water_winter", label: "Water", icon: "💧" },
    { id: "security", label: "24/7 Security", icon: "🔒" },
];

export interface MooringFormData {
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
    address: string;
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

interface MooringFormProps {
    initialData?: Partial<MooringFormData>;
    initialCalendarDays?: CalendarDay[];
    onSubmit: (data: MooringFormData, calendarDays: CalendarDay[]) => void;
    isSubmitting: boolean;
    submitLabel?: string;
    isNewProvider?: boolean;
}

export const generateCalendarDays = (): CalendarDay[] => {
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

const MooringForm = ({
    initialData,
    initialCalendarDays,
    onSubmit,
    isSubmitting,
    submitLabel = "Save Mooring",
    isNewProvider = false
}: MooringFormProps) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState<MooringFormData>({
        mooringName: initialData?.mooringName || "",
        country: initialData?.country || "",
        region: initialData?.region || "",
        latitude: initialData?.latitude || "",
        longitude: initialData?.longitude || "",
        description: initialData?.description || "",
        windProtection: initialData?.windProtection || "good",
        amenities: initialData?.amenities || [],
        maxBoatLength: initialData?.maxBoatLength || "",
        maxDraft: initialData?.maxDraft || "",
        pricePerNight: initialData?.pricePerNight || "",
        discount: initialData?.discount || [10],
        paymentMethods: initialData?.paymentMethods || [],
        photos: initialData?.photos || [],
        address: initialData?.address || "",
        phone: initialData?.phone || "",
        whatsapp: initialData?.whatsapp || "",
        winterStorage: initialData?.winterStorage || false,
        winterStorageType: initialData?.winterStorageType || "wet",
        winterPriceMonthly: initialData?.winterPriceMonthly || "",
        winterServices: initialData?.winterServices || [],
        marketingTools: initialData?.marketingTools || false,
        premiumListing: initialData?.premiumListing || false,
        insuranceMediation: initialData?.insuranceMediation || false,
        now4today: initialData?.now4today || false,
        mooringUnits: initialData?.mooringUnits || "1",
    });

    const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(initialCalendarDays || generateCalendarDays());

    // For new providers, we embed the declarations in the form itself based on the old flow
    const [declarations, setDeclarations] = useState({
        ownership: false,
        commission: false,
        terms: false,
        dataTransfer: false,
    });

    const toggleAmenity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(id) ? prev.amenities.filter(a => a !== id) : [...prev.amenities, id]
        }));
    };

    const togglePayment = (id: string) => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.includes(id) ? prev.paymentMethods.filter(p => p !== id) : [...prev.paymentMethods, id]
        }));
    };

    const toggleWinterService = (id: string) => {
        setFormData(prev => ({
            ...prev,
            winterServices: prev.winterServices.includes(id) ? prev.winterServices.filter(s => s !== id) : [...prev.winterServices, id]
        }));
    };

    const toggleCalendarDay = (index: number) => {
        setCalendarDays(prev => prev.map((day, i) => i === index ? { ...day, available: !day.available } : day));
    };

    const handleDayPriceChange = (index: number, price: number) => {
        setCalendarDays(prev => prev.map((day, i) => i === index ? { ...day, customPrice: price > 0 ? price : undefined } : day));
    };

    const monthlyAddOnCost = (formData.marketingTools ? 5 : 0) + (formData.premiumListing ? 9.99 : 0);
    const yearlyAddOnCost = formData.insuranceMediation ? 9.99 : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isNewProvider) {
            if (!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer) return;
        }
        onSubmit(formData, calendarDays);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
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
                        <Label>{t('provider.country')} *</Label>
                        <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
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
                    </div>
                </div>
            </div>

            {/* Mooring Details */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Shield className="text-secondary" size={24} />
                    Mooring Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>{t('provider.windProtection')} *</Label>
                        <Select value={formData.windProtection} onValueChange={(value) => setFormData(prev => ({ ...prev, windProtection: value }))}>
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
                        <Input id="maxBoatLength" type="number" placeholder="15" value={formData.maxBoatLength} onChange={(e) => setFormData(prev => ({ ...prev, maxBoatLength: e.target.value }))} className="mt-2" required />
                    </div>
                    <div>
                        <Label htmlFor="maxDraft">{t('provider.maxDraft')} *</Label>
                        <Input id="maxDraft" type="number" step="0.1" placeholder="3.5" value={formData.maxDraft} onChange={(e) => setFormData(prev => ({ ...prev, maxDraft: e.target.value }))} className="mt-2" required />
                    </div>
                    <div>
                        <Label htmlFor="mooringUnits">{t('provider.mooringUnits')}</Label>
                        <Select value={formData.mooringUnits} onValueChange={(value) => setFormData(prev => ({ ...prev, mooringUnits: value }))}>
                            <SelectTrigger className="mt-2"><SelectValue placeholder="1" /></SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Label>{t('provider.amenities')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            {amenitiesList.map((amenity) => (
                                <button
                                    key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)}
                                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.amenities.includes(amenity.id) ? "bg-secondary/10 border-secondary text-secondary" : "bg-muted border-border text-muted-foreground hover:border-secondary/50"}`}
                                >
                                    <span>{amenity.icon}</span><span className="text-sm font-medium">{amenity.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Winter Storage */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Snowflake className="text-secondary" size={24} />
                    {t('provider.winterBerth')}
                </h2>
                <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                    <div><Label className="text-base font-semibold">{t('provider.offerWinterStorage')}</Label></div>
                    <Switch checked={formData.winterStorage} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, winterStorage: checked }))} />
                </div>
                {formData.winterStorage && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>{t('provider.winterStorageType')} *</Label>
                            <Select value={formData.winterStorageType} onValueChange={(value: "wet" | "dry" | "both") => setFormData(prev => ({ ...prev, winterStorageType: value }))}>
                                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wet">🌊 {t('provider.wetStorage')}</SelectItem>
                                    <SelectItem value="dry">🏗️ {t('provider.dryStorage')}</SelectItem>
                                    <SelectItem value="both">🔄 {t('provider.bothStorage')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="winterPrice">{t('provider.winterPriceMonthly')} *</Label>
                            <Input id="winterPrice" type="number" placeholder="250" value={formData.winterPriceMonthly} onChange={(e) => setFormData(prev => ({ ...prev, winterPriceMonthly: e.target.value }))} className="mt-2" />
                        </div>
                        <div className="md:col-span-2">
                            <Label>{t('provider.winterServices')}</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                                {winterServicesList.map((service) => (
                                    <button key={service.id} type="button" onClick={() => toggleWinterService(service.id)} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.winterServices.includes(service.id) ? "bg-secondary/10 border-secondary text-secondary" : "bg-muted border-border text-muted-foreground hover:border-secondary/50"}`}>
                                        <span>{service.icon}</span><span className="text-sm font-medium">{service.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <CreditCard className="text-secondary" size={24} />
                    {t('provider.pricingPayment')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="pricePerNight">{t('provider.pricePerNight')} *</Label>
                        <Input id="pricePerNight" type="number" placeholder="45" value={formData.pricePerNight} onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: e.target.value }))} className="mt-2" required />
                    </div>
                    <div>
                        <Label>{t('provider.discount')}: {formData.discount[0]}%</Label>
                        <Slider value={formData.discount} onValueChange={(value) => setFormData(prev => ({ ...prev, discount: value }))} min={0} max={50} step={5} className="mt-4" />
                    </div>
                    <div className="md:col-span-2">
                        <div className="p-4 rounded-lg bg-orange-500/5">
                            <Switch checked={formData.now4today} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, now4today: checked }))} />
                            <Label className="ml-2">Enable Now4Today (Last minute booking deals)</Label>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <Label>{t('provider.paymentMethods')} *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                            {paymentMethodsList.map((method) => (
                                <button key={method.id} type="button" onClick={() => togglePayment(method.id)} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.paymentMethods.includes(method.id) ? "bg-secondary/10 border-secondary text-secondary" : "bg-muted border-border text-muted-foreground hover:border-secondary/50"}`}>
                                    <span>{method.icon}</span><span className="text-sm font-medium">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Paid Add-Ons */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Crown className="text-gold" size={24} />
                    {t('provider.premiumAddOns')}
                </h2>
                <div className="space-y-4">
                    {/* Toggles */}
                    <div className={`p-4 rounded-lg border-2 ${formData.marketingTools ? 'border-gold bg-gold/5' : 'border-border'}`}>
                        <span className="font-bold">€5/mo</span> <Switch checked={formData.marketingTools} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingTools: checked }))} />
                        <Label className="ml-2">Marketing Tools</Label>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${formData.premiumListing ? 'border-gold bg-gold/5' : 'border-border'}`}>
                        <span className="font-bold">€9.99/mo</span> <Switch checked={formData.premiumListing} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, premiumListing: checked }))} />
                        <Label className="ml-2">Premium Listing</Label>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${formData.insuranceMediation ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'}`}>
                        <span className="font-bold">€9.99/yr</span> <Switch checked={formData.insuranceMediation} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, insuranceMediation: checked }))} />
                        <Label className="ml-2">Mooring Insurance</Label>
                    </div>
                </div>
            </div>

            {/* Photos */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Camera className="text-secondary" size={24} />
                    {t('provider.uploadPhotos')}
                </h2>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <Upload className="mx-auto text-muted-foreground mb-4" size={40} />
                    <p className="text-muted-foreground">{t('provider.dragDrop')}</p>
                    <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
                    }} />
                </div>
                {formData.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
                        {formData.photos.map((file, idx) => (
                            <div key={idx} className="relative group">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Calendar */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Calendar className="text-secondary" size={24} />
                    {t('provider.calendar')}
                </h2>
                <MonthlyCalendar year={2026} calendarDays={calendarDays} onToggle={toggleCalendarDay} onPriceChange={handleDayPriceChange} basePrice={parseFloat(formData.pricePerNight) || 0} />
            </div>

            {/* Contact Info */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="text-secondary" size={24} />
                    Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><Label htmlFor="address">Address *</Label><Input id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="mt-2" required /></div>
                    <div><Label htmlFor="phone">Phone *</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-2" required /></div>
                    <div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} className="mt-2" /></div>
                </div>
            </div>

            {/* Declarations (Only for New Providers doing Onboarding) */}
            {isNewProvider && (
                <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                    <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                        <FileText className="text-secondary" size={24} />
                        {t('provider.declarations')}
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3"><Checkbox checked={declarations.ownership} onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, ownership: checked as boolean }))} /><Label>I own this mooring.</Label></div>
                        <div className="flex items-start gap-3"><Checkbox checked={declarations.commission} onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, commission: checked as boolean }))} /><Label>I accept 15% commission.</Label></div>
                        <div className="flex items-start gap-3"><Checkbox checked={declarations.terms} onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, terms: checked as boolean }))} /><Label>I accept terms.</Label></div>
                        <div className="flex items-start gap-3"><Checkbox checked={declarations.dataTransfer} onCheckedChange={(checked) => setDeclarations(prev => ({ ...prev, dataTransfer: checked as boolean }))} /><Label>I consent to data transfer.</Label></div>
                    </div>
                </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full bg-gradient-ocean font-semibold h-12" disabled={isSubmitting || (isNewProvider && (!declarations.ownership || !declarations.commission || !declarations.terms || !declarations.dataTransfer))}>
                {isSubmitting ? <span className="animate-pulse">Saving...</span> : <><QrCode className="mr-2" size={20} /> {submitLabel}</>}
            </Button>
        </form>
    );
};

export default MooringForm;
