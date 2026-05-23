import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Anchor, CheckCircle, XCircle, Clock, Loader2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";

interface BookingInfo {
  id: string;
  guest_name: string;
  boat_name: string | null;
  boat_length: number | null;
  check_in: string;
  check_out: string;
  special_requests: string | null;
  booking_type: string;
  concierge_status: string;
  concierge_expires_at: string | null;
  total_price: number;
  moorings?: {
    name: string;
    location: string;
    country: string;
    price_per_night: number;
  };
}

type PageState = "loading" | "form" | "success" | "declined" | "expired" | "error" | "already_processed";

const QuoteRespond = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<PageState>("loading");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId || !token) {
      setError("Invalid link. Missing booking ID or token.");
      setPageState("error");
      return;
    }
    fetchBooking();
  }, [bookingId, token]);

  const fetchBooking = async () => {
    const { data, error: fetchErr } = await supabase
      .from("bookings")
      .select("id, guest_name, boat_name, boat_length, check_in, check_out, special_requests, booking_type, concierge_status, concierge_expires_at, total_price, quote_token, moorings(name, location, country, price_per_night)")
      .eq("id", bookingId!)
      .eq("quote_token", token!)
      .single();

    if (fetchErr || !data) {
      setError("Booking not found or invalid token.");
      setPageState("error");
      return;
    }

    setBooking(data as unknown as BookingInfo);

    if (data.concierge_status !== "pending_marina") {
      setPageState("already_processed");
      return;
    }

    if (data.concierge_expires_at && new Date(data.concierge_expires_at) < new Date()) {
      setPageState("expired");
      return;
    }

    // Pre-fill with listing price
    if (data.moorings?.price_per_night) {
      setPrice(String(data.moorings.price_per_night));
    }

    setPageState("form");
  };

  const handleSubmitQuote = async () => {
    const numPrice = parseFloat(price);
    if (!numPrice || numPrice <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("provider-quote-respond", {
        body: { bookingId, token, price: numPrice, action: "quote" },
      });

      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);

      setPageState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    setError("");

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("provider-quote-respond", {
        body: { bookingId, token, action: "decline" },
      });

      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);

      setPageState("declined");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline");
    } finally {
      setSubmitting(false);
    }
  };

  const timeLeft = () => {
    if (!booking?.concierge_expires_at) return "";
    const diff = new Date(booking.concierge_expires_at).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <Anchor className="text-white" size={32} />
          </div>
        </div>

        <h1 className="text-white text-2xl font-bold mb-2">Mooring Booking</h1>
        <p className="text-white/50 text-sm mb-10">Provider Quote Response</p>

        {pageState === "loading" && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
            <span className="text-slate-600">Loading booking details...</span>
          </div>
        )}

        {pageState === "form" && booking && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-left">
            {booking.booking_type === "now4today" && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-4 text-center">
                <p className="text-red-600 font-bold text-sm">URGENT: Same-Day Request</p>
                <p className="text-red-500 text-xs flex items-center justify-center gap-1 mt-1">
                  <Clock size={14} /> {timeLeft()}
                </p>
              </div>
            )}

            {booking.booking_type === "concierge" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
                <p className="text-blue-600 text-sm flex items-center justify-center gap-1">
                  <Clock size={14} /> {timeLeft()}
                </p>
              </div>
            )}

            <h2 className="text-lg font-bold text-slate-800 mb-1">{booking.moorings?.name}</h2>
            <p className="text-sm text-slate-500 mb-4">{booking.moorings?.location}, {booking.moorings?.country}</p>

            <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Guest</span>
                <span className="text-slate-800 font-medium">{booking.guest_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-in</span>
                <span className="text-slate-800">{booking.check_in}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-out</span>
                <span className="text-slate-800">{booking.check_out}</span>
              </div>
              {booking.boat_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Boat</span>
                  <span className="text-slate-800">{booking.boat_name}</span>
                </div>
              )}
              {booking.boat_length && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Boat Length</span>
                  <span className="text-slate-800">{booking.boat_length}m</span>
                </div>
              )}
              {booking.special_requests && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Special Requests</span>
                  <span className="text-slate-800 text-xs">{booking.special_requests}</span>
                </div>
              )}
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Price (EUR per night)
            </label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-8 text-lg font-semibold"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-3">{error}</p>
            )}

            <Button
              onClick={handleSubmitQuote}
              disabled={submitting || !price}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 mb-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Sending...</span>
              ) : (
                <span className="flex items-center gap-2"><Send size={18} /> Submit Price Quote</span>
              )}
            </Button>

            <Button
              onClick={handleDecline}
              disabled={submitting}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Decline Request
            </Button>

            <p className="text-xs text-slate-400 text-center mt-4">
              The guest will review your price and decide whether to accept. Guest contact details will be shared after they accept.
            </p>
          </div>
        )}

        {pageState === "success" && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Quote Submitted!</h2>
            <p className="text-slate-500 text-sm">
              Your price quote of <strong>€{price}</strong> has been sent to the guest. You will receive an email when they respond.
            </p>
          </div>
        )}

        {pageState === "declined" && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="text-red-500" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Request Declined</h2>
            <p className="text-slate-500 text-sm">
              The booking request has been declined. The guest will be notified.
            </p>
          </div>
        )}

        {pageState === "expired" && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                <Clock className="text-orange-500" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Request Expired</h2>
            <p className="text-slate-500 text-sm">
              The response window for this booking request has expired.
            </p>
          </div>
        )}

        {pageState === "already_processed" && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <CheckCircle className="text-blue-500" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Already Processed</h2>
            <p className="text-slate-500 text-sm">
              This booking request has already been responded to.
            </p>
          </div>
        )}

        {pageState === "error" && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="text-red-500" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
            <p className="text-slate-500 text-sm">{error || "Something went wrong."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteRespond;
