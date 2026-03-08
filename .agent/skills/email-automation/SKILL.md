---
name: email-automation
description: >
  Builds, improves, and deploys email automation for the Mooring Booking app using Resend API.
  Use this skill whenever the user wants to:
  — Send automated emails to guests when a booking is confirmed, cancelled, or modified
  — Send automated emails to providers (mooring owners) when they receive a new booking
  — Send a welcome email to new users on registration (auth trigger)
  — Send a welcome/onboarding email to new providers after mooring application approval
  — Add or improve the `send-booking-emails` Supabase Edge Function
  — Add or improve the `send-welcome-email` Supabase Edge Function
  — Improve HTML email templates (design, branding, content)
  — Add cancellation email, booking modification email, or any new email type
  — Fix email delivery issues, "from" domain issues, or Resend API errors
  — Change the sender address or "from" name on emails
  — Add email logging (save sent emails to a DB table)
  — Switch from `onboarding@resend.dev` to a custom verified domain
  Trigger on: "pošalji email", "slanje emailova", "email automatizacija", "email confirmation",
  "potvrda rezervacije email", "dobrodošlica email", "welcome email", "booking email",
  "email provider", "email gost", "resend", "email template", "HTML email", "email dizajn",
  "pošalji potvrdu", "booking confirmation email", "cancel email", "otkaži booking email",
  "send email on booking", "email when booking", "trigger email", "email na rezervaciju",
  "email na registraciju", "aktiviraj email", "pošalji welcome email", "email korisnicima".
  ALWAYS use this skill when any email sending, email template, or Resend integration is discussed.
---

# Email Automation Skill — Mooring Booking

## 🧭 Overview

This app uses **Resend** (https://resend.com) for transactional email delivery via **Supabase Edge Functions**.

### Key Info

| Item | Value |
|------|-------|
| **Resend API Key secret name** | `RESEND_API_KEY` |
| **Resend API Key (hardcoded fallback)** | `re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe` |
| **Current "from" address** | `Mooring Booking <onboarding@resend.dev>` |
| **Supabase project ID** | `bblxawscmyzelinidkmb` |
| **App URL** | `https://mooringbooking.com` |
| **Language** | Serbian/Croatian (sr/hr) |

> ⚠️ **Domain note**: The app uses `onboarding@resend.dev` because the real domain is not yet verified in Resend. When the user verifies their domain, change the `from` field to `noreply@mooringbooking.com`.

---

## 📦 Existing Edge Functions

All functions live under `supabase/functions/` in the app directory.

### 1. `send-booking-emails` — **Booking Confirmation**
- **Trigger**: Called manually from the frontend after a booking is created (in `useBookings.ts` or similar)
- **Sends**: Two emails in one batch — confirmation to guest + notification to provider
- **Payload**:
  ```json
  {
    "booking": { "check_in": "...", "check_out": "...", "confirmation_code": "...", "total_price": 150 },
    "mooring": { "name": "...", "location": "..." },
    "provider": { "email": "...", "raw_user_meta_data": { "email": "..." } },
    "guest_email": "guest@example.com",
    "guest_name": "Marko Marković"
  }
  ```
- **API**: `POST /send-booking-emails`

### 2. `send-welcome-email` — **New User Welcome**
- **Trigger**: Supabase DB webhook on `INSERT` to `auth.users` OR called from frontend after sign-up
- **Sends**: Welcome email to new user
- **Payload**: `{ "record": { "email": "...", "raw_user_meta_data": { "full_name": "..." } } }`
- **API**: `POST /send-welcome-email`

### 3. `job-checkin-reminders` — **24h Check-in Reminder** (Cron Job)
- **Trigger**: Supabase Cron Job, runs daily (e.g., every morning at 08:00 UTC)
- **Sends**: Reminder email to all guests whose check-in date is tomorrow
- **No payload needed** — function queries the DB itself

### 4. `job-review-requests` — **Post-Stay Review Request** (Cron Job)
- **Trigger**: Supabase Cron Job, runs daily (e.g., every morning at 10:00 UTC)
- **Sends**: Review request email to all guests whose check-out date was yesterday
- **No payload needed** — function queries the DB itself

---

## 🆕 Adding a New Email Type

To add a new email (e.g., cancellation email, booking modification, provider approval):

### Step 1: Create the Edge Function

```
supabase/functions/send-<name>/index.ts
```

Use this template:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";

serve(async (req) => {
  try {
    const payload = await req.json();
    // Extract required fields from payload...

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mooring Booking <onboarding@resend.dev>",
        to: recipientEmail,
        subject: "...",
        html: `...HTML email body...`,
      }),
    });

    const data = await resendRes.json();
    if (!resendRes.ok) throw new Error(`Resend Error: ${JSON.stringify(data)}`);
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
```

### Step 2: Deploy via Supabase MCP

Use `deploy_edge_function` MCP tool:
```
name: "send-<name>"
project_id: "bblxawscmyzelinidkmb"
verify_jwt: false  // for DB webhook triggers
```

### Step 3: Call from Frontend (if triggered by user action)

In the relevant hook (e.g., `useBookings.ts`), after the DB operation:
```typescript
await supabase.functions.invoke('send-<name>', {
  body: { /* payload */ }
});
```

---

## 📧 Email Template Guidelines

All email templates should follow these design rules:

```html
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 30px 40px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚓ Mooring Booking</h1>
  </div>
  
  <!-- Body -->
  <div style="padding: 30px 40px;">
    <h2 style="color: #0f172a; margin-top: 0;">[Title]</h2>
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">[Content]</p>
    
    <!-- Info Box -->
    <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0; color: #1e293b;"><strong>Key:</strong> Value</p>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="[URL]" style="background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
        [Button Text]
      </a>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 13px; margin: 0;">© 2025 Mooring Booking · Tim vam želi mirno more i siguran vez ⚓</p>
  </div>
  
</div>
```

---

## 🔧 Email Events Reference

| Event | Function | Trigger Type |
|-------|----------|--------------|
| New booking confirmed | `send-booking-emails` | Frontend (manual invoke) |
| New user registered | `send-welcome-email` | DB webhook / frontend |
| Booking check-in tomorrow | `job-checkin-reminders` | Cron job (daily 08:00 UTC) |
| Booking checkout yesterday | `job-review-requests` | Cron job (daily 10:00 UTC) |
| Booking cancelled | `send-booking-cancelled` | Frontend (to be created) |
| Provider mooring approved | `send-mooring-approved` | Admin action (to be created) |
| Affiliate application | `send-affiliate-welcome` | DB trigger (to be created) |

---

## ⚙️ Setting `RESEND_API_KEY` Secret in Supabase

If the secret is missing or wrong, set it via Supabase Dashboard:
1. Go to **Project Settings → Edge Functions → Secrets**
2. Add secret: `RESEND_API_KEY` = `re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe`

Or via CLI: `supabase secrets set RESEND_API_KEY=re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe`

---

## 🐛 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "You can only send from verified domains" | Use `onboarding@resend.dev` as from address |
| Email not received | Check spam folder; check Resend dashboard logs |
| `RESEND_API_KEY` undefined | Set the secret in Supabase Edge Functions settings |
| Batch emails fail | Use `/emails/batch` endpoint for sending 2+ emails at once |
| Guest email missing | Ensure `guest_email` is stored on the bookings table |
