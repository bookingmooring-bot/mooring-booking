import { Anchor, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MooringFormData } from "@/components/provider/MooringForm";
import MooringForm from "@/components/provider/MooringForm";
import ProviderAuthSection from "@/components/provider/ProviderAuthSection";
import ProviderDashboard from "@/components/provider/ProviderDashboard";
import ProviderConsentModal from "@/components/provider/ProviderConsentModal";
import ProviderMooringForm from "@/components/provider/ProviderMooringForm";
import { useProviderForm } from "@/hooks/useProviderForm";

const ProviderMiniHeader = ({ mooringCount }: { mooringCount: number }) => {
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    window.location.reload();
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
  const form = useProviderForm();

  // Unauthenticated — show Auth form
  if (!form.showForm && !form.user) {
    return (
      <ProviderAuthSection
        authMode={form.authMode}
        setAuthMode={form.setAuthMode}
        authFormData={form.authFormData}
        setAuthFormData={form.setAuthFormData}
        authSubmitting={form.authSubmitting}
        onSubmit={form.handleAuthSubmit}
      />
    );
  }

  // Authenticated, no form open — show dashboard
  if (!form.showForm && form.user) {
    return (
      <div className="min-h-screen bg-muted">
        <ProviderMiniHeader mooringCount={form.mooringCount} />
        <ProviderDashboard
          mooringCount={form.mooringCount}
          justSubmitted={form.justSubmitted}
          lastMooringId={form.lastMooringId}
          userMoorings={form.userMoorings}
          onAddMooring={() => {
            form.setShowForm(true);
            form.setJustSubmitted(false);
            form.setIsCompletingListing(false);
          }}
          onEditMooring={form.loadMooringForEdit}
          onCompleteMooring={form.loadMooringForComplete}
        />
      </div>
    );
  }

  // Digital Consent Modal
  if (form.showConsent) {
    return (
      <div className="min-h-screen bg-muted">
        <ProviderMiniHeader mooringCount={form.mooringCount} />
        <ProviderConsentModal
          formData={form.formData}
          editingMooringId={form.editingMooringId}
          consentAccepted={form.consentAccepted}
          setConsentAccepted={form.setConsentAccepted}
          isSubmitting={form.isSubmitting}
          uploadingPhotos={form.uploadingPhotos}
          onBack={() => { form.setShowConsent(false); form.setConsentAccepted(false); }}
          onConfirm={form.handleFinalConsent}
        />
      </div>
    );
  }

  // Complete Listing Form (full MooringForm component)
  if (form.showForm && form.isCompletingListing && form.fullMooringData && form.fullCalendarDays) {
    return (
      <div className="min-h-screen bg-muted">
        <ProviderMiniHeader mooringCount={form.mooringCount} />
        <main className="py-12">
          <MooringForm
            initialData={form.fullMooringData as MooringFormData}
            initialCalendarDays={form.fullCalendarDays}
            onSubmit={form.handlePublishComplete}
            isSubmitting={form.isSubmitting}
            submitLabel="Save Details"
          />
        </main>
      </div>
    );
  }

  // Registration / Edit Form
  return (
    <div className="min-h-screen bg-muted">
      <ProviderMiniHeader mooringCount={form.mooringCount} />
      <main className="py-12">
        <ProviderMooringForm
          user={form.user!}
          formData={form.formData}
          setFormData={form.setFormData}
          declarations={form.declarations}
          setDeclarations={form.setDeclarations}
          editingMooringId={form.editingMooringId}
          autoOpenFromLead={form.autoOpenFromLead}
          toggleAmenity={form.toggleAmenity}
          downloadTerms={form.downloadTerms}
          downloadPrivacy={form.downloadPrivacy}
          onSubmit={form.handleSubmit}
          onCancel={() => {
            form.setShowForm(false);
            form.setEditingMooringId(null);
          }}
        />
      </main>
    </div>
  );
};

export default BecomeProviderPage;
