import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = "Mooring Booking <noreply@mooring-booking.com>";
const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
serve(async (req)=>{
  try {
    const { mooring_id, mooring_name, location, owner_id, provider_email, provider_name } = await req.json();
    const email = provider_email;
    const name = provider_name || 'Provajderu';
    const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:30px 40px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">⚓ Mooring Booking</h1>
      </div>
      <div style="padding:30px 40px;">
        <h2 style="color:#0f172a;margin-top:0;">Vaš vez je odobren! 🎉</h2>
        <p style="color:#334155;font-size:16px;">Poštovani/a <strong>${name}</strong>,</p>
        <p style="color:#334155;font-size:16px;">Odlična vijest! Vaš vez <strong>${mooring_name}</strong> (${location}) je odobren i sada je vidljiv na platformi.</p>
        
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:6px;margin:20px 0;">
          <p style="margin:5px 0;color:#166534;"><strong>✅ Sljedeći koraci:</strong></p>
          <p style="margin:5px 0;color:#166534;">1. Dodajte fotografije veza za bolji prikaz</p>
          <p style="margin:5px 0;color:#166534;">2. Postavite dostupnost i cijene u kalendaru</p>
          <p style="margin:5px 0;color:#166534;">3. Povežite Stripe za automatske isplate</p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="https://mooring-booking.com/dashboard" 
             style="background:#2563eb;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;">
            Idi na Dashboard
          </a>
        </div>
      </div>
      <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#64748b;font-size:13px;margin:0;">© 2025 Mooring Booking · Dobrodošli u naš tim pružalaca usluga ⚓</p>
      </div>
    </div>`;
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM,
        to: email,
        subject: `Vaš vez je odobren: ${mooring_name} ✅`,
        html
      })
    });
    const data = await resendRes.json();
    if (!resendRes.ok) throw new Error(`Resend Error: ${JSON.stringify(data)}`);
    // Enroll provider in onboarding sequence
    const today = new Date();
    const steps = [
      {
        step: 0,
        days: 1
      },
      {
        step: 1,
        days: 5
      },
      {
        step: 2,
        days: 14
      }
    ];
    const sequences = steps.map(({ step, days })=>{
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return {
        user_id: owner_id,
        email,
        sequence_type: 'provider_onboarding',
        step,
        scheduled_for: d.toISOString().split('T')[0],
        status: 'pending'
      };
    });
    await supabase.from('email_sequences').insert(sequences);
    return new Response(JSON.stringify({
      ok: true
    }), {
      status: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500
    });
  }
});
