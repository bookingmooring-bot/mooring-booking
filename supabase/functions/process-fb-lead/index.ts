import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SITE_URL = 'https://mooring-booking.com';
const RESEND_API_KEY_FALLBACK = '';

type Locale = 'hr' | 'en';

function resolveLocale(fbCampaignName: string | null | undefined): Locale {
  if (!fbCampaignName) return 'en';
  const name = fbCampaignName.toLowerCase();
  if (name.includes('website') || name.includes('hr-') || name.includes('croatia')) return 'hr';
  return 'en';
}

function renderEmail(locale: Locale, firstName: string, city: string | null | undefined, magicLink: string) {
  const cityText = city ? (locale === 'hr' ? `u ${city} ` : `in ${city} `) : '';
  const copy = locale === 'hr'
    ? {
        subject: `🎉 ${firstName}, vaše vezište čeka na vas!`,
        heroTitle: 'Mooring Booking',
        heroSub: 'Mediteranska platforma za vezove',
        greeting: `Dobrodošli, ${firstName}! 🎉`,
        intro: `Hvala vam što ste pokazali interes za Mooring Booking! Vi ste korak od toga da vaše vezište ${cityText}postane vidljivo pomorcima diljem Mediterana.`,
        cta: '🚀 KREIRAJTE SVOJU STRANICU',
        ctaSub: 'Kliknite gumb — automatski ćete biti prijavljeni, bez lozinke!',
        getTitle: 'Što dobijate:',
        bullets: [
          '✅ Besplatno listanje vaših vezova',
          '✅ 85% zarade je VAŠE (15% provizija)',
          '✅ Pristup pomorcima iz 11 mediteranskih zemalja',
          '✅ Online rezervacije i kalendar dostupnosti',
        ],
      }
    : {
        subject: `🎉 ${firstName}, your mooring is waiting for you!`,
        heroTitle: 'Mooring Booking',
        heroSub: 'The Mediterranean mooring marketplace',
        greeting: `Welcome, ${firstName}! 🎉`,
        intro: `Thanks for your interest in Mooring Booking. You're one step away from making your mooring ${cityText}visible to sailors across the Mediterranean.`,
        cta: '🚀 CREATE YOUR LISTING',
        ctaSub: 'Click the button — you\'ll be signed in automatically, no password needed.',
        getTitle: 'What you get:',
        bullets: [
          '✅ Free listing of your moorings',
          '✅ 88% of earnings are YOURS (12% commission)',
          '✅ Reach sailors from 11 Mediterranean countries',
          '✅ Online bookings and availability calendar',
        ],
      };

  const bulletsHtml = copy.bullets.join('<br>');

  return {
    subject: copy.subject,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#0066cc 0%,#0099ff 50%,#00c9ff 100%);padding:40px 40px 30px;text-align:center;"><h1 style="color:#fff;font-size:28px;margin:0 0 8px;">⛵ ${copy.heroTitle}</h1><p style="color:rgba(255,255,255,0.9);font-size:16px;margin:0;">${copy.heroSub}</p></td></tr><tr><td style="padding:40px;"><h2 style="color:#1a1a2e;font-size:24px;margin:0 0 16px;">${copy.greeting}</h2><p style="color:#4a4a6a;font-size:16px;line-height:1.6;margin:0 0 20px;">${copy.intro}</p><table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;"><tr><td align="center"><a href="${magicLink}" style="display:inline-block;background:linear-gradient(135deg,#0066cc,#0099ff);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:18px;font-weight:600;">${copy.cta}</a></td></tr></table><p style="color:#8a8aaa;font-size:13px;text-align:center;margin:0 0 24px;">${copy.ctaSub}</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;"><tr><td><p style="color:#1a1a2e;font-weight:600;font-size:16px;margin:0 0 16px;">${copy.getTitle}</p><p style="color:#4a4a6a;font-size:15px;line-height:2;margin:0;">${bulletsHtml}</p></td></tr></table></td></tr><tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf1;"><p style="color:#8a8aaa;font-size:13px;margin:0;">© 2026 Mooring Booking · <a href="${SITE_URL}" style="color:#0066cc;text-decoration:none;">mooring-booking.com</a></p></td></tr></table></td></tr></table></body></html>`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { full_name, email, phone, city, country, has_mooring, mooring_type, mooring_quantities, fb_lead_id, fb_form_id, fb_ad_id, fb_campaign_name, email_locale } = body;

    const isWebsiteForm = typeof fb_campaign_name === 'string' && fb_campaign_name.toLowerCase().includes('website');
    if (!isWebsiteForm) {
      const webhookSecret = req.headers.get('x-webhook-secret');
      const expectedSecret = Deno.env.get('FB_LEAD_WEBHOOK_SECRET');
      if (expectedSecret && webhookSecret !== expectedSecret) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email and full_name' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: existingLead } = await supabase.from('fb_leads').select('id, status, invite_email_sent').eq('email', email).maybeSingle();
    if (existingLead && existingLead.status === 'invited' && existingLead.invite_email_sent) {
      return new Response(JSON.stringify({ success: true, message: 'Lead already processed', lead_id: existingLead.id, status: existingLead.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: existingProfile } = await supabase.from('profiles').select('id, email, role').eq('email', email).maybeSingle();
    let userId = existingProfile?.id || null;
    let isNewUser = false;

    if (!existingProfile) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email, email_confirm: true,
        user_metadata: { full_name, phone: phone || '', source: 'facebook_lead_ad', fb_campaign: fb_campaign_name || '' },
      });
      if (createError) {
        if (createError.message?.includes('already been registered')) {
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const existingAuthUser = users?.find(u => u.email === email);
          userId = existingAuthUser?.id || null;
        }
      } else {
        userId = newUser.user.id;
        isNewUser = true;
      }
    }

    if (userId) {
      await supabase.from('profiles').update({
        full_name,
        phone: phone || null,
        role: 'provider',
      }).eq('id', userId);

      // Ensure email is confirmed so client-side signInWithPassword succeeds
      // (client signUp may leave the user unconfirmed if Supabase email confirmation is on)
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user && !authUser.user.email_confirmed_at) {
          await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
        }
      } catch (e) {
        console.error('email_confirm update failed:', e);
      }
    }

    const { data: lead, error: leadError } = await supabase.from('fb_leads').upsert({
      fb_lead_id: fb_lead_id || null, fb_form_id: fb_form_id || null, fb_ad_id: fb_ad_id || null, fb_campaign_name: fb_campaign_name || null,
      full_name, email, phone: phone || null, city: city || null, country: country || null,
      has_mooring: has_mooring || false, mooring_type: mooring_type || null,
      mooring_quantities: mooring_quantities || {},
      status: 'invited', user_id: userId, invite_email_sent: true, invite_email_sent_at: new Date().toISOString(),
    }, { onConflict: 'email' }).select().single();

    if (leadError) {
      return new Response(JSON.stringify({ error: 'Failed to save lead', details: leadError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const redirectTarget = `${SITE_URL}/become-provider?fromLead=1`;
    let magicLink = redirectTarget;
    if (userId) {
      const { data: linkData } = await supabase.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo: redirectTarget } });
      if (linkData?.properties?.action_link) {
        magicLink = linkData.properties.action_link;
        await supabase.from('fb_leads').update({ magic_link_token: linkData.properties?.hashed_token || '', magic_link_expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString() }).eq('id', lead.id);
      }
    }

    const locale: Locale = (email_locale === 'hr' || email_locale === 'en') ? email_locale : resolveLocale(fb_campaign_name);
    const firstName = full_name.split(' ')[0];
    const { subject, html } = renderEmail(locale, firstName, city, magicLink);

    const resendApiKey = Deno.env.get('RESEND_API_KEY') || RESEND_API_KEY_FALLBACK;
    let emailSent = false;
    if (resendApiKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: 'Mooring Booking <noreply@mooring-booking.com>', to: [email], subject, html }),
        });
        emailSent = emailRes.ok;
        if (!emailRes.ok) { const errBody = await emailRes.text(); console.error('Resend error:', errBody); }
      } catch (e) { console.error('Email failed:', e); }
    }

    if (userId) {
      await supabase.from('email_sequences').insert({ user_id: userId, email, sequence_type: 'provider_onboarding', step: 0, scheduled_for: new Date().toISOString().split('T')[0], status: 'sent', sent_at: new Date().toISOString() });
      for (const fu of [{ step: 1, days: 1 }, { step: 2, days: 3 }, { step: 3, days: 7 }]) {
        const d = new Date(); d.setDate(d.getDate() + fu.days);
        await supabase.from('email_sequences').insert({ user_id: userId, email, sequence_type: 'provider_onboarding', step: fu.step, scheduled_for: d.toISOString().split('T')[0], status: 'pending' });
      }
    }

    return new Response(JSON.stringify({ success: true, lead_id: lead.id, user_id: userId, is_new_user: isNewUser, email_sent: emailSent, email_locale: locale, magic_link_generated: magicLink !== redirectTarget, follow_ups_scheduled: userId ? 3 : 0, lead_email: email, lead_name: full_name }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
