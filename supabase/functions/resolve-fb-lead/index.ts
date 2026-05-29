import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic CORS allowlist (this endpoint returns account magic-links, so a
// wildcard origin would let any site read them). Server-to-server callers do
// not send an Origin header and are unaffected by CORS.
const ALLOWED_ORIGINS = new Set([
  'https://mooring-booking.com', 'https://www.mooring-booking.com',
  'https://mooringbooking.com', 'https://www.mooringbooking.com',
  'https://ai-captain.app', 'https://www.ai-captain.app',
  'http://localhost:8080', 'http://localhost:5173',
]);
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.mooring-booking.com';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}

const SITE_URL = 'https://www.mooring-booking.com';
const REDIRECT_PATH = '/become-provider?fromLead=1';
const MAX_LEAD_AGE_DAYS = 7;

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const fbLeadId = url.searchParams.get('fb_lead_id');

    if (!fbLeadId || !/^\d{6,32}$/.test(fbLeadId)) {
      return new Response(JSON.stringify({ error: 'Invalid fb_lead_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: lead, error: leadError } = await supabase
      .from('fb_leads')
      .select('id, email, user_id, created_at')
      .eq('fb_lead_id', fbLeadId)
      .maybeSingle();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ageMs = Date.now() - new Date(lead.created_at).getTime();
    if (ageMs > MAX_LEAD_AGE_DAYS * 24 * 60 * 60 * 1000) {
      return new Response(JSON.stringify({ error: 'Lead expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!lead.email || !lead.user_id) {
      return new Response(JSON.stringify({ error: 'Lead not ready (no user provisioned yet)' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: lead.email,
      options: { redirectTo: `${SITE_URL}${REDIRECT_PATH}` },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return new Response(JSON.stringify({ error: 'Failed to generate magic link', details: linkError?.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ magic_link_url: linkData.properties.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('resolve-fb-lead error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
