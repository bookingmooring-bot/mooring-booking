import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushPayload {
  expoPushToken: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { expoPushToken, title, body, data } = (await req.json()) as PushPayload;

    if (!expoPushToken || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields: expoPushToken, title, body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: data ?? {},
    };

    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await res.json();

    if (result.data?.[0]?.status === "error") {
      return new Response(JSON.stringify({ error: result.data[0].message, details: result.data[0] }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, ticket: result.data?.[0] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
