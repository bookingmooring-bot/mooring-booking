import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
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
      subject: "How does mooring booking work? \u2693",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">How does mooring booking work?</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Booking a mooring on Mooring Booking is simple \u2014 just 3 steps:</p>',
        '<div style="counter-reset:steps">',
        '<div style="display:flex;align-items:flex-start;margin:16px 0;gap:16px">',
        '<span style="background:#2563eb;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0">1</span>',
        '<div><strong>Find a mooring</strong><br><span style="color:#64748b">Use the map or search to find the perfect berth for your boat.</span></div>',
        '</div>',
        '<div style="display:flex;align-items:flex-start;margin:16px 0;gap:16px">',
        '<span style="background:#2563eb;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0">2</span>',
        '<div><strong>Choose your dates</strong><br><span style="color:#64748b">Check availability and select your check-in and check-out dates.</span></div>',
        '</div>',
        '<div style="display:flex;align-items:flex-start;margin:16px 0;gap:16px">',
        '<span style="background:#2563eb;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0">3</span>',
        '<div><strong>Pay and receive confirmation</strong><br><span style="color:#64748b">Secure online payment and instant confirmation with your booking code.</span></div>',
        '</div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/explore" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Book your first mooring \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 2 — Day 5: Discover moorings in your region
    {
      subject: "Discover moorings in your region \ud83d\uddfa\ufe0f",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Discover moorings in your region \ud83d\uddfa\ufe0f</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">On Mooring Booking you can find moorings across the entire Mediterranean \u2014 from the Adriatic to the Aegean.</p>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\udded\ud83c\uddf7</div><strong>Croatia</strong><br><span style="color:#64748b;font-size:13px">Dalmatia, Istria, Kvarner</span></div>',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\uddec\ud83c\uddf7</div><strong>Greece</strong><br><span style="color:#64748b;font-size:13px">Ionian Islands, Aegean</span></div>',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\uddee\ud83c\uddf9</div><strong>Italy</strong><br><span style="color:#64748b;font-size:13px">Sicily, Sardinia</span></div>',
        '<div style="background:#f8fafc;padding:16px;border-radius:8px;text-align:center"><div style="font-size:24px">\ud83c\uddf2\ud83c\uddea</div><strong>Montenegro</strong><br><span style="color:#64748b;font-size:13px">Bay of Kotor</span></div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/explore" style="background:#16a34a;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Explore on Map \ud83d\uddfa\ufe0f</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 3 — Day 10: Upgrade to premium
    {
      subject: "Become a Premium Captain \u2014 book more, pay less \ud83d\udc51",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Become a Premium Captain \ud83d\udc51</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Upgrade to the Premium plan and enjoy exclusive benefits:</p>',
        '<div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;border-radius:10px;margin:20px 0;color:#fff">',
        '<h3 style="margin:0 0 16px;color:#fff">\u2728 Premium Plan</h3>',
        '<ul style="list-style:none;padding:0;margin:0">',
        '<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2)">\u2705 Unlimited AI Captain (nautical assistant)</li>',
        '<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2)">\u2705 Priority support</li>',
        '<li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2)">\u2705 Exclusive discounts on premium moorings</li>',
        '<li style="padding:8px 0">\u2705 Advanced weather forecasts</li>',
        '</ul>',
        '<div style="margin-top:16px;font-size:22px;font-weight:bold">\u20ac9.99/mo <span style="font-size:14px;font-weight:normal;opacity:0.8">(annual plan)</span></div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/pricing" style="background:#f59e0b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Upgrade to Premium \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
        '</div>',
      ].join(""),
    },
  ],

  provider_onboarding: [
    // Step 0: sent by send-mooring-status trigger
    { subject: "", html: () => "" },

    // Step 1 — Day 1: Tips for better listing
    {
      subject: "How to optimise your mooring and attract more bookings? \ud83d\udca1",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Tips for a better listing \ud83d\udca1</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Thank you for registering your mooring on Mooring Booking! Here\'s how to increase your bookings:</p>',
        '<div style="margin:20px 0">',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px;border-radius:6px;margin:12px 0">',
        '<strong>\ud83d\udcf8 Add high-quality photos</strong><br>',
        '<span style="color:#64748b;font-size:14px">Moorings with 5+ photos get 3x more bookings.</span>',
        '</div>',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px;border-radius:6px;margin:12px 0">',
        '<strong>\ud83d\udcdd Write a detailed description</strong><br>',
        '<span style="color:#64748b;font-size:14px">Describe the location, water depth, amenities and nearby services.</span>',
        '</div>',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px;border-radius:6px;margin:12px 0">',
        '<strong>\ud83d\udcc5 Keep availability updated</strong><br>',
        '<span style="color:#64748b;font-size:14px">Regularly update your availability calendar for better ranking.</span>',
        '</div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/dashboard" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Edit Your Mooring \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 2 — Day 5: Set pricing and availability
    {
      subject: "Set your prices and availability for the 2025 season \ud83d\udcc5",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Season is approaching \u2014 are you ready? \ud83c\udf0a</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Sailors are starting to book moorings for the summer season. Make sure your mooring is ready:</p>',
        '<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:6px;margin:20px 0">',
        '<strong>\u26a0\ufe0f Action needed:</strong>',
        '<ul style="color:#334155;padding-left:20px;margin:8px 0">',
        '<li>Set seasonal prices (June, July, August)</li>',
        '<li>Mark unavailable dates (e.g. personal use)</li>',
        '<li>Enable or disable the Now4Today option</li>',
        '</ul>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/dashboard" style="background:#f59e0b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Set Prices \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 3 — Day 14: Set up Stripe Connect
    {
      subject: "Your payout is ready \u2014 connect Stripe in 2 minutes \ud83d\udcb3",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">Start receiving payments directly to your account! \ud83d\udcb3</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">Connect your Stripe account to receive 85% of every booking directly to your bank account.</p>',
        '<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:6px;margin:20px 0">',
        '<strong>\ud83d\udcb0 How payments work:</strong>',
        '<ul style="color:#334155;padding-left:20px;margin:8px 0">',
        '<li>Guest pays the full booking price</li>',
        '<li><strong>85% goes directly to you</strong> (automatically)</li>',
        '<li>15% is the Mooring Booking platform fee</li>',
        '</ul>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/dashboard?tab=stripe" style="background:#16a34a;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Connect Stripe Account \u2192</a>',
        '</div>',
        '<p style="color:#64748b;font-size:13px;text-align:center">Setup takes 2-3 minutes. Payments arrive in your account automatically.</p>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
        '</div>',
      ].join(""),
    },
  ],

  winback: [
    // Step 0 — reactivation email
    {
      subject: "We miss you, " + "{{name}}" + "! New moorings are waiting \u2693",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">We miss you! \ud83c\udf0a</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">We noticed you haven\'t visited Mooring Booking in a while. A lot has changed!</p>',
        '<div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:6px;margin:20px 0">',
        '<strong>\ud83c\udf1f What\'s new:</strong>',
        '<ul style="color:#334155;padding-left:20px;margin:8px 0">',
        '<li>AI Captain \u2014 your personal nautical assistant</li>',
        '<li>New moorings in HR, GR, IT, ME</li>',
        '<li>Improved ratings and review system</li>',
        '</ul>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/explore" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Come back and explore \u2192</a>',
        '</div>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
        '</div>',
      ].join(""),
    },

    // Step 1 — Day 7: Last chance
    {
      subject: "Last chance \u2014 a special offer just for you \ud83c\udf81",
      html: (name, email) => [
        '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:28px;border:1px solid #e2e8f0;border-radius:10px">',
        '<h2 style="color:#0f172a">A special comeback offer! \ud83c\udf81</h2>',
        '<p style="color:#334155">Dear <strong>' + name + '</strong>,</p>',
        '<p style="color:#334155">As a returning member of Mooring Booking, we\'re offering you special access to the Premium plan:</p>',
        '<div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;border-radius:10px;margin:20px 0;color:#fff;text-align:center">',
        '<div style="font-size:36px;font-weight:bold">\u20ac0</div>',
        '<div>First month of Premium free</div>',
        '<div style="font-size:13px;opacity:0.8;margin-top:8px">*For users who return within 7 days</div>',
        '</div>',
        '<div style="text-align:center;margin:28px 0">',
        '<a href="' + APP_URL + '/pricing" style="background:#f59e0b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Claim the offer \u2192</a>',
        '</div>',
        '<p style="color:#94a3b8;font-size:12px;text-align:center">Offer valid for 7 days from receipt of this email.</p>',
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">',
        '<p style="color:#94a3b8;font-size:11px;text-align:center"><a href="' + APP_URL + '/unsubscribe?email=' + email + '" style="color:#94a3b8">Unsubscribe</a></p>',
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
      let userName = "Captain";
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
