import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = "Mooring Booking <onboarding@resend.dev>";

function button(href: string, label: string, color: string) {
  return `<a href="${href}" style="background-color:${color};color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;margin:6px;">${label}</a>`;
}

function card(title: string, body: string) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
    <h2 style="color:#0f172a;">${title}</h2>
    ${body}
  </div>`;
}

function detailBox(items: Record<string, string | number | null | undefined>) {
  const rows = Object.entries(items)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `<p style="margin:5px 0;"><strong>${k}:</strong> ${v}</p>`)
    .join('');
  return `<div style="background-color:#f8fafc;padding:15px;border-radius:6px;margin:20px 0;">${rows}</div>`;
}

// ─── Concierge / Quote Request Templates ────────────────────

function conciergeRequestEmail(booking: any, mooring: any, respondUrl: string) {
  return {
    from: FROM_EMAIL,
    to: mooring.contact_email,
    subject: `New Booking Request: ${mooring.name} ⚓`,
    html: card("New Booking Request", `
      <p style="color:#334155;">You have received a booking request for <strong>${mooring.name}</strong>.</p>
      <p style="color:#334155;">Please review the details and <strong>submit your price quote</strong> within <strong>48 hours</strong>.</p>
      ${detailBox({
        "Guest": booking.guest_name,
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
        "Boat": booking.boat_name,
        "Boat length": booking.boat_length ? `${booking.boat_length}m` : null,
        "Special requests": booking.special_requests,
      })}
      <div style="text-align:center;margin:30px 0;">
        ${button(respondUrl, "📝 Submit Your Price Quote", "#2563eb")}
      </div>
      <p style="color:#64748b;font-size:13px;">You can also reply to this email with your price (e.g. "€50 per night").</p>
      <p style="color:#94a3b8;font-size:13px;">If you do not respond within 48 hours, the request will automatically expire.</p>
    `),
  };
}

function now4todayRequestEmail(booking: any, mooring: any, respondUrl: string, providerEmail: string) {
  return {
    from: FROM_EMAIL,
    to: providerEmail,
    subject: `🔴 URGENT: Same-Day Booking Request — ${mooring.name} (3h to respond)`,
    html: card("⚡ URGENT: Same-Day Booking Request", `
      <div style="background-color:#fef2f2;border:2px solid #dc2626;border-radius:8px;padding:15px;margin-bottom:20px;text-align:center;">
        <p style="color:#dc2626;font-size:20px;font-weight:bold;margin:0;">You have 3 HOURS to respond</p>
        <p style="color:#991b1b;font-size:14px;margin:5px 0 0;">Now4Today — Same-day berth request</p>
      </div>
      <p style="color:#334155;">A guest urgently needs a berth at <strong>${mooring.name}</strong> today.</p>
      ${detailBox({
        "Guest": booking.guest_name,
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
        "Boat": booking.boat_name,
        "Boat length": booking.boat_length ? `${booking.boat_length}m` : null,
        "Special requests": booking.special_requests,
      })}
      <div style="text-align:center;margin:30px 0;">
        ${button(respondUrl, "📝 Submit Your Price Quote", "#ea580c")}
      </div>
      <p style="color:#64748b;font-size:13px;">You can also reply to this email with your price (e.g. "€50 per night").</p>
      <p style="color:#dc2626;font-size:13px;font-weight:bold;">If you do not respond within 3 hours, the request will automatically expire.</p>
    `),
  };
}

// ─── Quote Notification to Guest ────────────────────────────

function quoteNotificationEmail(booking: any, mooring: any, quotedPrice: number, acceptUrl: string, declineUrl: string, guestWindowHours: number) {
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Price Quote Received: €${quotedPrice} — ${mooring?.name || 'Mooring'} ⚓`,
    html: card("Price Quote Received!", `
      <p style="color:#334155;">Great news, ${booking.guest_name}! The marina has quoted a price for your booking request.</p>
      ${detailBox({
        "Marina": mooring?.name,
        "Location": mooring?.location,
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
      })}
      <div style="background-color:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#166534;font-size:14px;margin:0;">Quoted Price</p>
        <p style="color:#15803d;font-size:36px;font-weight:bold;margin:5px 0;">€${quotedPrice}</p>
      </div>
      <p style="color:#334155;">You have <strong>${guestWindowHours} hour${guestWindowHours > 1 ? 's' : ''}</strong> to accept or decline this quote.</p>
      <div style="text-align:center;margin:30px 0;">
        ${button(acceptUrl, "✅ Accept & Book", "#16a34a")}
        ${button(declineUrl, "❌ Decline", "#dc2626")}
      </div>
      <p style="color:#94a3b8;font-size:13px;">If you accept, your card will be charged €${quotedPrice}. If you decline or don't respond, no charge.</p>
    `),
  };
}

// ─── Quote Accepted: Guest gets provider details ────────────

function quoteAcceptedGuestEmail(booking: any, mooring: any) {
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Booking Confirmed: ${mooring?.name || 'Mooring'} ✅`,
    html: card("Your Booking is Confirmed!", `
      <p style="color:#334155;">Great news, ${booking.guest_name}! Your booking has been confirmed.</p>
      ${detailBox({
        "Marina": mooring?.name,
        "Location": mooring?.location,
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
        "Total": `€${booking.quoted_price || booking.total_price}`,
      })}
      <h3 style="color:#0f172a;">Marina Contact Details</h3>
      ${detailBox({
        "Email": mooring?.contact_email,
        "Phone": mooring?.contact_phone,
        "VHF Channel": mooring?.vhf_channel,
      })}
      <p style="color:#334155;">Please contact the marina directly for arrival instructions.</p>
      <p style="color:#64748b;font-size:14px;">Fair winds! 🌊 — Mooring Booking</p>
    `),
  };
}

// ─── Quote Accepted: Provider gets full guest details ───────

function quoteAcceptedProviderEmail(booking: any, mooring: any, providerEmail: string) {
  return {
    from: FROM_EMAIL,
    to: providerEmail,
    subject: `Booking Confirmed! Guest accepted your quote — ${mooring?.name || 'Mooring'} 🎉`,
    html: card("Booking Confirmed! 🎉", `
      <p style="color:#334155;">The guest has accepted your price quote for <strong>${mooring?.name || 'Mooring'}</strong>.</p>
      ${detailBox({
        "Total": `€${booking.quoted_price || booking.total_price}`,
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
      })}
      <h3 style="color:#0f172a;">Guest Contact Details</h3>
      ${detailBox({
        "Name": booking.guest_name,
        "Email": booking.guest_email,
        "Phone": booking.guest_phone,
        "Boat": booking.boat_name,
        "Boat length": booking.boat_length ? `${booking.boat_length}m` : null,
      })}
      <div style="text-align:center;margin:30px 0;">
        <a href="https://mooring-booking.com/dashboard" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View Dashboard</a>
      </div>
    `),
  };
}

// ─── Quote Declined by Guest ────────────────────────────────

function quoteDeclinedGuestEmail(booking: any, mooring: any) {
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Booking Update: ${mooring?.name || 'Mooring'}`,
    html: card("Quote Declined", `
      <p style="color:#334155;">Dear ${booking.guest_name},</p>
      <p style="color:#334155;">You have declined the price quote for <strong>${mooring?.name || 'Mooring'}</strong>.</p>
      <p style="color:#334155;">Your card has <strong>not been charged</strong>.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://mooring-booking.com/explore" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Search Other Moorings</a>
      </div>
    `),
  };
}

function quoteDeclinedByGuestProviderEmail(booking: any, mooring: any, providerEmail: string) {
  return {
    from: FROM_EMAIL,
    to: providerEmail,
    subject: `Guest Declined Quote: ${mooring?.name || 'Mooring'}`,
    html: card("Guest Declined Your Quote", `
      <p style="color:#334155;">The guest <strong>${booking.guest_name}</strong> has declined your price quote of <strong>€${booking.quoted_price}</strong> for <strong>${mooring?.name || 'Mooring'}</strong> (${booking.check_in} — ${booking.check_out}).</p>
      <p style="color:#64748b;font-size:14px;">The berth is now available for other guests.</p>
    `),
  };
}

// ─── Expiry Templates ───────────────────────────────────────

function quoteExpiredProviderEmail(booking: any, mooring: any) {
  const window = booking?.booking_type === 'now4today' ? '3 hours' : '48 hours';
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Booking Request Expired: ${mooring?.name || 'Mooring'}`,
    html: card("Booking Request Expired", `
      <p style="color:#334155;">Dear ${booking.guest_name},</p>
      <p style="color:#334155;">Your booking request for <strong>${mooring?.name || 'Mooring'}</strong> (${booking.check_in} — ${booking.check_out}) has expired because the marina did not respond within ${window}.</p>
      <p style="color:#334155;">Your card has <strong>not been charged</strong>.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://mooring-booking.com/explore" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Search Other Moorings</a>
      </div>
    `),
  };
}

function quoteExpiredGuestEmail(booking: any, mooring: any) {
  const window = booking?.booking_type === 'now4today' ? '1 hour' : '24 hours';
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Quote Expired: ${mooring?.name || 'Mooring'}`,
    html: card("Quote Response Expired", `
      <p style="color:#334155;">Dear ${booking.guest_name},</p>
      <p style="color:#334155;">Your quote response window for <strong>${mooring?.name || 'Mooring'}</strong> (€${booking.quoted_price}) has expired after ${window}.</p>
      <p style="color:#334155;">Your card has <strong>not been charged</strong>.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://mooring-booking.com/explore" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Search Other Moorings</a>
      </div>
    `),
  };
}

function quoteExpiredGuestProviderEmail(booking: any, mooring: any, providerEmail: string) {
  return {
    from: FROM_EMAIL,
    to: providerEmail,
    subject: `Guest Did Not Respond: ${mooring?.name || 'Mooring'}`,
    html: card("Guest Did Not Respond", `
      <p style="color:#334155;">The guest <strong>${booking.guest_name || 'Guest'}</strong> did not respond to your price quote of <strong>€${booking.quoted_price}</strong> for <strong>${mooring?.name || 'Mooring'}</strong> within the response window.</p>
      <p style="color:#334155;">The booking has been cancelled and the berth is available again.</p>
    `),
  };
}

// ─── Legacy Concierge Templates (backward compat) ───────────

function conciergeConfirmedEmail(booking: any, mooring: any) {
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Booking Confirmed: ${mooring?.name} ✅`,
    html: card("Your Booking is Confirmed!", `
      <p style="color:#334155;">Great news, ${booking.guest_name}! The marina has confirmed your booking.</p>
      ${detailBox({
        "Marina": mooring?.name,
        "Location": mooring?.location,
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
      })}
      <h3 style="color:#0f172a;">Marina Contact Details</h3>
      ${detailBox({
        "Email": mooring?.contact_email,
        "Phone": mooring?.contact_phone,
        "VHF Channel": mooring?.vhf_channel,
      })}
      <p style="color:#334155;">Please contact the marina directly for arrival instructions.</p>
      <p style="color:#64748b;font-size:14px;">Fair winds! 🌊 — Mooring Booking</p>
    `),
  };
}

function conciergeDeclinedEmail(booking: any, mooring: any) {
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Booking Update: ${mooring?.name}`,
    html: card("Booking Request Update", `
      <p style="color:#334155;">Dear ${booking.guest_name},</p>
      <p style="color:#334155;">Unfortunately, <strong>${mooring?.name}</strong> was unable to accommodate your booking request for ${booking.check_in} — ${booking.check_out}.</p>
      <p style="color:#334155;">Your card has <strong>not been charged</strong>. The authorization hold has been released.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://mooring-booking.com/explore" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Search Other Moorings</a>
      </div>
    `),
  };
}

function conciergeExpiredEmail(booking: any, mooring: any) {
  return {
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject: `Booking Expired: ${mooring?.name}`,
    html: card("Booking Request Expired", `
      <p style="color:#334155;">Dear ${booking.guest_name},</p>
      <p style="color:#334155;">Your booking request for <strong>${mooring?.name}</strong> (${booking.check_in} — ${booking.check_out}) has expired because the marina did not respond within 48 hours.</p>
      <p style="color:#334155;">Your card has <strong>not been charged</strong>.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="https://mooring-booking.com/explore" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Search Other Moorings</a>
      </div>
    `),
  };
}

// ─── Standard Booking Templates ─────────────────────────────

function standardGuestEmail(booking: any, mooring: any, guest_email: string, guest_name: string) {
  return {
    from: FROM_EMAIL,
    to: guest_email,
    subject: `Booking Confirmed: ${mooring?.name || "Mooring"} ⚓`,
    html: card("Your booking is confirmed!", `
      <p style="color:#334155;">Dear ${guest_name || "Guest"},</p>
      <p style="color:#334155;">You have successfully booked <strong>${mooring?.name || "Mooring"}</strong> (${mooring?.location || "Unknown Location"}).</p>
      ${detailBox({
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
        "Confirmation code": booking.confirmation_code,
        "Total price": `€${booking.total_price}`,
      })}
      <p style="color:#64748b;font-size:14px;">Thank you for using Mooring Booking!</p>
    `),
  };
}

function standardProviderEmail(booking: any, mooring: any, providerEmail: string, guest_name: string) {
  return {
    from: FROM_EMAIL,
    to: providerEmail,
    subject: `New booking at your mooring: ${mooring?.name || "Mooring"} 🎉`,
    html: card("New Booking! 🎉", `
      <p style="color:#334155;">You have received a new booking for your mooring <strong>${mooring?.name || "Mooring"}</strong>.</p>
      ${detailBox({
        "Guest": guest_name || "Unknown",
        "Check-in": booking.check_in,
        "Check-out": booking.check_out,
        "Total value": `€${booking.total_price}`,
      })}
      <div style="text-align:center;margin:30px 0;">
        <a href="https://mooring-booking.com/dashboard" style="background-color:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View Dashboard</a>
      </div>
    `),
  };
}

// ─── Main Handler ───────────────────────────────────────────

serve(async (req) => {
  try {
    const payload = await req.json();
    const { type, booking, mooring, provider, guest_email, guest_name, respondUrl, providerEmail,
            quotedPrice, acceptUrl, declineUrl, guestWindowHours, guestExpiresAt,
            bookingId, userId, mooringId } = payload;

    // For expiry jobs that send bookingId instead of full booking object
    let bookingData = booking;
    let mooringData = mooring;

    if (!bookingData && bookingId) {
      const { data } = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/bookings?id=eq.${bookingId}&select=*,moorings(name,location,country,contact_email,contact_phone,vhf_channel)`,
        {
          headers: {
            'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
        }
      ).then(r => r.json());

      if (data?.[0]) {
        bookingData = data[0];
        mooringData = data[0].moorings;
      }
    }

    if (!bookingData) {
      return new Response(JSON.stringify({ error: "No booking data" }), { status: 400 });
    }

    const emails: any[] = [];

    switch (type) {
      // ── Provider request emails ──
      case "concierge_request":
        if (mooringData?.contact_email && respondUrl) {
          emails.push(conciergeRequestEmail(bookingData, mooringData, respondUrl));
        }
        break;

      case "now4today_request":
        if ((providerEmail || mooringData?.contact_email) && respondUrl) {
          emails.push(now4todayRequestEmail(bookingData, mooringData, respondUrl, providerEmail || mooringData.contact_email));
        }
        break;

      // ── Quote notification to guest ──
      case "quote_notification":
        if (bookingData.guest_email && quotedPrice) {
          emails.push(quoteNotificationEmail(bookingData, mooringData, quotedPrice, acceptUrl, declineUrl, guestWindowHours || 24));
        }
        break;

      // ── Quote accepted ──
      case "quote_accepted_guest":
        if (bookingData.guest_email) {
          emails.push(quoteAcceptedGuestEmail(bookingData, mooringData));
        }
        break;

      case "quote_accepted_provider":
        if (providerEmail) {
          emails.push(quoteAcceptedProviderEmail(bookingData, mooringData, providerEmail));
        }
        break;

      // ── Quote declined by guest ──
      case "quote_declined_guest":
        if (bookingData.guest_email) {
          emails.push(quoteDeclinedGuestEmail(bookingData, mooringData));
        }
        break;

      case "quote_declined_by_guest":
        if (providerEmail) {
          emails.push(quoteDeclinedByGuestProviderEmail(bookingData, mooringData, providerEmail));
        }
        break;

      // ── Expiry emails ──
      case "quote_expired_provider":
        if (bookingData.guest_email) {
          emails.push(quoteExpiredProviderEmail(bookingData, mooringData));
        }
        break;

      case "quote_expired_guest":
        if (bookingData.guest_email) {
          emails.push(quoteExpiredGuestEmail(bookingData, mooringData));
        }
        break;

      case "quote_expired_guest_provider":
        if (providerEmail) {
          emails.push(quoteExpiredGuestProviderEmail(bookingData, mooringData, providerEmail));
        }
        break;

      // ── Legacy concierge (backward compat) ──
      case "concierge_confirmed":
      case "now4today_confirmed":
        if (bookingData.guest_email) {
          emails.push(conciergeConfirmedEmail(bookingData, mooringData));
        }
        break;

      case "concierge_declined":
      case "now4today_declined":
        if (bookingData.guest_email) {
          emails.push(conciergeDeclinedEmail(bookingData, mooringData));
        }
        break;

      case "concierge_expired":
        if (bookingData.guest_email) {
          emails.push(conciergeExpiredEmail(bookingData, mooringData));
        }
        break;

      // ── Standard booking emails ──
      default: {
        const guestAddr = guest_email || bookingData.guest_email;
        const guestName = guest_name || bookingData.guest_name;
        const provAddr = providerEmail || provider?.email || provider?.raw_user_meta_data?.email;

        if (guestAddr) {
          emails.push(standardGuestEmail(bookingData, mooringData, guestAddr, guestName));
        }
        if (provAddr) {
          emails.push(standardProviderEmail(bookingData, mooringData, provAddr, guestName));
        }
        break;
      }
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ message: "No viable emails to send." }), { status: 200 });
    }

    const resendRes = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emails),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend Error:", data);
      throw new Error(`Resend Error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
