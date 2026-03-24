import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_XbnXxMwG_8CN3Kwf1TeqiETK23ucd7tVe";

serve(async (req) => {
    try {
        const payload = await req.json();
        const { booking, mooring, provider, guest_email, guest_name } = payload;

        if (!booking) {
            return new Response(JSON.stringify({ error: "No booking data" }), { status: 400 });
        }

        const { check_in, check_out, confirmation_code, total_price } = booking;
        const mooringName = mooring?.name || "Mooring";
        const mooringLocation = mooring?.location || "Unknown Location";
        const providerEmail = provider?.email || provider?.raw_user_meta_data?.email;

        const emails = [];

        // 1. Email to Guest
        if (guest_email) {
            emails.push({
                from: "Mooring Booking <onboarding@resend.dev>",
                to: guest_email,
                subject: `Booking Confirmed: ${mooringName} ⚓`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">Your booking is confirmed!</h2>
            <p style="color: #334155;">Dear ${guest_name || "Guest"},</p>
            <p style="color: #334155;">You have successfully booked <strong>${mooringName}</strong> (${mooringLocation}).</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Check-in:</strong> ${check_in}</p>
              <p style="margin: 5px 0;"><strong>Check-out:</strong> ${check_out}</p>
              <p style="margin: 5px 0;"><strong>Confirmation code:</strong> ${confirmation_code}</p>
              <p style="margin: 5px 0;"><strong>Total price:</strong> €${total_price}</p>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">Thank you for using Mooring Booking!</p>
          </div>
        `
            });
        }

        // 2. Email to Provider
        if (providerEmail) {
            emails.push({
                from: "Mooring Booking <onboarding@resend.dev>",
                to: providerEmail,
                subject: `New booking at your mooring: ${mooringName} 🎉`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a;">New Booking! 🎉</h2>
            <p style="color: #334155;">You have received a new booking for your mooring <strong>${mooringName}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Guest:</strong> ${guest_name || "Unknown"}</p>
              <p style="margin: 5px 0;"><strong>Check-in:</strong> ${check_in}</p>
              <p style="margin: 5px 0;"><strong>Check-out:</strong> ${check_out}</p>
              <p style="margin: 5px 0;"><strong>Total value:</strong> €${total_price}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://mooringbooking.com/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Dashboard</a>
            </div>
          </div>
        `
            });
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
