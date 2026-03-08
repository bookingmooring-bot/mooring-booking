import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    // Find bookings pending > 48 hours without payment
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`*, moorings(name, location)`)
      .eq("booking_status", "pending")
      .eq("payment_status", "pending")
      .lt("created_at", cutoff);

    if (error) throw error;
    if (!bookings?.length) {
      return new Response(JSON.stringify({ message: "No expired bookings." }), { status: 200 });
    }

    const results: string[] = [];
    const emails: object[] = [];

    for (const booking of bookings) {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          booking_status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancelled_by: "system",
          cancellation_reason: "Auto-cancelled: no payment within 48 hours",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error(`Failed to cancel booking ${booking.id}:`, updateError);
        continue;
      }

      results.push(booking.id);

      if (booking.guest_email) {
        const mooringName = booking.moorings?.name || "Vez";
        const mooringLocation = booking.moorings?.location || "";
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: booking.guest_email,
          subject: `Rezervacija otkazana: ${mooringName} ⚓`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #dc2626;">Rezervacija je automatski otkazana</h2>
              <p style="color: #334155;">Poštovani/a ${booking.guest_name || "Gosti"},</p>
              <p style="color: #334155;">
                Vaša rezervacija za vez <strong>${mooringName}</strong>${mooringLocation ? ` (${mooringLocation})` : ""}
                je automatski otkazana jer plaćanje nije primljeno unutar 48 sati.
              </p>
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Kod rezervacije:</strong> ${booking.confirmation_code || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${booking.check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${booking.check_out}</p>
                <p style="margin: 5px 0;"><strong>Razlog:</strong> Plaćanje nije primljeno unutar 48 sati</p>
              </div>
              <p style="color: #334155;">Ako ste zainteresirani za vez, molimo napravite novu rezervaciju.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mooringbooking.com/explore"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Pronađi drugi vez
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">Mooring Booking tim</p>
            </div>
          `,
        });
      }
    }

    if (emails.length > 0) {
      const resendRes = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emails),
      });
      if (!resendRes.ok) {
        const errData = await resendRes.json();
        console.error("Resend error:", errData);
      }
    }

    return new Response(
      JSON.stringify({ cancelled: results.length, booking_ids: results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("job-auto-cancel Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
