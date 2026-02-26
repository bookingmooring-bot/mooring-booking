import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";

serve(async (req) => {
    try {
        const payload = await req.json();
        const record = payload.record;

        if (!record || (!record.email && !record.raw_user_meta_data?.email)) {
            return new Response(JSON.stringify({ error: "No email provided" }), { status: 400 });
        }

        const email = record.email || record.raw_user_meta_data?.email;
        const full_name = record.full_name || record.raw_user_meta_data?.full_name || "";

        // Pokusavamo proslati email preko Resend-a.
        // Napomena: posto imate gmail.com a ne svoj domen, Resend bi mogao vratiti gresku
        // "You can only send emails from verified domains". Ako se to desi, zamenite "from" sa
        // onboarding@resend.dev za testiranje.
        const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Mooring Booking <onboarding@resend.dev>",
                to: email,
                subject: "Dobrodošli u Mooring Booking! ⚓",
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Dobrodošli u Mooring Booking, ${full_name || "Kapetane"}! ⚓</h2>
            <p style="color: #334155; font-size: 16px;">Oduševljeni smo što ste nam se pridružili.</p>
            <p style="color: #334155; font-size: 16px;">Sada možete pregledati i rezervisati najbolje vezove širom Mediterana, ili postati pružalac usluga i početi zarađivati od svog veza.</p>
            <br>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://mooringbooking.com/explore" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Istražite Vezove</a>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-top: 40px;">Želimo vam mirno more i siguran vez!</p>
            <p style="color: #64748b; font-size: 14px; font-weight: bold;">Tim Mooring Booking</p>
          </div>
        `,
            }),
        });

        const data = await resendRes.json();

        if (!resendRes.ok) {
            console.error("Resend Error:", data);
            throw new Error(`Resend Error: ${JSON.stringify(data)}`);
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        });
    }
});
