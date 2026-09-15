import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = "Mooring Booking <noreply@mooring-booking.com>";
serve(async (req)=>{
  try {
    const { booking, mooring, provider_email, guest_email, guest_name, cancelled_by, reason } = await req.json();
    const emails = [];
    const infoBox = (b, m)=>`
      <div style="background:#f8fafc;border-left:4px solid #e53e3e;padding:16px;border-radius:6px;margin:20px 0;">
        <p style="margin:5px 0;"><strong>Vez:</strong> ${m?.name || 'N/A'} — ${m?.location || ''}</p>
        <p style="margin:5px 0;"><strong>Check-in:</strong> ${b?.check_in}</p>
        <p style="margin:5px 0;"><strong>Check-out:</strong> ${b?.check_out}</p>
        <p style="margin:5px 0;"><strong>Kod potvrde:</strong> ${b?.confirmation_code}</p>
        <p style="margin:5px 0;"><strong>Ukupno:</strong> €${b?.total_price}</p>
      </div>`;
    const footer = `<div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;margin-top:30px;">
      <p style="color:#64748b;font-size:13px;margin:0;">© 2025 Mooring Booking · Hvala što koristite našu platformu ⚓</p>
    </div>`;
    // Email to guest
    if (guest_email) {
      emails.push({
        from: FROM,
        to: guest_email,
        subject: `Rezervacija otkazana: ${mooring?.name || 'Vez'} ❌`,
        html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#7f1d1d 100%);padding:30px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">⚓ Mooring Booking</h1>
          </div>
          <div style="padding:30px 40px;">
            <h2 style="color:#0f172a;margin-top:0;">Vaša rezervacija je otkazana</h2>
            <p style="color:#334155;font-size:16px;">Poštovani/a <strong>${guest_name || 'Gosti'}</strong>,</p>
            <p style="color:#334155;font-size:16px;">Nažalost, vaša rezervacija je otkazana${cancelled_by === 'system' ? ' automatski zbog isteka vremena plaćanja' : cancelled_by === 'provider' ? ' od strane vlasnika veza' : ''}.</p>
            ${reason ? `<p style="color:#64748b;"><em>Razlog: ${reason}</em></p>` : ''}
            ${infoBox(booking, mooring)}
            <p style="color:#334155;">Ukoliko imate pitanja, slobodno nas kontaktirajte na <a href="mailto:support@mooring-booking.com">support@mooring-booking.com</a>.</p>
          </div>
          ${footer}
        </div>`
      });
    }
    // Email to provider
    if (provider_email) {
      emails.push({
        from: FROM,
        to: provider_email,
        subject: `Rezervacija otkazana: ${mooring?.name || 'Vez'} ❌`,
        html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#7f1d1d 100%);padding:30px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">⚓ Mooring Booking</h1>
          </div>
          <div style="padding:30px 40px;">
            <h2 style="color:#0f172a;margin-top:0;">Rezervacija je otkazana</h2>
            <p style="color:#334155;">Rezervacija gosta <strong>${guest_name || 'Nepoznato'}</strong> na vašem vezu je otkazana.</p>
            ${infoBox(booking, mooring)}
            <p style="color:#64748b;">Datumi su automatski dostupni za nove rezervacije.</p>
          </div>
          ${footer}
        </div>`
      });
    }
    if (emails.length === 0) {
      return new Response(JSON.stringify({
        message: 'No emails to send.'
      }), {
        status: 200
      });
    }
    const resendRes = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(emails)
    });
    const data = await resendRes.json();
    if (!resendRes.ok) throw new Error(`Resend Error: ${JSON.stringify(data)}`);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
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
