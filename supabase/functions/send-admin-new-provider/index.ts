import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = "Mooring Booking Platform <noreply@mooring-booking.com>";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@mooring-booking.com";
const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
serve(async (req)=>{
  try {
    const { mooring_id, mooring_name, location, owner_id } = await req.json();
    // Fetch provider profile
    const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', owner_id).single();
    const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:30px 40px;">
        <h1 style="color:#fff;margin:0;font-size:18px;">⚓ Platform Admin Alert</h1>
      </div>
      <div style="padding:30px 40px;">
        <h2 style="color:#0f172a;margin-top:0;">🆕 Novi vez čeka odobrenje</h2>
        <div style="background:#fef9c3;border-left:4px solid #eab308;padding:16px;border-radius:6px;margin:20px 0;">
          <p style="margin:5px 0;"><strong>Vez:</strong> ${mooring_name}</p>
          <p style="margin:5px 0;"><strong>Lokacija:</strong> ${location}</p>
          <p style="margin:5px 0;"><strong>Provajder:</strong> ${profile?.full_name || 'Nepoznato'}</p>
          <p style="margin:5px 0;"><strong>Email:</strong> ${profile?.email || 'Nepoznato'}</p>
          <p style="margin:5px 0;"><strong>ID:</strong> ${mooring_id}</p>
        </div>
        <div style="text-align:center;margin:30px 0;">
          <a href="https://mooring-booking.com/admin" 
             style="background:#2563eb;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;">
            Otvori Admin Panel
          </a>
        </div>
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
        to: ADMIN_EMAIL,
        subject: `🆕 Novi vez na odobrenju: ${mooring_name}`,
        html
      })
    });
    const data = await resendRes.json();
    if (!resendRes.ok) throw new Error(`Resend Error: ${JSON.stringify(data)}`);
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
