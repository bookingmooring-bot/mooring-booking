# Edge Function: `send-admin-notification`

Single unified function that handles ALL admin notification types via `alert_type` field.

## Deployment

```bash
# Deploy via MCP:
deploy_edge_function(project_id="bblxawscmyzelinidkmb", name="send-admin-notification", verify_jwt=false)
```

---

## Full TypeScript Code

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const ADMIN_EMAIL   = Deno.env.get("ADMIN_EMAIL") || "hernausa96@gmail.com";
const FROM          = "Mooring Booking <noreply@mooring-booking.com>";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// ─── Types ───────────────────────────────────────────────────────────────────
type AlertType =
  | "new_provider"
  | "new_affiliate"
  | "new_user"
  | "stripe_alert"
  | "large_booking"
  | "daily_report";

interface AdminPayload {
  alert_type: AlertType;
  // new_provider
  mooring_id?: string;
  mooring_name?: string;
  location?: string;
  provider_id?: string;
  // new_affiliate
  affiliate_id?: string;
  referral_code?: string;
  // new_user
  user_id?: string;
  user_email?: string;
  user_name?: string;
  // stripe_alert
  stripe_event?: string;
  stripe_amount?: number;
  customer_email?: string;
  stripe_event_id?: string;
  // large_booking
  booking_id?: string;
  guest_name?: string;
  check_in?: string;
  check_out?: string;
  total_price?: number;
  // daily_report — all fetched internally
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function sendEmail(subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to: ADMIN_EMAIL, subject, html }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Resend error: ${JSON.stringify(err)}`);
  }
  return res.json();
}

function adminCard(content: string) {
  return `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px;
                border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
      <div style="border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:20px;">
        <span style="color:#2563eb;font-weight:bold;font-size:12px;text-transform:uppercase;">
          ⚙️ Mooring Booking Admin Alert
        </span>
      </div>
      ${content}
      <div style="margin-top:24px;text-align:center;">
        <a href="https://mooring-booking.com/admin"
           style="background:#2563eb;color:#fff;padding:12px 28px;text-decoration:none;
                  border-radius:6px;font-weight:bold;display:inline-block;">
          Otvori Admin Panel
        </a>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:20px;text-align:center;">
        Ova poruka je automatski generirana od Mooring Booking platforme.
      </p>
    </div>
  `;
}

// ─── Handler ───────────────────────────────────────────────────────────────
serve(async (req) => {
  try {
    const payload: AdminPayload = await req.json();
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
        `🆕 Novi vez čeka odobrenje: ${payload.mooring_name}`,
        adminCard(`
          <h2 style="color:#0f172a;margin:0 0 16px">Novi vez čeka odobrenje</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Vez</td>
              <td style="padding:10px">${payload.mooring_name}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Lokacija</td>
              <td style="padding:10px">${payload.location || "N/A"}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Provajder</td>
              <td style="padding:10px">${profile?.full_name || "Nepoznato"}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Email</td>
              <td style="padding:10px">${profile?.email || "N/A"}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Stripe</td>
              <td style="padding:10px">${profile?.stripe_onboarding_complete ? "✅ Konfiguriran" : "⚠️ Nije konfiguriran"}</td></tr>
          </table>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;margin-top:16px;border-radius:4px">
            ⚠️ <strong>Akcija potrebna:</strong> Idi na admin panel i odobri ili odbij ovaj vez.
          </div>
        `)
      );
    }

    // ── 2. NEW AFFILIATE ────────────────────────────────────────────────────
    else if (alert_type === "new_affiliate") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", payload.user_id)
        .single();

      result = await sendEmail(
        `🤝 Nova affiliate prijava: ${profile?.full_name || payload.referral_code}`,
        adminCard(`
          <h2 style="color:#0f172a;margin:0 0 16px">Nova Affiliate Prijava</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Korisnik</td>
              <td style="padding:10px">${profile?.full_name || "Nepoznato"}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Email</td>
              <td style="padding:10px">${profile?.email || "N/A"}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Referral kod</td>
              <td style="padding:10px"><strong>${payload.referral_code}</strong></td></tr>
          </table>
          <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:12px;margin-top:16px;border-radius:4px">
            ℹ️ <strong>Akcija:</strong> Odobri ili odbij affiliate prijavu u admin panelu.
          </div>
        `)
      );
    }

    // ── 3. NEW USER ──────────────────────────────────────────────────────────
    else if (alert_type === "new_user") {
      result = await sendEmail(
        `👤 Novi korisnik registriran: ${payload.user_email}`,
        adminCard(`
          <h2 style="color:#0f172a;margin:0 0 16px">Novi korisnik se registrirao</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Ime</td>
              <td style="padding:10px">${payload.user_name || "Nepoznato"}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Email</td>
              <td style="padding:10px">${payload.user_email}</td></tr>
          </table>
        `)
      );
    }

    // ── 4. STRIPE ALERT ──────────────────────────────────────────────────────
    else if (alert_type === "stripe_alert") {
      const alertLabels: Record<string, string> = {
        payment_failed:   "❌ Plaćanje neuspješno",
        dispute_opened:   "⚠️ Dispute otvoren",
        refund_created:   "↩️ Refund kreiran",
        transfer_failed:  "🔴 Transfer provajderu neuspješan",
        payout_failed:    "🔴 Payout neuspješan",
      };
      const label = alertLabels[payload.stripe_event || ""] || `Stripe event: ${payload.stripe_event}`;

      result = await sendEmail(
        `🔔 Stripe Alert: ${label}`,
        adminCard(`
          <h2 style="color:#dc2626;margin:0 0 16px">Stripe Alert: ${label}</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Event</td>
              <td style="padding:10px"><code>${payload.stripe_event}</code></td></tr>
            <tr><td style="padding:10px;font-weight:bold">Iznos</td>
              <td style="padding:10px">€${payload.stripe_amount || "N/A"}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Kupac</td>
              <td style="padding:10px">${payload.customer_email || "N/A"}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Event ID</td>
              <td style="padding:10px"><code>${payload.stripe_event_id || "N/A"}</code></td></tr>
          </table>
          <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin-top:16px;border-radius:4px">
            🚨 Provjeri Stripe Dashboard za detalje i eventualne akcije.
          </div>
        `)
      );
    }

    // ── 5. LARGE BOOKING ─────────────────────────────────────────────────────
    else if (alert_type === "large_booking") {
      result = await sendEmail(
        `💰 Velika rezervacija: €${payload.total_price} — ${payload.mooring_name}`,
        adminCard(`
          <h2 style="color:#0f172a;margin:0 0 16px">Velika rezervacija kreirana 💰</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Vez</td>
              <td style="padding:10px">${payload.mooring_name}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Gost</td>
              <td style="padding:10px">${payload.guest_name}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">Check-in</td>
              <td style="padding:10px">${payload.check_in}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">Check-out</td>
              <td style="padding:10px">${payload.check_out}</td></tr>
            <tr style="background:#f0fdf4"><td style="padding:10px;font-weight:bold">Ukupno</td>
              <td style="padding:10px"><strong style="color:#16a34a;font-size:18px">€${payload.total_price}</strong></td></tr>
          </table>
        `)
      );
    }

    // ── 6. DAILY REPORT ──────────────────────────────────────────────────────
    else if (alert_type === "daily_report") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split("T")[0];

      const [bookingsRes, usersRes, mooringsRes] = await Promise.all([
        supabase.from("bookings")
          .select("id, total_price, booking_status")
          .gte("created_at", `${yDate}T00:00:00Z`)
          .lt("created_at", `${new Date().toISOString().split("T")[0]}T00:00:00Z`),
        supabase.from("profiles")
          .select("id")
          .gte("created_at", `${yDate}T00:00:00Z`)
          .lt("created_at", `${new Date().toISOString().split("T")[0]}T00:00:00Z`),
        supabase.from("moorings")
          .select("id")
          .eq("status", "pending"),
      ]);

      const bookings = bookingsRes.data || [];
      const revenue = bookings
        .filter(b => b.booking_status === "confirmed" || b.booking_status === "completed")
        .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
      const newUsers = (usersRes.data || []).length;
      const pendingMoorings = (mooringsRes.data || []).length;

      result = await sendEmail(
        `📊 Dnevni izvještaj platforme — ${yDate}`,
        adminCard(`
          <h2 style="color:#0f172a;margin:0 0 16px">Dnevni izvještaj — ${yDate}</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">📅 Nove rezervacije</td>
              <td style="padding:10px;font-size:20px;font-weight:bold">${bookings.length}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">💰 Prihod (potvrđene)</td>
              <td style="padding:10px;font-size:20px;font-weight:bold;color:#16a34a">€${revenue.toFixed(2)}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px;font-weight:bold">👤 Novi korisnici</td>
              <td style="padding:10px;font-size:20px;font-weight:bold">${newUsers}</td></tr>
            <tr><td style="padding:10px;font-weight:bold">⏳ Vezovi na čekanju</td>
              <td style="padding:10px;font-size:20px;font-weight:bold;color:${pendingMoorings > 0 ? "#f59e0b" : "#16a34a"}">${pendingMoorings}</td></tr>
          </table>
          ${pendingMoorings > 0 ? `
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;margin-top:16px;border-radius:4px">
            ⚠️ <strong>${pendingMoorings} vez/vezova čeka odobrenje!</strong> Provjeri admin panel.
          </div>` : ""}
        `)
      );
    }

    else {
      return new Response(JSON.stringify({ error: `Unknown alert_type: ${alert_type}` }), { status: 400 });
    }

    return new Response(JSON.stringify({ sent: true, alert_type, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-admin-notification Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```
