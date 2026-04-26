import { FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ProviderFormData } from "@/hooks/useProviderForm";

interface ProviderConsentModalProps {
  formData: ProviderFormData;
  editingMooringId: string | null;
  consentAccepted: boolean;
  setConsentAccepted: (v: boolean) => void;
  isSubmitting: boolean;
  uploadingPhotos: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ProviderConsentModal({
  formData, editingMooringId,
  consentAccepted, setConsentAccepted,
  isSubmitting, uploadingPhotos,
  onBack, onConfirm,
}: ProviderConsentModalProps) {
  return (
    <main className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-hover">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-secondary" size={32} />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                {editingMooringId ? 'Review Changes' : 'Digital Consent Agreement'}
              </h1>
              <p className="text-muted-foreground">
                {editingMooringId
                  ? 'Please review the terms before saving your changes.'
                  : 'Please review the terms before publishing your mooring.'}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-muted rounded-lg p-4 text-sm text-foreground leading-relaxed max-h-60 overflow-y-auto">
                <h3 className="font-semibold mb-2">Summary of Terms of Use</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>I confirm that I am the owner or authorised user of the listed mooring.</li>
                  <li>I agree to a 12% commission on every confirmed booking.</li>
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
                  I have read and accept all the terms listed above and agree to the {editingMooringId ? 'update' : 'publication'} of my mooring on the Mooring Booking platform.
                </Label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
              <Button
                variant="outline"
                className="w-full sm:flex-1 h-12"
                onClick={onBack}
              >
                ← Back to editing
              </Button>
              <Button
                className="w-full sm:flex-1 bg-gradient-ocean font-semibold h-12"
                disabled={!consentAccepted || isSubmitting}
                onClick={onConfirm}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                    {uploadingPhotos ? 'Uploading photos...' : (editingMooringId ? 'Saving...' : 'Publishing...')}
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
  );
}
