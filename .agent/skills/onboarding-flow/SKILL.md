---
name: onboarding-flow
description: >
  Implements multi-step onboarding email sequences for new users and new mooring providers
  in the Mooring Booking app. Use this skill whenever the user wants to:
  — Create a drip/sequence of emails sent over days after someone registers (Day 1, Day 3, Day 7)
  — Build an onboarding email flow for new sailor/captain accounts
  — Build a separate onboarding sequence for new mooring providers
  — Reactivate inactive users with a win-back email campaign
  — Track which onboarding emails have been sent to each user
  — Add a `onboarding_step` column or `email_sequences` table to track progress
  — Schedule onboarding emails via Supabase Cron Jobs
  — Build a `job-onboarding-drip` Edge Function that processes pending email sequences
  — Implement unsubscribe or opt-out from onboarding emails
  — Improve the first welcome email (Day 0) to set up the onboarding tone
  Trigger on: "onboarding email", "email sekvenca", "drip kampanja", "drip email",
  "sekvenca dobrodošlice", "email tijek", "welcome sequence", "email flow",
  "novi korisnik email dana 1", "email nakon registracije", "email 3 dana",
  "email tjedan dana", "reaktivacija korisnika", "win-back email",
  "neaktivni korisnici email", "pošalji email poslje 3 dana", "email sekvenca provajder",
  "onboard provider email", "tip 1 tip 2 email", "lead nurturing mooring",
  "slijed emailova", "marketinška sekvenca", "follow-up email".
  ALWAYS use this skill when the request involves a multi-step or time-delayed email process,
  not just a single one-time email.
---

# Onboarding Flow Skill — Mooring Booking

## 🧭 Overview

This skill handles **multi-step email sequences** — drip campaigns that are sent to users on a schedule after they register or take a key action. These run via **Supabase Cron Jobs** and an **`email_sequences` tracking table**.

### Key Details

| Item | Value |
|------|-------|
| **Resend API Key** | `re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe` (secret: `RESEND_API_KEY`) |
| **Supabase project** | `bblxawscmyzelinidkmb` |
| **App URL** | `https://mooringbooking.com` |

---

## 📅 Onboarding Sequences

### Sequence A: New Sailor/Captain

| Day | Subject | Goal |
|-----|---------|------|
| Day 0 | "Dobrodošli u Mooring Booking! ⚓" | Welcome + explore CTA |
| Day 2 | "Kako funkcioniše rezervacija veza?" | Educate about the booking process |
| Day 5 | "Otkrijte vezove u vašoj regiji 🗺️" | Drive first booking |
| Day 10 | "Postanite Premium Kapetan i uštedite" | Upsell to premium plan |

### Sequence B: New Provider (Mooring Owner)

| Day | Subject | Goal |
|-----|---------|------|
| Day 0 | "Vaša prijava je primljena! ⚓" | Confirmation + next steps |
| Day 1 | "Kako optimizovati vaš vez za više rezervacija?" | Tips for better listings |
| Day 5 | "Podesite cijene i dostupnost" | Drive profile completion |
| Day 14 | "Vaš payout je spreman — povežite Stripe" | Stripe Connect CTA |

---

## 🗄️ Database Schema

Create the tracking table via `apply_migration`:

```sql
CREATE TABLE IF NOT EXISTS email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  sequence_type text NOT NULL,        -- 'sailor_onboarding' | 'provider_onboarding' | 'winback'
  step integer NOT NULL DEFAULT 0,    -- which step in the sequence (0, 1, 2, ...)
  sent_at timestamptz,                -- when this step was sent
  scheduled_for date,                 -- when this step should be sent
  status text DEFAULT 'pending',      -- pending | sent | skipped | unsubscribed
  created_at timestamptz DEFAULT now()
);

-- Index for fast daily queries
CREATE INDEX IF NOT EXISTS idx_email_sequences_pending 
  ON email_sequences(status, scheduled_for)
  WHERE status = 'pending';

-- RLS: users can see only their own sequences
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sequences" ON email_sequences
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 🚀 Enrolling a User in a Sequence

Call this logic when a user registers (from `send-welcome-email` or frontend after sign-up):

```typescript
// Enroll user in sailor onboarding sequence
const steps = [
  { step: 0, daysFromNow: 0 },   // Day 0: immediate welcome
  { step: 1, daysFromNow: 2 },   // Day 2
  { step: 2, daysFromNow: 5 },   // Day 5
  { step: 3, daysFromNow: 10 },  // Day 10
];

const today = new Date();
const records = steps.map(({ step, daysFromNow }) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromNow);
  return {
    user_id: userId,
    email: userEmail,
    sequence_type: 'sailor_onboarding',
    step,
    scheduled_for: d.toISOString().split('T')[0],
    status: 'pending',
  };
});

await supabase.from('email_sequences').insert(records);
```

---

## ⚙️ Cron Job: `job-onboarding-drip`

Runs daily to send any pending sequence emails due today.

**Deploy**: `supabase/functions/job-onboarding-drip/index.ts`
**Schedule**: `0 9 * * *` (daily at 09:00 UTC)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const EMAIL_CONTENT = {
  sailor_onboarding: [
    {
      subject: "Dobrodošli u Mooring Booking! ⚓",
      html: (email: string) => `<div>...welcome email HTML...</div>`,
    },
    {
      subject: "Kako funkcioniše rezervacija veza?",
      html: (email: string) => `<div>...educational email HTML...</div>`,
    },
    // ... more steps
  ],
  provider_onboarding: [
    // ... provider steps
  ],
};

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const today = new Date().toISOString().split("T")[0];

  // Fetch all pending emails due today
  const { data: pending, error } = await supabase
    .from("email_sequences")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", today);

  if (error) throw error;
  if (!pending?.length) {
    return new Response(JSON.stringify({ message: "No emails due today." }), { status: 200 });
  }

  let sentCount = 0;

  for (const seq of pending) {
    const content = EMAIL_CONTENT[seq.sequence_type]?.[seq.step];
    if (!content) {
      // Mark as skipped if no content for this step
      await supabase.from("email_sequences").update({ status: "skipped" }).eq("id", seq.id);
      continue;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Mooring Booking <onboarding@resend.dev>",
          to: seq.email,
          subject: content.subject,
          html: content.html(seq.email),
        }),
      });

      if (res.ok) {
        await supabase
          .from("email_sequences")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", seq.id);
        sentCount++;
      }
    } catch (err) {
      console.error(`Failed for sequence ${seq.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ sent: sentCount }), { status: 200 });
});
```

---

## 🔕 Unsubscribe / Opt-Out

To let users unsubscribe from sequences:

```sql
-- Mark all pending sequences for a user as unsubscribed
UPDATE email_sequences
SET status = 'unsubscribed'
WHERE user_id = '<user_id>' AND status = 'pending';
```

Add an unsubscribe link to each email:
```html
<p style="color: #94a3b8; font-size: 12px; text-align: center;">
  <a href="https://mooringbooking.com/unsubscribe?uid=[user_id]">Odjava od emailova</a>
</p>
```

---

## 📊 Win-Back Campaign

For users who haven't logged in for 30+ days:

```sql
-- Find inactive users with no recent bookings
SELECT p.id, p.email, p.full_name
FROM profiles p
WHERE p.last_login_at < NOW() - INTERVAL '30 days'
  AND p.id NOT IN (
    SELECT user_id FROM email_sequences
    WHERE sequence_type = 'winback' AND created_at > NOW() - INTERVAL '60 days'
  );
```

Enroll them in a `winback` sequence with 1-2 re-engagement emails.

---

## ✅ Implementation Checklist

- [ ] Create `email_sequences` table (apply_migration)
- [ ] Update `send-welcome-email` to enroll user in sailor sequence
- [ ] Create `job-onboarding-drip` edge function
- [ ] Deploy `job-onboarding-drip`
- [ ] Register cron job via SQL (`cron.schedule`)
- [ ] Write email HTML for each sequence step
- [ ] Test by inserting a sequence record with today's date
