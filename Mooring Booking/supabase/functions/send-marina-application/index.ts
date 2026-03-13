import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const ADMIN_EMAIL = "bookingmooring@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { to, contactName, marinaName, city, country, availableBerths, phone, website } = body;

    if (!to || !marinaName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 1. Send confirmation email to marina ──────────────────────────────────────
    const confirmRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mooring Booking <onboarding@resend.dev>",
        to,
        subject: "Thank you for applying to Mooring Booking! ⚓",
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;
                      background: #020817; color: #f0f9ff; padding: 40px; border-radius: 16px;">

            <div style="text-align: center; margin-bottom: 32px;">
              <span style="font-size: 48px;">⚓</span>
              <h1 style="color: #38bdf8; font-size: 24px; margin: 12px 0 4px;">
                Mooring Booking
              </h1>
              <p style="color: #475569; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
                Marina Partnership
              </p>
            </div>

            <h2 style="font-size: 22px; color: #e0f2fe; margin-bottom: 12px;">
              Thank you for applying, ${contactName}! 🎉
            </h2>

            <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
              We have received your marina application for
              <strong style="color: #38bdf8;">${marinaName}</strong> in ${city}, ${country}.
              Someone from our team will contact you shortly to discuss the details of our partnership.
            </p>

            <div style="background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2);
                        border-radius: 12px; padding: 20px; margin-bottom: 28px;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 10px;">Application summary:</p>
              <table style="width: 100%; border-collapse: collapse; color: #e0f2fe; font-size: 14px;">
                <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Marina</td>
                    <td style="font-weight: 600;">${marinaName}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Location</td>
                    <td>${city}, ${country}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Available berths</td>
                    <td>${availableBerths}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Contact</td>
                    <td>${contactName} · ${phone}</td></tr>
                ${website ? `<tr><td style="padding: 4px 0; color: #64748b;">Website</td>
                    <td>${website}</td></tr>` : ""}
              </table>
            </div>

            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">
              Our B2B team will review your application and reach out within <strong style="color: #e0f2fe;">24–48 hours</strong>.
            </p>

            <p style="color: #475569; font-size: 13px; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px;">
              © ${new Date().getFullYear()} Mooring Booking · Marina Partnership Portal<br />
              You received this email because you applied through mooring-booking.com/marina-partnership
            </p>
          </div>
        `,
      }),
    });

    const confirmData = await confirmRes.json();
    if (!confirmRes.ok) {
      console.error("Confirmation email error:", confirmData);
    }

    // ── 2. Send notification to admin ─────────────────────────────────────────────
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mooring Booking <onboarding@resend.dev>",
        to: ADMIN_EMAIL,
        subject: `🏛️ New Marina Application: ${marinaName} (${availableBerths} berths)`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;
                      border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">New Marina Partnership Application</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #334155;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b; font-weight: 600;">Marina</td>
                <td style="padding: 10px; font-weight: 700;">${marinaName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b; font-weight: 600;">Location</td>
                <td style="padding: 10px;">${city}, ${country}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b; font-weight: 600;">Available Berths</td>
                <td style="padding: 10px; font-weight: 700; color: ${parseInt(availableBerths) >= 50 ? '#16a34a' : '#0ea5e9'};">
                  ${availableBerths} ${parseInt(availableBerths) >= 50 ? "(12% tier ✓)" : "(15% tier)"}
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b; font-weight: 600;">Contact</td>
                <td style="padding: 10px;">${contactName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b; font-weight: 600;">Email</td>
                <td style="padding: 10px;"><a href="mailto:${to}">${to}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b; font-weight: 600;">Phone</td>
                <td style="padding: 10px;">${phone}</td>
              </tr>
              ${website ? `<tr>
                <td style="padding: 10px; color: #64748b; font-weight: 600;">Website</td>
                <td style="padding: 10px;"><a href="${website}">${website}</a></td>
              </tr>` : ""}
            </table>
            <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
              Submitted at: ${new Date().toISOString()}
            </p>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
