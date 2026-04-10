/**
 * send-ads-plan-email
 * Šalje Ads Plan PDF (iz Supabase Storage) na 3 emaila.
 * Zakazano: 01.04.2026. u 04:21 via pg_cron.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const FROM = "Mooring Booking <noreply@mooring-booking.com>";

const RECIPIENTS = [
  "hernausa96@gmail.com",
  "mb.smartmatrix@gmail.com",
  "dlazukic@motovunvillas.com",
];

const SUBJECT = "Ads Plan 02.04-10.05.2026 | Marina Manager B2B & Retargeting Analysis";
const PDF_STORAGE_PATH = "ads-plan/MooringBooking_Ads_Plan_April2026.pdf";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const HTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#1a1a2e;background:#f8fafc;padding:0;">

<div style="background:#08375a;padding:32px 40px 24px;">
  <div style="font-size:22px;font-weight:bold;color:#fff;letter-spacing:1px;">Mooring Booking</div>
  <div style="color:#b4c8e1;font-size:13px;margin-top:4px;">Advertising Plan · 02.04 - 10.05.2026</div>
</div>
<div style="background:#b48c1e;height:4px;"></div>

<div style="background:#fff;padding:32px 40px;">

  <h2 style="color:#08375a;margin-top:0;font-size:20px;">Ads Plan — Analiza kampanja</h2>
  <p style="color:#444;line-height:1.7;font-size:15px;">
    U prilogu se nalazi azurirani PDF plan Meta Ads kampanje za period
    <strong>02.04. - 10.05.2026.</strong>
    U nastavku je sazetak preporuke u vezi dvije kampanje koje su bile predmet pitanja.
  </p>

  <div style="border-top:2px solid #e2e8f0;margin:24px 0;"></div>

  <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:6px;margin-bottom:24px;">
    <strong style="color:#92400e;font-size:14px;">Pitanje:</strong>
    <p style="color:#78350f;margin:8px 0 0;font-size:14px;line-height:1.6;">
      Marina Manager B2B (EUR 146) i Retargeting (EUR 97) — da li ostaju u planu ili ih uklanjamo?
      Odakle dolazi tih EUR 243?
    </p>
  </div>

  <h3 style="color:#08375a;font-size:16px;margin-bottom:8px;">Odgovor: Obje su unutar EUR 1.200 — nisu extra</h3>
  <p style="color:#444;line-height:1.7;font-size:14px;">
    EUR 1.200 je od pocetka pokrivao i Retargeting i Marina Manager kampanju.
    Matematika ukupnog budzeta:
  </p>

  <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
    <tr style="background:#08375a;color:#fff;">
      <td style="padding:9px 12px;font-weight:bold;">Kampanja</td>
      <td style="padding:9px 12px;font-weight:bold;text-align:right;">Budzet</td>
    </tr>
    <tr style="background:#f8fafc;"><td style="padding:8px 12px;">HR + IT</td><td style="padding:8px 12px;text-align:right;">EUR 195</td></tr>
    <tr style="background:#fff;"><td style="padding:8px 12px;">Greece</td><td style="padding:8px 12px;text-align:right;">EUR 195</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px 12px;">ES + FR + TR</td><td style="padding:8px 12px;text-align:right;">EUR 195</td></tr>
    <tr style="background:#fff;"><td style="padding:8px 12px;">MT + PT</td><td style="padding:8px 12px;text-align:right;">EUR 97</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px 12px;">SI + AL + CY</td><td style="padding:8px 12px;text-align:right;">EUR 97</td></tr>
    <tr style="background:#fffbeb;"><td style="padding:8px 12px;font-weight:bold;color:#92400e;">Marina Manager B2B</td><td style="padding:8px 12px;text-align:right;font-weight:bold;color:#92400e;">EUR 146</td></tr>
    <tr style="background:#fffbeb;"><td style="padding:8px 12px;font-weight:bold;color:#92400e;">Retargeting</td><td style="padding:8px 12px;text-align:right;font-weight:bold;color:#92400e;">EUR 97</td></tr>
    <tr style="background:#f0f9ff;"><td style="padding:8px 12px;color:#555;font-style:italic;">Rezerva (scaling)</td><td style="padding:8px 12px;text-align:right;color:#555;">EUR 178</td></tr>
    <tr style="background:#08375a;color:#fff;"><td style="padding:10px 12px;font-weight:bold;">UKUPNO base</td><td style="padding:10px 12px;text-align:right;font-weight:bold;">EUR 1.200</td></tr>
    <tr style="background:#dbeafe;"><td style="padding:8px 12px;color:#1d4ed8;font-weight:bold;">MAX (+ ext. rezerva)</td><td style="padding:8px 12px;text-align:right;color:#1d4ed8;font-weight:bold;">EUR 1.400</td></tr>
  </table>

  <div style="border-top:2px solid #e2e8f0;margin:24px 0;"></div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr>
      <td style="width:48%;vertical-align:top;padding-right:12px;">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;">
          <div style="font-weight:bold;color:#166534;font-size:14px;margin-bottom:8px;">Retargeting — ZADRZATI</div>
          <p style="color:#166534;font-size:13px;line-height:1.6;margin:0;">
            Hvata klikere koji nisu konvertovali. EUR 2,49/dan. Najjeftiniji EUR u planu. Bez njega, svaki posjetilac koji ode = izgubljeni novac.
          </p>
        </div>
      </td>
      <td style="width:48%;vertical-align:top;padding-left:12px;">
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;">
          <div style="font-weight:bold;color:#166534;font-size:14px;margin-bottom:8px;">Marina Manager B2B — ZADRZATI</div>
          <p style="color:#166534;font-size:13px;line-height:1.6;margin:0;">
            P1 publika (uprave marina) trazi drugaciji tone od P3/P4. Ako ih mijesamo, Meta optimizira prema jeftinijoj konverziji i P1 nikad ne vidi oglas.
          </p>
        </div>
      </td>
    </tr>
  </table>

  <div style="border-top:2px solid #e2e8f0;margin:24px 0;"></div>

  <p style="color:#444;font-size:14px;line-height:1.7;">
    Kompletan azurirani plan je u prilogu (9 stranica PDF).<br>
    <strong>Kampanje se aktiviraju 02.04.2026. — molim potvrdu prije 01.04. podne.</strong>
  </p>

  <div style="text-align:center;margin-top:28px;">
    <a href="https://mooring-booking.com/admin"
       style="background:#08375a;color:#fff;padding:13px 32px;text-decoration:none;border-radius:7px;font-weight:bold;font-size:14px;display:inline-block;">
      Otvori Admin Panel
    </a>
  </div>
</div>

<div style="background:#08375a;padding:18px 40px;text-align:center;">
  <p style="color:#b4c8e1;font-size:12px;margin:0;">
    Mooring Booking d.o.o. · mooring-booking.com<br>
    Automatska poruka — ne odgovaraj na ovaj email.
  </p>
</div>
</body>
</html>`;

async function sendToAll(pdfBase64: string) {
  const results = [];
  for (const to of RECIPIENTS) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: SUBJECT,
        html: HTML,
        attachments: [
          {
            filename: "MooringBooking_Ads_Plan_April2026.pdf",
            content: pdfBase64,
            content_type: "application/pdf",
          },
        ],
      }),
    });
    const body = await res.json();
    results.push({ to, ok: res.ok, id: body.id, error: body.message });
    console.log(`${res.ok ? "SENT" : "ERROR"} -> ${to} | ${body.id || body.message}`);
  }
  return results;
}

serve(async () => {
  try {
    // 1. Fetch PDF from Supabase Storage
    const { data, error } = await supabase.storage
      .from("marketing")
      .download(PDF_STORAGE_PATH);

    if (error || !data) {
      throw new Error(`Storage fetch failed: ${error?.message}`);
    }

    // 2. Convert to base64
    const arrayBuffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const binary = uint8.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
    const pdfBase64 = btoa(binary);

    // 3. Send to all recipients
    const results = await sendToAll(pdfBase64);

    // 4. Log to DB
    await supabase.from("email_logs").insert(
      results.map(r => ({
        recipient: r.to,
        subject: SUBJECT,
        status: r.ok ? "sent" : "error",
        resend_id: r.id || null,
        error_message: r.error || null,
        sent_at: new Date().toISOString(),
        campaign: "ads-plan-april-2026",
      }))
    );

    const failed = results.filter(r => !r.ok);
    return new Response(
      JSON.stringify({ sent: results.filter(r => r.ok).length, failed: failed.length, results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-ads-plan-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
