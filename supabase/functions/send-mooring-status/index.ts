import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";

serve(async (req) => {
    try {
        const payload = await req.json();
        const { mooring, provider } = payload;

        if (!mooring || !provider) {
            return new Response(JSON.stringify({ error: "Missing mooring or provider data" }), { status: 400 });
        }

        const providerEmail = provider.email || provider.raw_user_meta_data?.email;
        const providerName = provider.full_name || provider.raw_user_meta_data?.full_name || "Provajder";
        const mooringName = mooring.name || "Vez";
        const status = mooring.status; // 'approved' or 'rejected'

        if (!providerEmail || (status !== 'approved' && status !== 'rejected')) {
            return new Response(JSON.stringify({ message: "No email needed" }), { status: 200 });
        }

        let subject = "";
        let html = "";

        if (status === 'approved') {
            subject = `Odlične vesti! Vaš vez ${mooringName} je odobren \u2705`;
            html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #16a34a;">Vaš vez je odobren! \u2705</h2>
          <p style="color: #334155;">Poštovani/a ${providerName},</p>
          <p style="color: #334155;">Sa zadovoljstvom vas obaveštavamo da je vaš vez <strong>${mooringName}</strong> uspešno odobren od strane administratora.</p>
          <p style="color: #334155;">Vaš vez je sada vidljiv svim gostima na platformi i mogu ga rezervisati!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mooringbooking.com/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Prikaži kontrolnu tablu</a>
          </div>
        </div>
      `;
        } else {
            subject = `Status vašeg veza ${mooringName}: Odbijen \u274c`;
            html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #dc2626;">Obaveštenje o vašem vezu \u274c</h2>
          <p style="color: #334155;">Poštovani/a ${providerName},</p>
          <p style="color: #334155;">Nažalost, vaš vez <strong>${mooringName}</strong> nije odobren za objavljivanje na platformi.</p>
          <p style="color: #334155;">Prijavite se na vašu kontrolnu tablu kako biste proverili da li nedostaju neke bitne informacije (poput slika, detaljnog opisa ili slično) i pokušajte ponovo.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mooringbooking.com/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Prikaži kontrolnu tablu</a>
          </div>
        </div>
      `;
        }

        const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Mooring Booking <onboarding@resend.dev>",
                to: providerEmail,
                subject,
                html,
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
