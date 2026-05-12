import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

serve(async (req) => {
    try {
        const payload = await req.json();
        const { mooring, provider } = payload;

        if (!mooring || !provider) {
            return new Response(JSON.stringify({ error: "Missing mooring or provider data" }), { status: 400 });
        }

        const providerEmail = provider.email || provider.raw_user_meta_data?.email;
        const providerName = provider.full_name || provider.raw_user_meta_data?.full_name || "Provider";
        const mooringName = mooring.name || "Mooring";
        const status = mooring.status; // 'approved' or 'rejected'

        if (!providerEmail || (status !== 'approved' && status !== 'rejected')) {
            return new Response(JSON.stringify({ message: "No email needed" }), { status: 200 });
        }

        let subject = "";
        let html = "";

        if (status === 'approved') {
            subject = `Great news! Your mooring ${mooringName} has been approved ✅`;
            html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #16a34a;">Your mooring has been approved! ✅</h2>
          <p style="color: #334155;">Dear ${providerName},</p>
          <p style="color: #334155;">We are pleased to inform you that your mooring <strong>${mooringName}</strong> has been successfully approved by our admin team.</p>
          <p style="color: #334155;">Your mooring is now visible to all guests on the platform and they can start booking it!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mooringbooking.com/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
          </div>
        </div>
      `;
        } else {
            subject = `Status update for ${mooringName}: Not Approved ❌`;
            html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #dc2626;">Update on your mooring ❌</h2>
          <p style="color: #334155;">Dear ${providerName},</p>
          <p style="color: #334155;">Unfortunately, your mooring <strong>${mooringName}</strong> has not been approved for listing on the platform at this time.</p>
          <p style="color: #334155;">Please log in to your dashboard to check if any important information is missing (such as photos, a detailed description, etc.) and try again.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://mooringbooking.com/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
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
