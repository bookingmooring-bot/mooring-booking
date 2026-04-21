import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SITE_URL = 'https://www.mooring-booking.com';
const REDIRECT_PATH = '/become-provider?fromLead=1';
const MAX_LEAD_AGE_DAYS = 7;

Deno.serve(async (req: Request) => {
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
