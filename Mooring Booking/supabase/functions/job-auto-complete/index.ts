import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const today = new Date().toISOString().split("T")[0];

    // Find confirmed bookings where check-out date has passed
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`*, moorings(name, location)`)
      .eq("booking_status", "confirmed")
      .lt("check_out", today);

    if (error) throw error;
    if (!bookings?.length) {
      return new Response(JSON.stringify({ message: "No bookings to complete." }), { status: 200 });
    }

    const results: string[] = [];
    const emails: object[] = [];

    for (const booking of bookings) {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          booking_status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error(`Failed to complete booking ${booking.id}:`, updateError);
        continue;
      }

      results.push(booking.id);

      // Send review request email only once
      if (booking.guest_email && !booking.review_request_sent) {
        const mooringName = booking.moorings?.name || "Vez";
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: booking.guest_email,
          subject: `Hvala na posjeti: ${mooringName} — Ostavite recenziju ⭐`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a;">Vaš boravak je završen! ⭐</h2>
              <p style="color: #334155;">Poštovani/a ${booking.guest_name || "Gosti"},</p>
              <p style="color: #334155;">
                Nadamo se da ste uživali na vezu <strong>${mooringName}</strong>!
                Vaš boravak je evidentiran kao završen.
              </p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Vez:</strong> ${mooringName}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${booking.check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${booking.check_out}</p>
                <p style="margin: 5px 0;"><strong>Ukupno:</strong> €${booking.total_price}</p>
              </div>
              <p style="color: #334155;">Molimo podijelite Vaše iskustvo — recenzija pomaže ostalim nautičarima!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mooringbooking.com/dashboard"
                   style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Ostavite recenziju
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">Hvala što koristite Mooring Booking!</p>
            </div>
          `,
        });

        // Mark review request as sent
        await supabase
          .from("bookings")
          .update({ review_request_sent: true })
          .eq("id", booking.id);
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
      JSON.stringify({ completed: results.length, booking_ids: results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("job-auto-complete Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
