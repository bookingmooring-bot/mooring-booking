import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const { data: bookings, error } = await supabase
            .from("bookings")
            .select(`
        *,
        moorings (
          name,
          location
        )
      `)
            .eq("check_in", dateStr);

        if (error) throw error;
        if (!bookings || bookings.length === 0) {
            return new Response(JSON.stringify({ message: "No check-ins tomorrow." }), { status: 200 });
        }

        const emails = [];

        for (const booking of bookings) {
            if (!booking.guest_email) continue;

            const mooringName = booking.moorings?.name || "Mooring";
            const mooringLocation = booking.moorings?.location || "Unknown Location";

            emails.push({
                from: "Mooring Booking <onboarding@resend.dev>",
                to: booking.guest_email,
                subject: `Reminder: Your booking starts tomorrow! ⚓`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Ready to set sail? ⚓</h2>
            <p style="color: #334155;">Dear ${booking.guest_name || "Guest"},</p>
            <p style="color: #334155;">Your booking at <strong>${mooringName}</strong> (${mooringLocation}) starts tomorrow!</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Check-in:</strong> ${booking.check_in}</p>
              <p style="margin: 5px 0;"><strong>Check-out:</strong> ${booking.check_out}</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">Wishing you calm seas and a pleasant stay!</p>
          </div>
        `
            });
        }

        if (emails.length === 0) {
            return new Response(JSON.stringify({ message: "No viable emails." }), { status: 200 });
        }

        const resendRes = await fetch("https://api.resend.com/emails/batch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(emails),
        });

        const data = await resendRes.json();
        if (!resendRes.ok) throw new Error(`Resend Error: ${JSON.stringify(data)}`);

        return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
});
