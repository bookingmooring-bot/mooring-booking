import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("FROM_EMAIL") ?? "Mooring Booking <noreply@resend.dev>";
Deno.serve(async (req)=>{
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
  };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { to, name, portal_url, mooring_type, quantity, country, city } = await req.json();
    if (!to) {
      return new Response(JSON.stringify({
        error: "Missing 'to' field"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const displayName = name || to.split("@")[0];
    const greeting = `Hi ${displayName}!`;
    const mooringInfo = mooring_type ? `<p style="color:#94a3b8;font-size:14px;margin:0 0 6px"><strong style="color:#e0f2fe">Mooring type:</strong> ${mooring_type}</p>
         <p style="color:#94a3b8;font-size:14px;margin:0 0 6px"><strong style="color:#e0f2fe">Spots:</strong> ${quantity || '—'}</p>
         <p style="color:#94a3b8;font-size:14px;margin:0 0 6px"><strong style="color:#e0f2fe">Location:</strong> ${city || '—'}, ${country || '—'}</p>` : "";
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Welcome to Mooring Booking</title></head>
<body style="margin:0;padding:0;background:#020817;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020817;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(56,189,248,0.2);border-radius:20px;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0284c7,#0ea5e9);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;margin-bottom:6px;">⚓</div>
          <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.5px;">Mooring Booking</h1>
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;">Provider Portal</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="color:#e0f2fe;font-size:22px;font-weight:700;margin:0 0 16px;">${greeting}</h2>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Welcome aboard! Your provider account has been created successfully.
            You're just one click away from listing your moorings and starting to earn.
          </p>
          ${mooringInfo ? `<div style="background:rgba(56,189,248,0.07);border:1px solid rgba(56,189,248,0.15);border-radius:12px;padding:20px;margin-bottom:28px;">
            <p style="color:#38bdf8;font-size:13px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Your Mooring Summary</p>
            ${mooringInfo}
          </div>` : ""}
          <div style="text-align:center;margin:28px 0;">
            <a href="${portal_url}" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 20px rgba(14,165,233,0.4);">
              🚢 Go to My Provider Portal
            </a>
          </div>
          <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">
            Or copy this link: <a href="${portal_url}" style="color:#38bdf8;word-break:break-all;">${portal_url}</a>
          </p>
          <hr style="border:none;border-top:1px solid rgba(56,189,248,0.1);margin:32px 0;" />
          <h3 style="color:#e0f2fe;font-size:16px;font-weight:700;margin:0 0 12px;">📋 What happens next?</h3>
          <ol style="color:#94a3b8;font-size:14px;line-height:2;padding-left:20px;margin:0;">
            <li>Log in to your portal and fill in your mooring details</li>
            <li>Our team reviews and approves your listing within 24h</li>
            <li>Sailors across the Mediterranean can find and book your mooring</li>
            <li>You earn 85% of every booking — payments are automatic</li>
          </ol>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(56,189,248,0.1);text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">© ${new Date().getFullYear()} Mooring Booking · You received this because you registered as a provider.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM,
        to: [
          to
        ],
        subject: "🚢 Welcome to Mooring Booking — Your Provider Portal Is Ready",
        html
      })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || JSON.stringify(result));
    return new Response(JSON.stringify({
      success: true,
      id: result.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("send-provider-welcome error:", message);
    return new Response(JSON.stringify({
      error: message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
