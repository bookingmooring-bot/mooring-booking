import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, User, Check, Phone, Loader2, Info, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfToday, addDays, differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateConciergeRequest } from "@/hooks/useConciergeBooking";
import { calculateServiceFee } from "@/lib/subscription";
import { Link } from "react-router-dom";

interface ConciergeBookingModalProps {
  mooring: {
    id: string;
    name: string;
    location: string;
    country: string;
    price: number;
    image: string;
  };
  isOpen: boolean;
  onClose: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

const ConciergeBookingModal = ({ mooring, isOpen, onClose, initialCheckIn, initialCheckOut }: ConciergeBookingModalProps) => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const conciergeRequest = useCreateConciergeRequest();

  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [formData, setFormData] = useState({
    boatName: "",
    boatLength: "",
    specialRequests: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });
  const [requestResult, setRequestResult] = useState<{ bookingId: string; expiresAt: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        boatName: prev.boatName || profile?.boat_name || "",
        boatLength: prev.boatLength || (profile?.boat_length ? profile.boat_length.toString() : ""),
        guestName: prev.guestName || profile?.full_name || "",
        guestPhone: prev.guestPhone || profile?.phone || "",
        guestEmail: prev.guestEmail || user?.email || "",
      }));
      if (initialCheckIn && initialCheckOut) {
        setDateRange({
          from: new Date(initialCheckIn),
          to: new Date(initialCheckOut),
        });
      }
    }
  }, [isOpen, profile, user, initialCheckIn, initialCheckOut]);

  if (!isOpen) return null;

  const boatLengthNum = parseFloat(formData.boatLength) || null;
  const serviceFee = calculateServiceFee(boatLengthNum, profile);
  const nights = dateRange.from && dateRange.to
    ? Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from))
    : 0;
  const estimatedMooringTotal = nights > 0 ? mooring.price * nights : 0;

  const handleSubmitRequest = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (!user) {
      toast.error("Please sign in to submit a booking request");
      return;
    }

    try {
      const result = await conciergeRequest.mutateAsync({
        mooringId: mooring.id,
        bookingData: {
          checkIn: format(dateRange.from, 'yyyy-MM-dd'),
          checkOut: format(dateRange.to, 'yyyy-MM-dd'),
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          boatName: formData.boatName,
          boatLength: boatLengthNum,
          specialRequests: formData.specialRequests || undefined,
        },
        serviceFeeAmount: serviceFee,
      });
      setRequestResult({ bookingId: result.bookingId, expiresAt: result.expiresAt });
      setStep(4);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    }
  };

  const stepLabels = ["Vessel", "Contact", "Authorize", "Sent"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-hover w-full max-w-lg max-h-[95vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-heading font-bold text-foreground">{t('concierge.title', 'Concierge Booking')}</h2>
            <p className="text-sm text-muted-foreground">{mooring.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 py-3 px-4">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i + 1 <= step
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1 < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
              {i < stepLabels.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Step 1: Vessel Details */}
          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Boat Name *</label>
                <Input
                  value={formData.boatName}
                  onChange={(e) => setFormData(p => ({ ...p, boatName: e.target.value }))}
                  placeholder="e.g. Sea Breeze"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Boat Length (meters) *</label>
                <Input
                  type="number"
                  value={formData.boatLength}
                  onChange={(e) => setFormData(p => ({ ...p, boatLength: e.target.value }))}
                  placeholder="e.g. 12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Preferred Dates *</label>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined })}
                  disabled={(date) => isBefore(date, startOfToday())}
                  className="rounded-lg border mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Special Requests</label>
                <Textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(p => ({ ...p, specialRequests: e.target.value }))}
                  placeholder="Any special requirements..."
                  rows={3}
                />
              </div>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!formData.boatName || !formData.boatLength || !dateRange.from || !dateRange.to}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <Input
                  value={formData.guestName}
                  onChange={(e) => setFormData(p => ({ ...p, guestName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email *</label>
                <Input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData(p => ({ ...p, guestEmail: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone *</label>
                <Input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData(p => ({ ...p, guestPhone: e.target.value }))}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t('concierge.requestNotConfirmed', 'This is a booking request, not a confirmed reservation. The marina will be contacted on your behalf through our Concierge service.')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!formData.guestName || !formData.guestEmail || !formData.guestPhone}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Authorization */}
          {step === 3 && (
            <>
              <div className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('concierge.mooring', 'Mooring')}</span>
                  <span className="font-medium">{mooring.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('concierge.dates', 'Dates')}</span>
                  <span className="font-medium">
                    {dateRange.from && format(dateRange.from, 'dd MMM')} – {dateRange.to && format(dateRange.to, 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('concierge.vessel', 'Vessel')}</span>
                  <span className="font-medium">{formData.boatName} ({formData.boatLength}m)</span>
                </div>

                {/* Estimated minimum mooring price — paid to the marina, not charged now */}
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('concierge.estimatedMinPrice', 'Estimated minimum price')}</span>
                  <span className="text-right">
                    <span className="font-medium">{t('concierge.fromPerNight', 'from €{{price}}/night', { price: mooring.price })}</span>
                    {estimatedMooringTotal > 0 && (
                      <span className="block text-xs text-muted-foreground font-normal">
                        ≈ €{estimatedMooringTotal} · {nights} {t('booking.nights', 'nights')}
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('concierge.estimatedMinPriceNote', 'Paid to the marina on arrival — not charged now, and may be higher.')}
                </p>

                <div className="border-t pt-2 flex justify-between text-sm font-bold">
                  <span>{t('concierge.serviceFeeHold', 'Concierge fee (authorization hold)')}</span>
                  <span className="text-blue-500">€{serviceFee}</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{t('concierge.howAuthTitle', 'How authorization works:')}</p>
                  <p>{t('concierge.authLine1', { defaultValue: 'Your card will be authorized for €{{fee}} (Concierge fee only). You will only be charged if the marina confirms.', fee: serviceFee })}</p>
                  <p>{t('concierge.authLine2', 'If declined or no response, the hold is automatically released — no charge.')}</p>
                  <p>{t('concierge.authLine3', 'You pay the marina directly for the berth on arrival.')}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>{t('booking.back', 'Back')}</Button>
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={conciergeRequest.isPending}
                  onClick={handleSubmitRequest}
                >
                  {conciergeRequest.isPending ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> {t('concierge.processing', 'Processing...')}</>
                  ) : (
                    <>{t('concierge.sendRequest', { defaultValue: 'Send Request & Authorize €{{fee}}', fee: serviceFee })}</>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Request Sent */}
          {step === 4 && requestResult && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-blue-500" />
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground">{t('concierge.requestSentTitle', 'Reservation request sent')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('concierge.requestSentBody', { defaultValue: 'Your reservation request for {{name}} has been sent.', name: mooring.name })}
              </p>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-foreground">
                {t('concierge.awaitingMarina', "We are awaiting the marina's final confirmation. Average response time is 1–24h. Please be patient.")}
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-3 text-left">
                <div className="flex items-start gap-2 text-sm">
                  <Clock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>{t('concierge.responseWindow', 'The marina has up to 48 hours to respond.')}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check size={16} className="text-success shrink-0 mt-0.5" />
                  <span>{t('concierge.outcomeConfirmed', "Confirmed — Concierge fee charged, you receive the marina's contact details.")}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <X size={16} className="text-destructive shrink-0 mt-0.5" />
                  <span>{t('concierge.outcomeDeclined', 'Declined — hold released, no charge.')}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Clock size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                  <span>{t('concierge.outcomeNoResponse', 'No response — hold automatically released after 48h.')}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  {t('concierge.close', 'Close')}
                </Button>
                <Link to="/dashboard" className="flex-1">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    {t('concierge.viewInDashboard', 'View in Dashboard')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConciergeBookingModal;
