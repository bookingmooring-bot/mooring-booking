import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const WINDY_API_KEY = Deno.env.get("WINDY_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const RATE_LIMIT_HOURS = 6;

interface UserRow {
  id: string;
  expo_push_token: string;
  last_known_lat: number;
  last_known_lng: number;
  storm_wind_threshold_kn: number;
  storm_wave_threshold_m: number;
  full_name: string | null;
}

interface WindyPoint {
  windKn: number;
  gustKn: number;
  waveM: number;
}

async function fetchWindyPoint(lat: number, lng: number): Promise<WindyPoint> {
  const [atmoRes, waveRes] = await Promise.all([
    fetch("https://api.windy.com/api/point-forecast/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: WINDY_API_KEY, lat, lon: lng, model: "iconEu", parameters: ["wind", "gust"] }),
    }),
    fetch("https://api.windy.com/api/point-forecast/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: WINDY_API_KEY, lat, lon: lng, model: "gfsWave", parameters: ["waves"] }),
    }),
  ]);

  const atmo = await atmoRes.json();
  const wave = await waveRes.json();

  const windU = atmo["wind_u-surface"] as number[] | undefined;
  const windV = atmo["wind_v-surface"] as number[] | undefined;
  const gustArr = atmo["gust-surface"] as number[] | undefined;
  const waveArr = wave["waves-surface"] as number[] | undefined;

  // Look at next 24h of 3-hourly data (8 points)
  let maxWindKn = 0;
  let maxGustKn = 0;
  const lookAhead = Math.min(8, windU?.length ?? 0);
  for (let i = 0; i < lookAhead; i++) {
    const u = windU?.[i] ?? 0;
    const v = windV?.[i] ?? 0;
    const spd = Math.sqrt(u * u + v * v) * 1.94384;
    if (spd > maxWindKn) maxWindKn = spd;
    const g = (gustArr?.[i] ?? 0) * 1.94384;
    if (g > maxGustKn) maxGustKn = g;
  }

  let maxWaveM = 0;
  const waveLook = Math.min(8, waveArr?.length ?? 0);
  for (let i = 0; i < waveLook; i++) {
    const w = waveArr?.[i] ?? 0;
    if (w > maxWaveM) maxWaveM = w;
  }

  return {
    windKn: Math.round(maxWindKn * 10) / 10,
    gustKn: Math.round(maxGustKn * 10) / 10,
    waveM: Math.round(maxWaveM * 10) / 10,
  };
}

async function sendExpoPush(token: string, title: string, body: string, data?: Record<string, unknown>) {
  await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ to: token, sound: "default", title, body, data: data ?? {} }),
  });
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch premium users with push tokens, location, and storm alerts enabled
  const { data: users, error: usersErr } = await supabase
    .from("profiles")
    .select("id, expo_push_token, last_known_lat, last_known_lng, storm_wind_threshold_kn, storm_wave_threshold_m, full_name")
    .eq("storm_alerts_enabled", true)
    .not("expo_push_token", "is", null)
    .not("last_known_lat", "is", null)
    .not("last_known_lng", "is", null)
    .in("subscription_tier", ["premium-monthly", "premium-annual"]);

  if (usersErr) {
    return new Response(JSON.stringify({ error: usersErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const typedUsers = (users ?? []) as UserRow[];
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of typedUsers) {
    try {
      // Rate limit: check last alert within RATE_LIMIT_HOURS
      const cutoff = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString();
      const { data: recentAlerts } = await supabase
        .from("storm_alert_log")
        .select("id")
        .eq("user_id", user.id)
        .gte("sent_at", cutoff)
        .limit(1);

      if (recentAlerts && recentAlerts.length > 0) {
        skipped++;
        continue;
      }

      const weather = await fetchWindyPoint(user.last_known_lat, user.last_known_lng);

      const windExceeds = weather.windKn >= user.storm_wind_threshold_kn;
      const waveExceeds = weather.waveM >= user.storm_wave_threshold_m;

      if (!windExceeds && !waveExceeds) {
        skipped++;
        continue;
      }

      // Build alert message
      const parts: string[] = [];
      if (windExceeds) parts.push(`Wind ${weather.windKn}kn (gusts ${weather.gustKn}kn)`);
      if (waveExceeds) parts.push(`Waves ${weather.waveM}m`);
      const body = `${parts.join(", ")} expected in the next 24h near your location. Stay safe!`;

      await sendExpoPush(user.expo_push_token, "⚠️ Storm Alert", body, {
        type: "storm_alert",
        windKn: weather.windKn,
        waveM: weather.waveM,
      });

      // Log the alert
      await supabase.from("storm_alert_log").insert({
        user_id: user.id,
        wind_kn: weather.windKn,
        wave_m: weather.waveM,
        location_lat: user.last_known_lat,
        location_lng: user.last_known_lng,
      });

      sent++;
    } catch (err) {
      errors.push(`${user.id}: ${err.message}`);
    }
  }

  return new Response(JSON.stringify({ total: typedUsers.length, sent, skipped, errors }), {
    headers: { "Content-Type": "application/json" },
  });
});
