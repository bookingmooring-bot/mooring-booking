import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const payload = await req.json();
    const {
      booking_id,
      old_status,
      new_status,
      guest_email,
      guest_name,
      check_in,
      check_out,
      total_price,
      confirmation_code,
    } = payload;

    if (!booking_id || !new_status || old_status === new_status) {
      return new Response(JSON.stringify({ message: "No status change to process." }), { status: 200 });
    }

    console.log(`Booking ${booking_id}: ${old_status} → ${new_status}`);

    // Fetch mooring + provider details
    const { data: booking } = await supabase
      .from("bookings")
      .select(`
        *,
        moorings(name, location),
        profiles!bookings_provider_id_fkey(email, full_name)
      `)
      .eq("id", booking_id)
      .single();

    const mooringName = booking?.moorings?.name || "Vez";
    const mooringLocation = booking?.moorings?.location || "";
    const providerEmail = booking?.profiles?.email;

    const emails: object[] = [];

    // ── CONFIRMED ─────────────────────────────────────────────────
    if (new_status === "confirmed") {
      if (guest_email) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: guest_email,
          subject: `✅ Rezervacija potvrđena: ${mooringName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #16a34a;">Vaša rezervacija je potvrđena! ✅</h2>
              <p style="color: #334155;">Poštovani/a ${guest_name || "Gosti"},</p>
              <p style="color: #334155;">Vaša rezervacija na vezu <strong>${mooringName}</strong>${mooringLocation ? ` (${mooringLocation})` : ""} je potvrđena.</p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Kod potvrde:</strong> ${confirmation_code || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${check_out}</p>
                <p style="margin: 5px 0;"><strong>Ukupno:</strong> €${total_price}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mooringbooking.com/dashboard"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Prikaži moje rezervacije
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">Hvala što koristite Mooring Booking!</p>
            </div>
          `,
        });
      }
      if (providerEmail) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: providerEmail,
          subject: `🎉 Nova potvrđena rezervacija: ${mooringName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a;">Nova potvrđena rezervacija! 🎉</h2>
              <p style="color: #334155;">Vaš vez <strong>${mooringName}</strong> ima novu potvrđenu rezervaciju.</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Gost:</strong> ${guest_name || "Nepoznato"}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${check_out}</p>
                <p style="margin: 5px 0;"><strong>Ukupno:</strong> €${total_price}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mooringbooking.com/dashboard"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Kontrolna tabla
                </a>
              </div>
            </div>
          `,
        });
      }
    }

    // ── CANCELLED ─────────────────────────────────────────────────
    else if (new_status === "cancelled") {
      if (guest_email) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: guest_email,
          subject: `❌ Rezervacija otkazana: ${mooringName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #dc2626;">Rezervacija je otkazana</h2>
              <p style="color: #334155;">Poštovani/a ${guest_name || "Gosti"},</p>
              <p style="color: #334155;">Vaša rezervacija na vezu <strong>${mooringName}</strong> je otkazana.</p>
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Kod rezervacije:</strong> ${confirmation_code || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${check_out}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mooringbooking.com/explore"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Pronađi drugi vez
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">Za pitanja kontaktirajte nas na support@mooringbooking.com</p>
            </div>
          `,
        });
      }
      if (providerEmail) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: providerEmail,
          subject: `Rezervacija otkazana za ${mooringName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #f59e0b;">Rezervacija je otkazana</h2>
              <p style="color: #334155;">Rezervacija za vaš vez <strong>${mooringName}</strong> je otkazana.</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Gost:</strong> ${guest_name || "Nepoznato"}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${check_out}</p>
              </div>
              <p style="color: #334155;">Vez je ponovo dostupan za rezervacije.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mooringbooking.com/dashboard"
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Kontrolna tabla
                </a>
              </div>
            </div>
          `,
        });
      }
    }

    // ── COMPLETED ─────────────────────────────────────────────────
    else if (new_status === "completed") {
      if (guest_email) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: guest_email,
          subject: `Hvala na posjeti: ${mooringName} — Ostavite recenziju ⭐`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a;">Vaš boravak je završen! ⭐</h2>
              <p style="color: #334155;">Poštovani/a ${guest_name || "Gosti"},</p>
              <p style="color: #334155;">Nadamo se da ste uživali na vezu <strong>${mooringName}</strong>!</p>
              <p style="color: #334155;">Molimo podijelite Vaše iskustvo — recenzija pomaže ostalim nautičarima.</p>
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
      }
    }

    // Send all queued emails
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
        throw new Error(`Resend error: ${JSON.stringify(errData)}`);
      }
    }

    return new Response(
      JSON.stringify({ sent: emails.length, new_status }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("on-booking-status-change Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
