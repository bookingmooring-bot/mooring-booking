import { User } from "@supabase/supabase-js";
import {
  Anchor, Check, Shield, QrCode, MapPin, FileText,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries, amenities, mooringTypes } from "@/data/providerConstants";
import type { ProviderFormData, Declarations } from "@/hooks/useProviderForm";

interface ProviderMooringFormProps {
  user: User;
  formData: ProviderFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>;
  declarations: Declarations;
  setDeclarations: React.Dispatch<React.SetStateAction<Declarations>>;
  editingMooringId: string | null;
  autoOpenFromLead: boolean;
  toggleAmenity: (id: string) => void;
  downloadTerms: (e: React.MouseEvent) => void;
  downloadPrivacy: (e: React.MouseEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ProviderMooringForm({
  user, formData, setFormData,
  declarations, setDeclarations,
  editingMooringId, autoOpenFromLead,
  toggleAmenity, downloadTerms, downloadPrivacy,
  onSubmit, onCancel,
}: ProviderMooringFormProps) {
  const mooringCount = 0; // placeholder for stepper logic — stepper shown only for new listings
  const showLeadStepper = !editingMooringId;
  const autoOpenedFromAuth = !editingMooringId;
  const showLeadWelcomeBadge = autoOpenedFromAuth && !!user;
  const showFacebookPrefillHint = autoOpenFromLead && !editingMooringId;

  const pickName = (v: string | undefined) =>
    v && !/^<test lead/i.test(v.trim()) ? v.split(' ')[0] : '';
  const leadFirstName = pickName(user?.user_metadata?.full_name as string | undefined)
    || pickName(user?.user_metadata?.name as string | undefined)
    || (user?.email ? user.email.split('@')[0] : '');

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        {showLeadStepper && (
          <div className="bg-card rounded-xl p-6 shadow-card mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <Check size={20} strokeWidth={3} />
                </div>
                <span className="text-xs md:text-sm mt-2 text-center text-foreground font-medium">
                  Account created
                </span>
              </div>
              <div className="flex-1 h-1 bg-emerald-500 -mx-2 mb-6 rounded-full" />
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shrink-0 ring-4 ring-blue-500/20 animate-pulse">
                  2
                </div>
                <span className="text-xs md:text-sm mt-2 text-center text-foreground font-semibold">
                  Publish your mooring
                </span>
              </div>
              <div className="flex-1 h-1 bg-muted -mx-2 mb-6 rounded-full" />
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                  3
                </div>
                <span className="text-xs md:text-sm mt-2 text-center text-muted-foreground">
                  First booking
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-10">
          {showLeadWelcomeBadge && leadFirstName && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Check size={16} strokeWidth={3} />
              Welcome, {leadFirstName}! You're signed in.
            </div>
          )}
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {editingMooringId ? 'Edit Your Mooring' : 'Publish Your Mooring'}
          </h1>
          <p className="text-muted-foreground">
            {editingMooringId
              ? 'Update the details for your mooring'
              : showFacebookPrefillHint
                ? "We've pre-filled some details from your Facebook form. Just finish the rest and publish your listing."
                : showLeadWelcomeBadge
                  ? "Fill in the details below to publish your first mooring and start earning."
                  : 'Fill in the details about your mooring to publish it on the platform'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
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
                              onChange={() => {
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

          {/* Declarations & Consents */}
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
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-ocean font-semibold h-12"
              disabled={!declarations.ownership || !declarations.terms || !declarations.dataTransfer}
            >
              <QrCode className="mr-2" size={20} />
              {editingMooringId ? 'Continue to Save' : 'Publish Mooring'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
