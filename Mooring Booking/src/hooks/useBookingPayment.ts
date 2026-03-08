import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface BookingPaymentOptions {
  mooringId: string;
  bookingData: Record<string, unknown>;
  successPath?: string;
  cancelPath?: string;
}

interface BookingPaymentResult {
  url?: string;
  sessionId?: string;
  booking?: Record<string, unknown>;
  fallback?: boolean;
  warning?: string;
}

/**
 * Initiates a Stripe Checkout payment for a mooring booking.
 *
 * If the provider has connected their Stripe account:
 *   - Returns a { url } and redirects to Stripe Checkout
 *   - Booking is created in the DB by the stripe-connect-webhook AFTER payment
 *   - 15% goes to platform, 85% auto-transferred to provider
 *
 * If the provider has NOT connected Stripe:
 *   - Falls back: booking is created immediately as payment_method=cash
 *   - Returns { booking, fallback: true, warning: '...' }
 *
 * Usage:
 *   const payment = useBookingPayment();
 *   payment.mutate({
 *     mooringId: 'uuid',
 *     bookingData: { ... },
 *     successPath: '/dashboard',
 *     cancelPath: '/explore',
 *   });
 */
export function useBookingPayment() {
  return useMutation<BookingPaymentResult, Error, BookingPaymentOptions>({
    mutationFn: async ({ mooringId, bookingData, successPath, cancelPath }) => {
      const { data, error } = await supabase.functions.invoke('create-booking-payment', {
        body: {
          mooringId,
          bookingData,
          successPath: successPath ?? '/dashboard',
          cancelPath: cancelPath ?? '/explore',
        },
      });

      if (error) throw new Error(error.message);

      // If Stripe checkout URL was returned → redirect
      if (data?.url) {
        window.location.href = data.url;
      }

      return data as BookingPaymentResult;
    },
  });
}
