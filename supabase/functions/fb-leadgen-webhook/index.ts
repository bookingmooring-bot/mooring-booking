import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hub-signature-256',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const GRAPH_API_VERSION = 'v20.0';

type FieldDatum = { name: string; values: string[] };

type FbLeadPayload = {
  id: string;
  created_time: string;
  field_data: FieldDatum[];
  form_id?: string;
  ad_id?: string;
  campaign_id?: string;
  campaign_name?: string;
};

function getField(data: FieldDatum[], ...names: string[]): string | null {
  for (const n of names) {
    const key = n.toLowerCase();
    const match = data.find(f => f.name?.toLowerCase() === key);
    if (match && match.values && match.values.length > 0) return match.values[0];
  }
  return null;
}

async function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
  const expected = signatureHeader.slice('sha256='.length);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(appSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const actual = Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const expected = Deno.env.get('META_VERIFY_TOKEN');
    if (mode === 'subscribe' && token && expected && token === expected) {
      return new Response(challenge || '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    return new Response('Forbidden', { status: 403 });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const appSecret = Deno.env.get('META_APP_SECRET');
    if (appSecret) {
      const ok = await verifySignature(rawBody, req.headers.get('x-hub-signature-256'), appSecret);
      if (!ok) {
        console.error('Invalid X-Hub-Signature-256');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    if (body.object !== 'page') {
      return new Response(JSON.stringify({ ignored: true, reason: 'not a page event' }), { headers: { 'Content-Type': 'application/json' } });
    }

    const pageAccessToken = Deno.env.get('META_PAGE_ACCESS_TOKEN');
    if (!pageAccessToken) {
      console.error('META_PAGE_ACCESS_TOKEN not set');
      return new Response('Server misconfigured', { status: 500 });
    }

    const processUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/process-fb-lead`;
    const webhookSecret = Deno.env.get('FB_LEAD_WEBHOOK_SECRET') || '';

    const results: Array<{ leadgen_id: string; ok: boolean; error?: string }> = [];

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen') continue;
        const leadgenId = change.value?.leadgen_id;
        const formId = change.value?.form_id;
        const adId = change.value?.ad_id;
        const campaignId = change.value?.campaign_id;
        if (!leadgenId) continue;

        try {
          const fields = 'field_data,form_id,ad_id,campaign_id,campaign_name,created_time';
          const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?fields=${fields}&access_token=${pageAccessToken}`);
          if (!res.ok) {
            const errText = await res.text();
            console.error(`Graph API error for ${leadgenId}:`, errText);
            results.push({ leadgen_id: leadgenId, ok: false, error: `graph ${res.status}` });
            continue;
          }
          const lead: FbLeadPayload = await res.json();

          const full_name = getField(lead.field_data, 'full_name')
            || [getField(lead.field_data, 'first_name'), getField(lead.field_data, 'last_name')].filter(Boolean).join(' ').trim()
            || null;
          const email = getField(lead.field_data, 'email');
          const phone = getField(lead.field_data, 'phone_number', 'phone');
          const city = getField(lead.field_data, 'city', 'town');
          const country = getField(lead.field_data, 'country');
          const mooring_type = getField(lead.field_data, 'mooring_type', 'type_of_mooring', 'berth_type');
          const mooring_count_raw = getField(lead.field_data, 'mooring_count', 'how_many_moorings', 'number_of_moorings');

          if (!full_name || !email) {
            console.error(`Lead ${leadgenId} missing required fields`, { full_name, email });
            results.push({ leadgen_id: leadgenId, ok: false, error: 'missing full_name or email' });
            continue;
          }

          const payload: Record<string, unknown> = {
            full_name, email,
            phone: phone || undefined,
            city: city || undefined,
            country: country || undefined,
            has_mooring: true,
            mooring_type: mooring_type || undefined,
            fb_lead_id: leadgenId,
            fb_form_id: formId || lead.form_id,
            fb_ad_id: adId || lead.ad_id,
            fb_campaign_name: lead.campaign_name || (campaignId ? `campaign:${campaignId}` : null),
          };
          if (mooring_count_raw) {
            payload.mooring_quantities = { total: mooring_count_raw };
          }

          const fwd = await fetch(processUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-webhook-secret': webhookSecret },
            body: JSON.stringify(payload),
          });
          if (!fwd.ok) {
            const errText = await fwd.text();
            console.error(`process-fb-lead failed for ${leadgenId}:`, errText);
            results.push({ leadgen_id: leadgenId, ok: false, error: `process-fb-lead ${fwd.status}` });
          } else {
            results.push({ leadgen_id: leadgenId, ok: true });
          }
        } catch (e) {
          console.error(`Exception for ${leadgenId}:`, e);
          results.push({ leadgen_id: leadgenId, ok: false, error: (e as Error).message });
        }
      }
    }

    return new Response(JSON.stringify({ received: true, results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});
