import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const ADMIN_EMAIL   = Deno.env.get("ADMIN_EMAIL") || "hernausa96@gmail.com";
const FROM          = "Mooring Booking <noreply@mooring-booking.com>";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

async function sendEmail(subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM, to: ADMIN_EMAIL, subject, html }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Resend error: ${JSON.stringify(err)}`);
  }
  return res.json();
}

function card(content: string) {
  return (
    '<div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:10px;background:#fff">' +
    '<div style="border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:20px">' +
    '<span style="color:#2563eb;font-weight:bold;font-size:12px;text-transform:uppercase">\u2699\ufe0f Mooring Booking Admin Alert</span>' +
    "</div>" +
    content +
    '<div style="margin-top:24px;text-align:center">' +
    '<a href="https://mooring-booking.com/admin" style="background:#2563eb;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block">Otvori Admin Panel</a>' +
    "</div>" +
    '<p style="color:#94a3b8;font-size:12px;margin-top:20px;text-align:center">Automatska poruka \u2014 Mooring Booking platforma</p>' +
    "</div>"
  );
}

function row(label: string, value: string, bg: boolean) {
  const bg2 = bg ? "background:#f8fafc;" : "";
  return `<tr style="${bg2}"><td style="padding:10px;font-weight:bold">${label}</td><td style="padding:10px">${value}</td></tr>`;
}

function table(...rows: string[]) {
  return `<table style="width:100%;border-collapse:collapse">${rows.join("")}</table>`;
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const { alert_type } = payload;
    let result;

    // ── 1. NEW PROVIDER ──────────────────────────────────────────────────────
    if (alert_type === "new_provider") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, stripe_onboarding_complete")
        .eq("id", payload.provider_id)
        .single();

      result = await sendEmail(
        `\ud83c\udd95 Novi vez \u010deka odobrenje: ${payload.mooring_name}`,
        card(
          "<h2>Novi vez \u010deka odobrenje</h2>" +
          table(
            row("Vez", payload.mooring_name, true),
            row("Lokacija", payload.location || "N/A", false),
            row("Provajder", profile?.full_name || "Nepoznato", true),
            row("Email", profile?.email || "N/A", false),
            row("Stripe", profile?.stripe_onboarding_complete ? "\u2705 Konfiguriran" : "\u26a0\ufe0f Nije konfiguriran", true),
          ) +
          '<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;margin-top:16px;border-radius:4px">' +
          "\u26a0\ufe0f <strong>Akcija potrebna:</strong> Idi na admin panel i odobri ili odbij ovaj vez." +
          "</div>"
        )
      );
    }

    // ── 2. NEW AFFILIATE ─────────────────────────────────────────────────────
    else if (alert_type === "new_affiliate") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", payload.user_id)
        .single();

      result = await sendEmail(
        `\ud83e\udd1d Nova affiliate prijava`,
        card(
          "<h2>Nova Affiliate Prijava</h2>" +
          table(
            row("Korisnik", profile?.full_name || "Nepoznato", true),
            row("Email", profile?.email || "N/A", false),
            row("Referral kod", `<strong>${payload.referral_code}</strong>`, true),
          ) +
          '<div style="background:#eff6ff;border-left:4px solid #2563eb;padding:12px;margin-top:16px;border-radius:4px">' +
          "\u2139\ufe0f Odobri ili odbij affiliate prijavu u admin panelu." +
          "</div>"
        )
      );
    }

    // ── 3. NEW USER ──────────────────────────────────────────────────────────
    else if (alert_type === "new_user") {
      result = await sendEmail(
        `\ud83d\udc64 Novi korisnik: ${payload.user_email}`,
        card(
          "<h2>Novi korisnik se registrirao</h2>" +
          table(
            row("Ime", payload.user_name || "Nepoznato", true),
            row("Email", payload.user_email, false),
          )
        )
      );
    }

    // ── 4. STRIPE ALERT ──────────────────────────────────────────────────────
    else if (alert_type === "stripe_alert") {
      const labels: Record<string, string> = {
        payment_failed:  "\u274c Pla\u0107anje neuspje\u0161no",
        dispute_opened:  "\u26a0\ufe0f Dispute otvoren",
        refund_created:  "\u21a9\ufe0f Refund kreiran",
        transfer_failed: "\ud83d\udd34 Transfer provajderu neuspje\u0161an",
        payout_failed:   "\ud83d\udd34 Payout neuspje\u0161an",
      };
      const label = labels[payload.stripe_event || ""] || ("Stripe: " + payload.stripe_event);
      result = await sendEmail(
        "\ud83d\udd14 Stripe Alert: " + label,
        card(
          `<h2 style="color:#dc2626">Stripe Alert: ${label}</h2>` +
          table(
            row("Event", `<code>${payload.stripe_event}</code>`, true),
            row("Iznos", `\u20ac${payload.stripe_amount ?? "N/A"}`, false),
            row("Kupac", payload.customer_email || "N/A", true),
            row("Event ID", `<code>${payload.stripe_event_id || "N/A"}</code>`, false),
          ) +
          '<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin-top:16px;border-radius:4px">' +
          "\ud83d\udea8 Provjeri Stripe Dashboard za detalje." +
          "</div>"
        )
      );
    }

    // ── 5. LARGE BOOKING ─────────────────────────────────────────────────────
    else if (alert_type === "large_booking") {
      result = await sendEmail(
        `\ud83d\udcb0 Velika rezervacija: \u20ac${payload.total_price} \u2014 ${payload.mooring_name}`,
        card(
          "<h2>Velika rezervacija kreirana \ud83d\udcb0</h2>" +
          table(
            row("Vez", payload.mooring_name, true),
            row("Gost", payload.guest_name, false),
            row("Check-in", payload.check_in, true),
            row("Check-out", payload.check_out, false),
            `<tr style="background:#f0fdf4"><td style="padding:10px;font-weight:bold">Ukupno</td><td style="padding:10px"><strong style="color:#16a34a;font-size:18px">\u20ac${payload.total_price}</strong></td></tr>`,
          )
        )
      );
    }

    // ── 6. DAILY REPORT ──────────────────────────────────────────────────────
    else if (alert_type === "daily_report") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];

      const [bookingsRes, usersRes, mooringsRes] = await Promise.all([
        supabase.from("bookings").select("id, total_price, booking_status")
          .gte("created_at", yDate + "T00:00:00Z").lt("created_at", today + "T00:00:00Z"),
        supabase.from("profiles").select("id")
          .gte("created_at", yDate + "T00:00:00Z").lt("created_at", today + "T00:00:00Z"),
        supabase.from("moorings").select("id").eq("status", "pending"),
      ]);

      const bookings = bookingsRes.data || [];
      const revenue = bookings
        .filter(b => ["confirmed", "completed"].includes(b.booking_status))
        .reduce((s: number, b: Record<string, unknown>) => s + parseFloat(String(b.total_price || 0)), 0);
      const newUsers = (usersRes.data || []).length;
      const pendingMoorings = (mooringsRes.data || []).length;
      const pendingColor = pendingMoorings > 0 ? "#f59e0b" : "#16a34a";

      result = await sendEmail(
        "\ud83d\udcca Dnevni izvje\u0161taj platforme \u2014 " + yDate,
        card(
          "<h2>Dnevni izvje\u0161taj \u2014 " + yDate + "</h2>" +
          table(
            row("\ud83d\udcc5 Nove rezervacije", `<span style="font-size:20px;font-weight:bold">${bookings.length}</span>`, true),
            row("\ud83d\udcb0 Prihod (potvr\u0111ene)", `<span style="font-size:20px;font-weight:bold;color:#16a34a">\u20ac${revenue.toFixed(2)}</span>`, false),
            row("\ud83d\udc64 Novi korisnici", `<span style="font-size:20px;font-weight:bold">${newUsers}</span>`, true),
            row("\u23f3 Vezovi na \u010dekanju", `<span style="font-size:20px;font-weight:bold;color:${pendingColor}">${pendingMoorings}</span>`, false),
          ) +
          (pendingMoorings > 0
            ? '<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;margin-top:16px;border-radius:4px">' +
              `\u26a0\ufe0f <strong>${pendingMoorings} vez/vezova \u010deka odobrenje!</strong></div>`
            : "")
        )
      );
    }

    else {
      return new Response(JSON.stringify({ error: "Unknown alert_type: " + alert_type }), { status: 400 });
    }

    console.log("Admin notification sent:", alert_type);
    return new Response(JSON.stringify({ sent: true, alert_type, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-admin-notification Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
