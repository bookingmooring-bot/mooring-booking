import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const FROM = "Mooring Booking <noreply@mooring-booking.com>";
const APP_URL = "https://mooring-booking.com";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// ── Email content for each sequence ──────────────────────────────────────────
const EMAIL_CONTENT: Record<string, Array<{ subject: string; html: (name: string, email: string) => string }>> = {

  sailor_onboarding: [
    // Step 0 is sent by send-welcome-email; steps 1-3 sent by this cron
    // Step 0 placeholder (skip)
    { subject: "", html: () => "" },

    // Step 1 — Day 2: How does booking work?
    {
      subject: "Kako funkcionira rezervacija veza? \u2693",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Kako funkcionira rezervacija veza?</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Rezervacija veza na Mooring Bookingu je jednostavna \u2014 u samo 3 koraka:</p>',
        '<div style="counter-reset:steps">',
        '<div style="display:flex;align-items:flex-start;margin:16px 0;gap:16px">',
        '<span style="background:#2563eb;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0">1</span>',
        '<div><strong>Prona\u0111ite vez</strong><br><span style="color:#64748b">Koristite mapu ili pretragu da prona\u0111ete idealan vez za va\u0161 brod.</span></div>',
        '</div>',
        '<div style="display:flex;align-items:flex-start;margin:16px 0;gap:16px">',
        '<span style="background:#2563eb;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0">2</span>',
        '<div><strong>Odaberite datume</strong><br><span style="color:#64748b">Pogledajte dostupnost i odaberite datume check-in i check-out.</span></div>',
        '</div>',
        '<div style="display:flex;align-items:flex-start;margin:16px 0;gap:16px">',
        '<span style="background:#2563eb;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0">3</span>',
        '<div><strong>Platite i primite potvrdu</strong><br><span style="color:#64748b">Sigurna online uplata i trenutna potvrda sa kodom rezervacije.</span></div>',
        '</div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/explore" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Rezervirajte vas prvi vez \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 2 — Day 5: Discover moorings in your region
    {
      subject: "Otkrijte vezove u va\u0161oj regiji \ud83d\uddfa\ufe0f",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Otkrijte vezove u va\u0161oj regiji \ud83d\uddfa\ufe0f</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Na Mooring Bookingu mo\u017eete prona\u0107i vezove u cijelom Mediteranu \u2014 od Jadrana do Egeja.</p>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\udded\ud83c\uddf7</div><strong>Hrvatska</strong><br><span style="color:#64748b;font-size:13px">Dalmacija, Istra, Kvarner</span></div>',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\uddec\ud83c\uddf7</div><strong>Gr\u010dka</strong><br><span style="color:#64748b;font-size:13px">Jonska ostrva, Egej</span></div>',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\uddee\ud83c\uddf9</div><strong>Italija</strong><br><span style="color:#64748b;font-size:13px">Sicilija, Sardinija</span></div>',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\uddf2\ud83c\uddea</div><strong>Crna Gora</strong><br><span style="color:#64748b;font-size:13px">Boka Kotorska</span></div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/explore" style="background:#16a34a;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Istra\u017eite na Mapi \ud83d\uddfa\ufe0f</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 3 — Day 10: Upgrade to premium
    {
      subject: "Postanite Premium Kapetan \u2014 rezervirajte vi\u0161e, platite manje \ud83d\udc51",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Postanite Premium Kapetan \ud83d\udc51</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Nadogradite na Premium plan i u\u017eivajte u ekskluzivnim pogodnostima:</p>',
        '<div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;border-radius:10px;margin:20px 0;color:#fff">',
        '<h3 style="margin:0 0 16px;color:#fff">\u2728 Premium Plan</h3>',
        '<ul style="list-style:none;padding:0;margin:0">',
        '<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2)">\u2705 Neograni\u010den AI Kapetan (nauticki asistent)</li>',
        '<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2)">\u2705 Prioritetna podr\u0161ka</li>',
        '<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2)">\u2705 Ekskluzivni popusti na premium vezove</li>',
        '<li style="padding:8px 0">\u2705 Napredna vremenska prognoza</li>',
        '</ul>',
        '<div style="margin-top:16px;font-size:22px;font-weight:bold">\u20ac9,99/mj <span style="font-size:14px;font-weight:normal;opacity:0.8">(godi\u0161nji plan)</span></div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/pricing" style="background:#f59e0b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Nadogradite na Premium \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },
  ],

  provider_onboarding: [
    // Step 0: sent by send-mooring-status trigger
    { subject: "", html: () => "" },

    // Step 1 — Day 1: Tips for better listing
    {
      subject: "Kako optimizirati va\u0161 vez i privući vi\u0161e rezervacija? \ud83d\udca1",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Savjeti za bolji listing \ud83d\udca1</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Hvala \u0161to ste registrirali va\u0161 vez na Mooring Bookingu! Evo kako pove\u0107ati rezervacije:</p>',
        '<div style="margin:20px 0">',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px;border-radius:6px;margin:12px 0">',
        '<strong>\ud83d\udcf8 Dodajte kvalitetne fotografije</strong><br>',
        '<span style="color:#64748b;font-size:14px">Vezovi s 5+ fotografija dobivaju 3x vi\u0161e rezervacija.</span>',
        '</div>',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px;border-radius:6px;margin:12px 0">',
        '<strong>\ud83d\udcdd Napi\u0161ite detaljan opis</strong><br>',
        '<span style="color:#64748b;font-size:14px">Opišite lokaciju, dubinu vode, amenities i blizinu servisa.</span>',
        '</div>',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px;border-radius:6px;margin:12px 0">',
        '<strong>\ud83d\udcc5 A\u017eurirajte dostupnost</strong><br>',
        '<span style="color:#64748b;font-size:14px">Redovito a\u017eurirajte kalendar dostupnosti za bolji ranking.</span>',
        '</div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/dashboard" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Uredite va\u0161 vez \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 2 — Day 5: Set pricing and availability
    {
      subject: "Postavite cijene i dostupnost za sezonu 2025 \ud83d\udcc5",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Sezona se bli\u017ei \u2014 ste li spremni? \ud83c\udf0a</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Nautici zapo\u010dinju rezervirati vezove za ljetnu sezonu. Pobrinite se da je va\u0161 vez spreman:</p>',
        '<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:6px;margin:20px 0">',
        '<strong>\u26a0\ufe0f Akcija potrebna:</strong>',
        '<ul style="color:#334155;padding-left:20px;margin:8px 0">',
        '<li>Postavite sezonske cijene (juni, juli, august)</li>',
        '<li>Ozna\u010dite nedostupne datume (npr. osobna upotreba)</li>',
        '<li>Uklju\u010dite ili isklju\u010dite Now4Today opciju</li>',
        '</ul>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/dashboard" style="background:#f59e0b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Postavite Cijene \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 3 — Day 14: Set up Stripe Connect
    {
      subject: "Va\u0161 payout je spreman \u2014 pove\u017eite Stripe u 2 minute \ud83d\udcb3",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Po\u010dnite primati uplate direktno na va\u0161 ra\u010dun! \ud83d\udcb3</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Pove\u017eite va\u0161 Stripe account kako biste primali 85% od svake rezervacije direktno na va\u0161 bank account.</p>',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:6px;margin:20px 0">',
        '<strong>\ud83d\udcb0 Kako funkcionira pla\u0107anje:</strong>',
        '<ul style="color:#334155;padding-left:20px;margin:8px 0">',
        '<li>Gost plati punu cijenu rezervacije</li>',
        '<li><strong>85% ide direktno vama</strong> (automatski)</li>',
        '<li>15% je platforma fee za Mooring Booking</li>',
        '</ul>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/dashboard?tab=stripe" style="background:#16a34a;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Pove\u017eite Stripe Account \u2192</a>',
        '</div>',
        '<p style="color:#64748b;font-size:13px;text-align:center">Postavljanje traje 2-3 minute. Pla\u0107anja sti\u017eu na va\u0161 ra\u010dun automatski.</p>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },
  ],

  winback: [
    // Step 0 — reactivation email
    {
      subject: "Nedostajete nam, " + "{{name}}" + "! Novi vezovi vas \u010dekaju \u2693",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Nedostajete nam! \ud83c\udf0a</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Primijetili smo da dugo niste posjetili Mooring Booking. Mnogo toga se promijenilo!</p>',
        '<div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:6px;margin:20px 0">',
        '<strong>\ud83c\udf1f \u0160to je novo:</strong>',
        '<ul style="color:#334155;padding-left:20px;margin:8px 0">',
        '<li>AI Kapetan \u2014 va\u0161 li\u010dni nauticki asistent</li>',
        '<li>Novi vezovi u HR, GR, IT, ME</li>',
        '<li>Pobolj\u0161ani sustav ocjena i recenzija</li>',
        '</ul>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/explore" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Vrati se i istra\u017ei \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 1 — Day 7: Last chance
    {
      subject: "Posljednja prigoda \u2014 posebna ponuda za vas \ud83c\udf81",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Posebna ponuda za povratak! \ud83c\udf81</h2>',
        '<p style="color:#334155">Po\u0161tovani/a <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Kao povratnik u Mooring Booking, nudimo vam poseban pristup Premium planu:</p>',
        '<div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;border-radius:10px;margin:20px 0;color:#fff;text-align:center">',
        '<div style="font-size:36px;font-weight:bold">\u20ac0</div>',
        '<div>Prvi mjesec Premium plana besplatno</div>',
        '<div style="font-size:13px;opacity:0.8;margin-top:8px">*Za korisnike koji se vrate unutar 7 dana</div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/pricing" style="background:#f59e0b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Iskoristite ponudu \u2192</a>',
        '</div>',
        '<p style="color:#94a3b8;font-size:12px;text-align:center">Ponuda vrijedi 7 dana od primitka ovog emaila.</p>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Odjava od emailova</a></p>',
        '</div>',
      ].join(""),
    },
  ],
};

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const today = new Date().toISOString().split("T")[0];

    const { data: pending, error } = await supabase
      .from("email_sequences")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", today);

    if (error) throw error;

    if (!pending?.length) {
      console.log("No email sequences due today.");
      return new Response(JSON.stringify({ sent: 0, message: "No emails due today." }), { status: 200 });
    }

    console.log("Processing", pending.length, "pending email sequences...");

    const emails = [];
    const sequenceIds = [];

    for (const seq of pending) {
      const steps = EMAIL_CONTENT[seq.sequence_type];
      if (!steps) {
        await supabase.from("email_sequences").update({ status: "skipped" }).eq("id", seq.id);
        continue;
      }
      const content = steps[seq.step];
      if (!content || !content.subject) {
        // Step 0 — already sent or placeholder
        await supabase.from("email_sequences").update({ status: "skipped" }).eq("id", seq.id);
        continue;
      }

      // Get user's name from profiles
      let userName = "Kapetane";
      if (seq.user_id) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", seq.user_id).single();
        if (profile?.full_name) userName = profile.full_name;
      }

      emails.push({
        from: FROM,
        to: seq.email,
        subject: content.subject.replace("{{name}}", userName),
        html: content.html(userName, seq.email),
      });
      sequenceIds.push(seq.id);
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "All sequences skipped (no content)." }), { status: 200 });
    }

    // Send batch via Resend
    const resendRes = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + RESEND_API_KEY },
      body: JSON.stringify(emails),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json();
      throw new Error("Resend batch error: " + JSON.stringify(err));
    }

    const result = await resendRes.json();

    // Mark all as sent
    const sentAt = new Date().toISOString();
    await supabase.from("email_sequences")
      .update({ status: "sent", sent_at: sentAt })
      .in("id", sequenceIds);

    console.log("Sent", emails.length, "onboarding emails.");
    return new Response(JSON.stringify({ sent: emails.length, result }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("job-onboarding-drip Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
