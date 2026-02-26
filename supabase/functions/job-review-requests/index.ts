import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        const { data: bookings, error } = await supabase
            .from("bookings")
            .select(`
        *,
        moorings (
          id,
          name,
          location
        )
      `)
            .eq("check_out", dateStr);

        if (error) throw error;
        if (!bookings || bookings.length === 0) {
            return new Response(JSON.stringify({ message: "No check-outs yesterday." }), { status: 200 });
        }

        const emails = [];

        for (const booking of bookings) {
            if (!booking.guest_email) continue;

            const mooringName = booking.moorings?.name || "Vez";
            const mooringLocation = booking.moorings?.location || "Nepoznata Lokacija";

            emails.push({
                from: "Mooring Booking <onboarding@resend.dev>",
                to: booking.guest_email,
                subject: `Kako vam je bilo na vezu ${mooringName}? \u2b50`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Nadamo se da ste imali sjajan boravak!</h2>
            <p style="color: #334155;">Poštovani/a ${booking.guest_name || "Gosti"},</p>
            <p style="color: #334155;">Vaša rezervacija na vezu <strong>${mooringName}</strong> (${mooringLocation}) se juče završila.</p>
            <p style="color: #334155;">Bili bismo vam veoma zahvalni ukoliko biste odvojili minut vašeg vremena da ocenite vez i podelite svoje iskustvo sa drugim mornarima. Vaše mišljenje je dragoceno!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <!-- Assuming the link to review goes to explore with modal open or specific URL -->
              <a href="https://mooringbooking.com/explore" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ostavi recenziju</a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">Hvala što koristite Mooring Booking platformu!</p>
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
