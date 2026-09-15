import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const SITE_URL = 'http://mooring-booking.com';
const magicLinkButton = (magicLink, text, bgGradient)=>`<table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;"><tr><td align="center"><a href="${magicLink}" style="display:inline-block;background:linear-gradient(135deg,${bgGradient});color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:18px;font-weight:600;">${text}</a></td></tr></table>`;
const EMAIL_TEMPLATES = {
  1: {
    subject: '\u23f0 {{name}}, va\u0161 vez \u010deka \u2014 registracija traje 2 minute',
    getHtml: (name, magicLink, city)=>`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#003366,#0066CC);padding:40px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">\u23f1\ufe0f Va\u0161 vez \u010deka!</h1></td></tr><tr><td style="padding:40px;"><h2 style="color:#1a1a2e;margin:0 0 16px;">Pozdrav, ${name}! \ud83d\udc4b</h2><p style="color:#4a4a6a;font-size:16px;line-height:1.6;">Primijetili smo da jo\u0161 niste dovr\u0161ili registraciju veza${city ? ' u ' + city : ''}. Registracija traje <strong>samo 2 minute</strong> i potpuno je besplatna.</p>${magicLinkButton(magicLink, '\u2705 DOVR\u0160ITE REGISTRACIJU', '#0066cc,#0099ff')}</td></tr><tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf1;"><p style="color:#8a8aaa;font-size:13px;margin:0;">\u00a9 2026 Mooring Booking \u00b7 <a href="${SITE_URL}" style="color:#0066cc;text-decoration:none;">mooring-booking.com</a></p></td></tr></table></td></tr></table></body></html>`
  },
  2: {
    subject: '\ud83d\udcb0 Vlasnik veza u Dubrovniku zara\u0111uje \u20ac6.000+ po sezoni',
    getHtml: (name, magicLink, city)=>`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#1B5E20,#2E7D32);padding:40px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">\ud83d\udcb0 Koliko mo\u017eete zaraditi?</h1></td></tr><tr><td style="padding:40px;"><h2 style="color:#1a1a2e;margin:0 0 16px;">${name}, pogledajte stvarne zarade \ud83d\udcca</h2><p style="color:#4a4a6a;font-size:16px;line-height:1.6;">Prosje\u010dan provider zara\u0111uje <strong>\u20ac5.000+</strong> po sezoni za vezove koji su prije stajali prazni.</p>${magicLinkButton(magicLink, '\ud83d\udcb0 LISTAJTE VEZ I ZARA\u0110UJTE', '#2E7D32,#43A047')}</td></tr><tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf1;"><p style="color:#8a8aaa;font-size:13px;margin:0;">\u00a9 2026 Mooring Booking \u00b7 <a href="${SITE_URL}" style="color:#0066cc;text-decoration:none;">mooring-booking.com</a></p></td></tr></table></td></tr></table></body></html>`
  },
  3: {
    subject: '\u23f3 Sezona ne \u010deka \u2014 zadnja prilika da se prijavite',
    getHtml: (name, magicLink, city)=>`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#BF360C,#E64A19);padding:40px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">\u23f3 Zadnja prilika!</h1></td></tr><tr><td style="padding:40px;"><h2 style="color:#1a1a2e;margin:0 0 16px;">${name}, sezona po\u010dinje \u2014 a va\u0161e vezi\u0161te stoji prazno</h2><p style="color:#4a4a6a;font-size:16px;line-height:1.6;">Mornari <strong>ve\u0107 tra\u017ee vezove</strong> za ljeto. Svaki dan bez listinga je propu\u0161tena zarada.</p>${magicLinkButton(magicLink, '\u2693 ZADNJA PRILIKA \u2014 PRIJAVITE SE', '#BF360C,#E64A19')}<p style="color:#8a8aaa;font-size:13px;text-align:center;">Ovo je posljednji podsjetnik.</p></td></tr><tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf1;"><p style="color:#8a8aaa;font-size:13px;margin:0;">\u00a9 2026 Mooring Booking \u00b7 <a href="${SITE_URL}" style="color:#0066cc;text-decoration:none;">mooring-booking.com</a></p></td></tr></table></td></tr></table></body></html>`
  }
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  try {
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('FB_LEAD_WEBHOOK_SECRET');
    if (expectedSecret && webhookSecret !== expectedSecret) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const body = await req.json();
    const { sequence_id, email, user_id, step, sequence_type } = body;
    if (user_id) {
      const { data: moorings } = await supabase.from('moorings').select('id').eq('owner_id', user_id).limit(1);
      if (moorings && moorings.length > 0) {
        await supabase.from('email_sequences').update({
          status: 'skipped'
        }).eq('id', sequence_id);
        await supabase.from('email_sequences').update({
          status: 'skipped'
        }).eq('email', email).eq('sequence_type', sequence_type).eq('status', 'pending');
        return new Response(JSON.stringify({
          success: true,
          skipped: true,
          reason: 'user_already_converted'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    let fullName = 'korisni\u010de';
    let city = '';
    if (user_id) {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user_id).maybeSingle();
      if (profile?.full_name) fullName = profile.full_name.split(' ')[0];
    }
    const { data: fbLead } = await supabase.from('fb_leads').select('city, full_name').eq('email', email).maybeSingle();
    if (fbLead?.city) city = fbLead.city;
    if (fbLead?.full_name && fullName === 'korisni\u010de') fullName = fbLead.full_name.split(' ')[0];
    const template = EMAIL_TEMPLATES[step];
    if (!template) return new Response(JSON.stringify({
      error: `No template for step ${step}`
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    let magicLink = `${SITE_URL}/become-provider`;
    if (email) {
      try {
        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: {
            redirectTo: `${SITE_URL}/become-provider`
          }
        });
        if (linkData?.properties?.action_link) magicLink = linkData.properties.action_link;
      } catch (e) {
        console.error('Magic link failed:', e);
      }
    }
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let emailSent = false;
    if (resendApiKey) {
      try {
        const subject = template.subject.replace('{{name}}', fullName);
        const html = template.getHtml(fullName, magicLink, city);
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Mooring Booking <noreply@mooring-booking.com>',
            to: [
              email
            ],
            subject,
            html
          })
        });
        emailSent = emailRes.ok;
      } catch (e) {
        console.error('Email failed:', e);
      }
    }
    await supabase.from('email_sequences').update({
      status: 'sent',
      sent_at: new Date().toISOString()
    }).eq('id', sequence_id);
    if (step >= 2) await supabase.from('fb_leads').update({
      reminder_email_sent: true,
      reminder_email_sent_at: new Date().toISOString()
    }).eq('email', email);
    return new Response(JSON.stringify({
      success: true,
      step,
      email_sent: emailSent,
      email
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
