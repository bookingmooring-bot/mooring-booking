import { useState, useEffect, lazy, Suspense } from "react";
import { X, Calendar as CalendarIcon, CreditCard, User, Check, Anchor, Navigation, Phone, Copy, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfToday, addDays } from "date-fns";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@/contexts/NavigationContext";
import { useCreateBooking, useMooringAvailability } from "@/hooks/useBookings";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingPayment } from "@/hooks/useBookingPayment";
import { useProviderTier } from "@/hooks/useProviderTier";
import { calculateBookingFees, getCommissionRate } from "@/lib/providerTier";
import { calculateServiceFee } from "@/lib/subscription";

const BulkBookingModal = lazy(() => import("@/components/fleet/BulkBookingModal"));

interface MooringData {
  id: string;
  name: string;
  location: string;
  country: string;
  price: number;
  discountPercent?: number;
  isNow4Today?: boolean;
  image: string;
  lat?: number;
  lng?: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerId?: string;
}

interface BookingModalProps {
  mooring: MooringData;
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill dates from the Explorer search bar (YYYY-MM-DD) */
  initialCheckIn?: string;
  initialCheckOut?: string;
}

const BookingModal = ({ mooring, isOpen, onClose, initialCheckIn, initialCheckOut }: BookingModalProps) => {
  const { t } = useTranslation();
  const { openNavigation } = useNavigation();
  const createBooking = useCreateBooking();
  const bookingPayment = useBookingPayment();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const { data: availabilityData, isLoading: isLoadingAvailability } = useMooringAvailability(mooring.id);
  const { data: providerTierData } = useProviderTier(mooring.ownerId);
  const providerTier = providerTierData?.tier ?? 'standard';
  const providerCommissionRate = providerTierData?.commissionRate;

  const [step, setStep] = useState(1);
  const [showBulkBooking, setShowBulkBooking] = useState(false);
  const isCharterFleet = profile?.subscription_tier === 'charter-fleet';
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const [bookingData, setBookingData] = useState({
    boatName: "",
    boatLength: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    paymentMethod: "card" as "card" | "paypal" | "cash",
  });

  // Autofill form when modal opens, using profile data if available
  useEffect(() => {
    if (isOpen) {
      setBookingData(prev => ({
        ...prev,
        boatName: prev.boatName || profile?.boat_name || "",
        boatLength: prev.boatLength || (profile?.boat_length ? profile.boat_length.toString() : ""),
        guestName: prev.guestName || profile?.full_name || "",
        guestPhone: prev.guestPhone || profile?.phone || "",
        guestEmail: prev.guestEmail || user?.email || "",
      }));

      // Pre-fill dates from Explorer search bar if provided
      if (initialCheckIn && initialCheckOut) {
        setDateRange({
          from: new Date(initialCheckIn + 'T00:00:00'),
          to: new Date(initialCheckOut + 'T00:00:00'),
        });
      }
    }
  }, [isOpen, profile, user, initialCheckIn, initialCheckOut]);

  if (!isOpen) return null;

  const getUnavailableDates = () => {
    if (!availabilityData) return [];
    return availabilityData
      .filter(a => !a.available)
      .map(a => new Date(a.date));
  };

  const isDateUnavailable = (date: Date) => {
    if (isBefore(date, startOfToday())) return true;
    if (!availabilityData) return false;

    // Check if the date is explicitly marked as unavailable
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = availabilityData.find(a => a.date === dateStr);
    if (dayData && !dayData.available) return true;

    return false;
  };

  // Now4Today: same-day only, +20% surcharge
  const now4TodayPrice = mooring.isNow4Today ? Math.round(mooring.price * 1.2) : mooring.price;

  const discountedPrice = mooring.discountPercent
    ? Math.round(now4TodayPrice * (1 - mooring.discountPercent / 100))
    : now4TodayPrice;

  const nights = dateRange?.from && dateRange?.to
    ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
    : (dateRange?.from ? 1 : 0);

  const totalPrice = discountedPrice * Math.max(1, nights);

  const boatLengthNum = bookingData.boatLength ? parseFloat(bookingData.boatLength) : null;
  const serviceFee = calculateServiceFee(boatLengthNum, profile);
  const grandTotal = totalPrice + serviceFee;

  // Check if chosen range contains unavailable dates
  const isRangeValid = () => {
    if (!dateRange?.from || !dateRange?.to) return true; // Let them select first

    let currentDate = new Date(dateRange.from);
    while (currentDate <= dateRange.to) {
      if (isDateUnavailable(currentDate)) return false;
      currentDate = addDays(currentDate, 1);
    }
    return true;
  };

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setDateRange({ from: undefined, to: undefined });
      return;
    }

    if (range.from && range.to) {
      let currentDate = new Date(range.from);
      let isValid = true;
      while (currentDate <= range.to) {
        if (isDateUnavailable(currentDate)) {
          isValid = false;
          break;
        }
        currentDate = addDays(currentDate, 1);
      }

      if (!isValid) {
        toast.error(t('booking.invalidRange', 'Istaknuti raspon sadrži zauzete datume. Molimo odaberite slobodne datume.'));

        // Find which date was just clicked by comparing with the previous from date
        const clickedDate = dateRange?.from?.getTime() === range.from.getTime()
          ? range.to
          : range.from;

        setDateRange({ from: clickedDate, to: undefined });
        return;
      }
    }

    setDateRange(range);
  };

  const checkInStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : "";
  const checkOutStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : checkInStr;

  const canProceedStep1 = dateRange?.from && dateRange?.to && isRangeValid() && bookingData.boatName;
  const canProceedStep2 = bookingData.guestName && bookingData.guestEmail && bookingData.guestPhone;

  const buildBookingPayload = () => {
    const referralCode = sessionStorage.getItem('referral_code') ?? undefined;
    const { commissionAmount, transactionFee } = calculateBookingFees(totalPrice, providerTier, providerCommissionRate);
    const affiliateCommission = referralCode
      ? parseFloat((totalPrice * getCommissionRate(providerTier, providerCommissionRate) * 0.15).toFixed(2))
      : undefined;
    return {
      mooring_id: mooring.id,
      check_in: checkInStr,
      check_out: checkOutStr,
      boat_name: bookingData.boatName,
      boat_length: bookingData.boatLength ? parseFloat(bookingData.boatLength) : undefined,
      guest_name: bookingData.guestName,
      guest_email: bookingData.guestEmail,
      guest_phone: bookingData.guestPhone,
      nights: Math.max(1, nights),
      price_per_night: discountedPrice,
      total_price: grandTotal,
      service_fee: serviceFee,
      commission_amount: commissionAmount,
      transaction_fee: transactionFee,
      is_now4today: mooring.isNow4Today || false,
      referral_code: referralCode,
      affiliate_commission: affiliateCommission,
    };
  };

  const handlePayWithCard = async () => {
    // Triggers Stripe Checkout → booking created by webhook after payment
    bookingPayment.mutate(
      {
        mooringId: mooring.id,
        bookingData: buildBookingPayload(),
        successPath: '/dashboard',
        cancelPath: '/explore',
      },
      {
        onSuccess: (result) => {
          if (result?.fallback) {
            // Provider not connected, booking saved as cash
            toast.success(t('booking.confirmed', 'Booking Confirmed!') + ' (Cash)');
            setStep(4);
          }
          // If Stripe URL returned, user is redirected automatically by the hook
        },
        onError: (err) => {
          toast.error('Payment error: ' + err.message);
        },
      }
    );
  };

  const handlePayCash = async () => {
    // Direct DB insert for cash/manual booking (same as before)
    try {
      await createBooking.mutateAsync({
        ...buildBookingPayload(),
        payment_method: 'cash',
        payment_status: 'pending',
      });
      // Clear referral code after attribution
      sessionStorage.removeItem('referral_code');
      setStep(4);
      toast.success(t('booking.confirmed', 'Booking Confirmed!'));
    } catch (error: unknown) {
      toast.error('Booking failed: ' + (error instanceof Error ? error.message : 'Please try again'));
    }
  };

  const handleSubmit = async () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
    } else if (step === 2 && canProceedStep2) {
      setStep(3);
    }
    // Step 3 is handled by handlePayWithCard / handlePayCash buttons
  };

  const copyCoordinates = () => {
    const coords = `${mooring.lat || 43.5081}, ${mooring.lng || 16.4402}`;
    navigator.clipboard.writeText(coords);
    toast.success(t('booking.coordsCopied', 'Coordinates copied to clipboard!'));
  };

  const handleNavigation = () => {
    openNavigation({
      lat: mooring.lat || 43.5081,
      lng: mooring.lng || 16.4402,
      label: mooring.name,
      mooringId: mooring.id,
    });
  };

  const callOwner = () => {
    const phone = mooring.ownerPhone || "+385 91 234 5678";
    window.location.href = `tel:${phone}`;
  };

  const handleClose = () => {
    setStep(1);
    setDateRange({ from: undefined, to: undefined });
    setBookingData({
      boatName: "",
      boatLength: "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      paymentMethod: "card",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-card rounded-2xl shadow-hover w-full max-w-lg max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-3 sm:p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
              <Anchor size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-foreground text-sm sm:text-base">{t('booking.title', 'Book Mooring')}</h2>
              <p className="text-xs text-muted-foreground">{t('booking.step', 'Step')} {Math.min(step, 3)} {t('booking.of', 'of')} 3</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Mooring Summary */}
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex gap-3 sm:gap-4">
            <img
              src={mooring.image}
              alt={mooring.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base truncate">{mooring.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{mooring.location}, {mooring.country}</p>
              {mooring.isNow4Today && (
                <span className="inline-flex items-center gap-1 text-xs bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full mt-1">
                  ⚡ Now4Today +20%
                </span>
              )}
              <div className="flex items-baseline gap-2 mt-1">
                {(mooring.discountPercent || mooring.isNow4Today) && (
                  <span className="text-muted-foreground text-xs sm:text-sm line-through">€{mooring.price}</span>
                )}
                <span className="text-muted-foreground text-xs">{t('popular.fromPrice')} </span><span className="font-heading font-bold text-primary text-sm sm:text-base">€{discountedPrice}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{t('popular.perNight')}</span>
              </div>
            </div>
          </div>
          {isCharterFleet && step < 4 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
              onClick={() => setShowBulkBooking(true)}
            >
              <Users size={14} className="mr-1" /> Book for Fleet
            </Button>
          )}
        </div>

        {showBulkBooking && (
          <Suspense fallback={null}>
            <BulkBookingModal
              mooring={{ ...mooring, maxBoatLength: undefined, maxDraft: undefined, maxBeam: undefined, mooringLayer: 'premium' as const } as any}
              onClose={() => setShowBulkBooking(false)}
            />
          </Suspense>
        )}

        {/* Step Content */}
        <div className="p-3 sm:p-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <CalendarIcon size={18} className="text-secondary" />
                {t('booking.selectDates', 'Select Dates')}
              </h3>

              <div className="bg-muted/30 rounded-lg p-2 sm:p-4 border border-border flex flex-col items-center">
                {isLoadingAvailability ? (
                  <div className="h-[300px] flex items-center justify-center w-full">
                    <Loader2 className="animate-spin text-muted-foreground mr-2" size={24} />
                    <span className="text-muted-foreground">Loading calendar...</span>
                  </div>
                ) : (
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleSelect}
                    disabled={isDateUnavailable}
                    className="rounded-md mx-auto"
                    numberOfMonths={1}
                  />
                )}

                {/* Visual Legend */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-border w-full justify-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-border bg-background"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-muted/50 text-muted-foreground/50 opacity-50 flex items-center justify-center line-through decoration-1">&nbsp;</div>
                    <span>Booked / Unavailable</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">{t('booking.boatName', 'Boat Name')} *</label>
                <Input
                  placeholder={t('booking.boatNamePlaceholder', 'e.g., Sea Spirit')}
                  value={bookingData.boatName}
                  onChange={(e) => setBookingData({ ...bookingData, boatName: e.target.value })}
                  className="bg-muted/50 text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">{t('booking.boatLength', 'Boat Length (meters)')}</label>
                <Input
                  placeholder={t('booking.boatLengthPlaceholder', 'e.g., 12')}
                  value={bookingData.boatLength}
                  onChange={(e) => setBookingData({ ...bookingData, boatLength: e.target.value })}
                  className="bg-muted/50 text-sm"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <User size={18} className="text-secondary" />
                {t('booking.guestInfo', 'Guest Information')}
              </h3>
              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">{t('booking.fullName', 'Full Name')} *</label>
                <Input
                  placeholder="John Smith"
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                  className="bg-muted/50 text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">{t('booking.email', 'Email')} *</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={bookingData.guestEmail}
                  onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                  className="bg-muted/50 text-sm"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">{t('booking.phone', 'Phone Number')} *</label>
                <Input
                  type="tel"
                  placeholder="+385 91 234 5678"
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                  className="bg-muted/50 text-sm"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                <CreditCard size={18} className="text-secondary" />
                {t('booking.paymentMethod', 'Payment Method')}
              </h3>

              {/* Price Breakdown */}
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">€{discountedPrice} × {nights} {t('booking.nights', 'nights')}</span>
                  <span className="text-foreground">€{totalPrice}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">{t('booking.serviceFee', 'Service fee')}</span>
                  {serviceFee === 0 ? (
                    <span className="text-success">{t('booking.free', 'Free')}</span>
                  ) : (
                    <span className="text-foreground">€{serviceFee}</span>
                  )}
                </div>
                <div className="flex justify-between font-heading font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">{t('booking.total', 'Total')}</span>
                  <span className="text-primary">€{grandTotal}</span>
                </div>
              </div>

              {grandTotal <= 0 ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    {t('booking.contactForPricing', 'This mooring has no listed price. Please contact the marina directly to arrange your booking.')}
                  </p>
                </div>
              ) : (
                <>
                  {/* Stripe Card Payment */}
                  <Button
                    onClick={handlePayWithCard}
                    disabled={bookingPayment.isPending}
                    className="w-full bg-gradient-ocean font-semibold h-12 text-base"
                  >
                    {bookingPayment.isPending ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 size={18} className="animate-spin" /> {t('booking.redirectingPayment', 'Redirecting to payment...')}
                      </span>
                    ) : (
                      t('booking.payWithCard', 'Pay with Card (Stripe)')
                    )}
                  </Button>

                  {/* Cash fallback */}
                  <Button
                    onClick={handlePayCash}
                    disabled={createBooking.isPending}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {createBooking.isPending ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 size={16} className="animate-spin" /> {t('booking.saving', 'Saving...')}
                      </span>
                    ) : (
                      t('booking.payWithCash', 'Pay with Cash / On-site')
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {t('booking.stripeSecure', 'Stripe payment is secure and encrypted. You will be redirected to Stripe to complete payment.')}
                  </p>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full"
              >
                {t('booking.back', 'Back')}
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="py-2 sm:py-4">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Check size={28} className="text-success" />
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-2">
                  {t('booking.confirmed', 'Booking Confirmed!')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('booking.reserved', 'Your mooring at')} {mooring.name} {t('booking.hasBeenReserved', 'has been reserved.')}
                </p>
              </div>

              {/* Booking Details */}
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">{t('booking.confirmation', 'Confirmation')} #:</span>
                  <span className="text-foreground font-mono text-xs">MB-{Date.now().toString(36).toUpperCase()}</span>
                  <span className="text-muted-foreground">{t('booking.checkIn', 'Check-in')}:</span>
                  <span className="text-foreground">{checkInStr}</span>
                  <span className="text-muted-foreground">{t('booking.checkOut', 'Check-out')}:</span>
                  <span className="text-foreground">{checkOutStr}</span>
                  <span className="text-muted-foreground">{t('booking.total', 'Total')}:</span>
                  <span className="text-foreground font-semibold">€{grandTotal}</span>
                </div>
              </div>

              {/* Navigation & Contact - UNLOCKED AFTER PAYMENT */}
              <div className="bg-success/10 border border-success/30 rounded-lg p-3 sm:p-4 mb-4">
                <h4 className="font-semibold text-success mb-3 flex items-center gap-2 text-sm">
                  <Anchor size={18} />
                  {t('booking.navUnlocked', 'Navigation & Contact Unlocked')}
                </h4>

                {/* Coordinates */}
                <div className="bg-card rounded-lg p-2 sm:p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('booking.gpsCoords', 'GPS Coordinates')}</p>
                      <p className="font-mono text-foreground text-sm">
                        {mooring.lat || 43.5081}°N, {mooring.lng || 16.4402}°E
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyCoordinates}>
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                {/* Owner Contact */}
                <div className="bg-card rounded-lg p-2 sm:p-3 mb-3">
                  <p className="text-xs text-muted-foreground">{t('booking.mooringOwner', 'Mooring Owner')}</p>
                  <p className="font-medium text-foreground">{mooring.ownerName}</p>
                  {mooring.ownerPhone && (
                    <button
                      onClick={callOwner}
                      className="text-secondary flex items-center gap-1 mt-1 text-sm"
                    >
                      <Phone size={14} />
                      {mooring.ownerPhone}
                    </button>
                  )}
                </div>

                {/* Navigation Button */}
                <Button
                  onClick={handleNavigation}
                  className="w-full bg-gradient-ocean font-semibold"
                >
                  <Navigation size={18} className="mr-2" />
                  {t('booking.navigateToMooring', 'Navigate to Mooring')}
                </Button>
              </div>

              {/* WhatsApp */}
              {(mooring.ownerPhone) && (
                <>
                  <a href={`https://wa.me/${(mooring.ownerPhone).replace(/[\s\-\(\)]/g, "")}?text=${encodeURIComponent(`Booking confirmed at ${mooring.name}! Confirmation #MB-${Date.now().toString(36).toUpperCase()}. Check-in: ${checkInStr}, Check-out: ${checkOutStr}. Total: €${grandTotal}.`)}`} target="_blank" rel="noopener noreferrer" className="block mt-2">
                    <Button variant="outline" className="w-full border-[hsl(142,70%,45%)] text-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,45%)]/10">
                      📱 Send to WhatsApp
                    </Button>
                  </a>
                  {['sailor', 'captain', 'charter-fleet'].includes(profile?.subscription_tier ?? '') && (
                    <p className="text-xs text-center text-emerald-600 mt-1">WhatsApp notification sent automatically</p>
                  )}
                </>
              )}

              <p className="text-xs text-muted-foreground text-center mt-3">
                {t('booking.confirmationSent', 'Confirmation sent to')} {bookingData.guestEmail}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && step !== 3 && (
          <div className="sticky bottom-0 bg-card border-t border-border p-3 sm:p-4 flex gap-3 sm:gap-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                {t('booking.back', 'Back')}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-ocean font-semibold"
              disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
            >
              {t('booking.continue', 'Continue')}
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="p-3 sm:p-4 border-t border-border">
            <Button onClick={handleClose} className="w-full bg-gradient-ocean font-semibold">
              {t('booking.done', 'Done')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;