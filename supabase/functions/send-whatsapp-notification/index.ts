import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const API_VERSION = "v19.0";

interface WhatsAppPayload {
  booking_id: string;
  guest_phone?: string;
  guest_name?: string;
  mooring_name?: string;
  check_in?: string;
  check_out?: string;
  total_price?: number;
  confirmation_code?: string;
  owner_phone?: string;
  owner_name?: string;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, "").replace(/^\+/, "");
}

async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  parameters: Array<{ type: "text"; text: string }>,
): Promise<{ ok: boolean; error?: string }> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return { ok: false, error: "WhatsApp credentials not configured" };
  }

  const normalized = normalizePhone(to);
  if (normalized.length < 8) {
    return { ok: false, error: `Invalid phone: ${to}` };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalized,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components: parameters.length > 0
              ? [{ type: "body", parameters }]
              : undefined,
          },
        }),
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`WhatsApp API error (${res.status}):`, errBody);
      return { ok: false, error: `API ${res.status}: ${errBody}` };
    }

    const json = await res.json();
    console.log("WhatsApp sent to", normalized, "message_id:", json.messages?.[0]?.id);
    return { ok: true };
  } catch (err) {
    console.error("WhatsApp fetch error:", err);
    return { ok: false, error: String(err) };
  }
}

serve(async (req) => {
  try {
    const payload: WhatsAppPayload = await req.json();
    const {
      booking_id,
      guest_phone,
      guest_name,
      mooring_name,
      check_in,
      check_out,
      total_price,
      confirmation_code,
      owner_phone,
      owner_name,
    } = payload;

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "booking_id required" }), { status: 400 });
    }

    const results: Array<{ recipient: string; ok: boolean; error?: string }> = [];

    // 1. Notify guest
    if (guest_phone) {
      const r = await sendTemplateMessage(guest_phone, "booking_confirmation", "en", [
        { type: "text", text: guest_name || "Guest" },
        { type: "text", text: mooring_name || "Mooring" },
        { type: "text", text: check_in || "-" },
        { type: "text", text: check_out || "-" },
        { type: "text", text: `€${total_price ?? 0}` },
        { type: "text", text: confirmation_code || booking_id.slice(0, 8) },
      ]);
      results.push({ recipient: "guest", ...r });
    }

    // 2. Notify owner/provider
    if (owner_phone) {
      const r = await sendTemplateMessage(owner_phone, "new_booking_alert", "en", [
        { type: "text", text: owner_name || "Provider" },
        { type: "text", text: mooring_name || "Mooring" },
        { type: "text", text: guest_name || "Guest" },
        { type: "text", text: check_in || "-" },
        { type: "text", text: check_out || "-" },
        { type: "text", text: `€${total_price ?? 0}` },
      ]);
      results.push({ recipient: "owner", ...r });
    }

    // Mark booking as notified (fire-and-forget)
    if (results.some((r) => r.ok)) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from("bookings")
        .update({ whatsapp_notification_sent: true })
        .eq("id", booking_id);
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-whatsapp-notification error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
