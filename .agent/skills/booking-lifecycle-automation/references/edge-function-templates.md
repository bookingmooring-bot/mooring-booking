# Edge Function Templates — Booking Lifecycle Automation

All functions live in `supabase/functions/<function-name>/index.ts`.
Deploy with: `deploy_edge_function` MCP tool, `verify_jwt: false`.

---

## 1. `job-auto-cancel` — Auto-cancel Expired Pending Bookings

**File**: `supabase/functions/job-auto-cancel/index.ts`
**Schedule**: Hourly (`0 * * * *`)
**Logic**: Cancel bookings that have been `pending` for more than 48 hours without a confirmed payment.

```typescript
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
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`*, moorings(name, location)`)
      .eq("booking_status", "pending")
      .eq("payment_status", "pending")
      .lt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (error) throw error;
    if (!bookings?.length) {
      return new Response(JSON.stringify({ message: "No expired bookings." }), { status: 200 });
    }

    const results = [];
    const emails = [];

    for (const booking of bookings) {
      // Update status to cancelled
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

      // Queue cancellation email to guest
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
                Vaša rezervacija za vez <strong>${mooringName}</strong> ${mooringLocation ? `(${mooringLocation})` : ""} 
                je automatski otkazana jer plaćanje nije primljeno unutar 48 sati.
              </p>
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Kod rezervacije:</strong> ${booking.confirmation_code || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${booking.check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${booking.check_out}</p>
                <p style="margin: 5px 0;"><strong>Razlog:</strong> Plaćanje nije primljeno unutar 48 sati</p>
              </div>
              <p style="color: #334155;">Ako ste zainteresirani za vez, molimo Vas napravite novu rezervaciju.</p>
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

    // Send all cancellation emails in a batch
    if (emails.length > 0) {
      await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emails),
      });
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
```

---

## 2. `job-auto-complete` — Auto-complete Past Bookings

**File**: `supabase/functions/job-auto-complete/index.ts`
**Schedule**: Daily at 06:00 UTC (`0 6 * * *`)
**Logic**: Mark confirmed bookings as `completed` when their check-out date has passed.

```typescript
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

    // Find confirmed bookings where check-out has passed
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`*, moorings(name, location)`)
      .eq("booking_status", "confirmed")
      .lt("check_out", today);

    if (error) throw error;
    if (!bookings?.length) {
      return new Response(JSON.stringify({ message: "No bookings to complete." }), { status: 200 });
    }

    const results = [];
    const emails = [];

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

      // Queue completion + review request email to guest
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
                Vaš boravak je rezerviran u sistemu kao završen.
              </p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Vez:</strong> ${mooringName}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${booking.check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${booking.check_out}</p>
              </div>
              <p style="color: #334155;">Molimo podijelite Vaše iskustvo — Vaša recenzija pomaže ostalim nautičarima!</p>
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

        // Mark review request sent
        await supabase
          .from("bookings")
          .update({ review_request_sent: true })
          .eq("id", booking.id);
      }
    }

    if (emails.length > 0) {
      await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emails),
      });
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
```

---

## 3. `on-booking-status-change` — Email Dispatcher on Status Changes

**File**: `supabase/functions/on-booking-status-change/index.ts`
**Triggered by**: DB trigger (not a cron job — fires on every `booking_status` UPDATE)
**Logic**: Receives booking data, sends the right email based on `new_status`.

```typescript
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
      return new Response(JSON.stringify({ message: "No status change." }), { status: 200 });
    }

    // Fetch mooring and provider details
    const { data: booking } = await supabase
      .from("bookings")
      .select(`*, moorings(name, location, owner_id), profiles!bookings_provider_id_fkey(email, full_name)`)
      .eq("id", booking_id)
      .single();

    const mooringName = booking?.moorings?.name || "Vez";
    const mooringLocation = booking?.moorings?.location || "";
    const providerEmail = booking?.profiles?.email;

    const emails = [];

    // ── CONFIRMED ──────────────────────────────────────────────────
    if (new_status === "confirmed") {
      if (guest_email) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: guest_email,
          subject: `✅ Rezervacija potvrđena: ${mooringName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #16a34a;">Vaša rezervacija je potvrđena! ✅</h2>
              <p>Poštovani/a ${guest_name || "Gosti"},</p>
              <p>Vaša rezervacija na vezu <strong>${mooringName}</strong>${mooringLocation ? ` (${mooringLocation})` : ""} je potvrđena.</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
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
              <p>Vaš vez <strong>${mooringName}</strong> ima novu potvrđenu rezervaciju.</p>
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

    // ── CANCELLED ──────────────────────────────────────────────────
    else if (new_status === "cancelled") {
      if (guest_email) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: guest_email,
          subject: `❌ Rezervacija otkazana: ${mooringName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #dc2626;">Rezervacija je otkazana</h2>
              <p>Poštovani/a ${guest_name || "Gosti"},</p>
              <p>Vaša rezervacija na vezu <strong>${mooringName}</strong> je otkazana.</p>
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
              <p>Rezervacija za vaš vez <strong>${mooringName}</strong> je otkazana.</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Gost:</strong> ${guest_name || "Nepoznato"}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${check_in}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${check_out}</p>
              </div>
              <p>Vez je ponovo dostupan za rezervacije.</p>
            </div>
          `,
        });
      }
    }

    // ── COMPLETED ──────────────────────────────────────────────────
    else if (new_status === "completed") {
      if (guest_email) {
        emails.push({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: guest_email,
          subject: `Hvala na posjeti: ${mooringName} — Ostavite recenziju ⭐`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a;">Vaš boravak je završen! ⭐</h2>
              <p>Poštovani/a ${guest_name || "Gosti"},</p>
              <p>Nadamo se da ste uživali na vezu <strong>${mooringName}</strong>!</p>
              <p>Molimo podijelite Vaše iskustvo — recenzija pomaže ostalim nautičarima.</p>
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

    // Send emails
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
```
