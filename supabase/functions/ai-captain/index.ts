import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const WINDY_API_KEY = Deno.env.get("WINDY_API_KEY") ?? "4w1wpCKBi8zaoPySF3fMcXfXjUQQGzJy";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIM = 768;

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Intent classifier (FAZA 4) ────────────────────────────────────────────────
type Intent =
    | "SEARCH_MOORING"
    | "DIAGNOSE_ENGINE"
    | "CHECK_WEATHER"
    | "EMERGENCY"
    | "BOOKING_HELP"
    | "NAVIGATION_ROUTE"
    | "GENERAL_CHAT";

const INTENT_KEYWORDS: Array<{ intent: Intent; words: string[] }> = [
    {
        intent: "EMERGENCY",
        words: [
            "mayday", "sos", "tonem", "tonemo", "potapam", "sinking", "distress",
            "u opasnosti", "help us", "pomoć", "pomoc", "gorimo", "fire on board",
            "man overboard", "čovjek u moru", "covjek u moru", "collision", "sudar",
        ],
    },
    {
        intent: "DIAGNOSE_ENGINE",
        words: [
            "motor", "engine", "kvar", "breakdown", "crkao", "ne pali", "won't start",
            "dim", "smoke", "propeler", "propeller", "akumulator", "battery", "starter",
            "alternator", "hladnjak", "coolant", "overheat", "pregrijava", "vibracij",
            "vibration", "zupčanik", "gearbox", "goriv", "fuel", "dizel", "gas leak",
        ],
    },
    {
        intent: "SEARCH_MOORING",
        words: [
            "vez", "veza", "vezovi", "vezova", "slobodan", "slobodni", "slobodnih",
            "mooring", "marina", "luka", "lukama", "pier", "berth",
            "rezerv", "booking", "knjiga", "bookiraj", "bookirati",
            "privez", "priveza", "privežem", "privezati", "privezujem",
            "ima li", "imate li", "postoji li", "gdje da pristanem",
            "gdje mogu", "gdje bih mogao", "preporuk", "preporuč",
            "available", "find a berth", "find mooring", "any free",
            "slobodno mjesto", "kako rezervirati", "kako bookirati",
        ],
    },
    {
        intent: "CHECK_WEATHER",
        words: [
            "vrijeme", "vremen", "prognoza", "forecast", "weather",
            "bura", "jugo", "maestral", "tramontana", "levant", "scirocco", "mistral",
            "vjetar", "vjetra", "wind", "winds", "gust",
            "valov", "waves", "swell", "valovi",
            "oluj", "storm", "grm", "lightning", "thunder", "kiša", "rain",
            "hoće li biti", "will there be", "can we sail", "safe to sail",
        ],
    },
    {
        intent: "NAVIGATION_ROUTE",
        words: [
            "rut", "route", "navigacij", "navigation", "kurs", "course", "heading",
            "put do", "put za", "how to get to", "distance", "udaljenost",
            "koliko treba", "how long", "hours sailing", "sati plovidbe",
            "bearing", "azimut", "nm", "nautical mile", "nautičk",
        ],
    },
    {
        intent: "BOOKING_HELP",
        words: [
            "kako platiti", "how to pay", "otkazati", "cancel", "refund", "povrat",
            "provizij", "commission", "rezervaciju", "my booking", "moja rezervacija",
            "potvrda", "confirmation", "račun", "invoice", "faktura", "payment",
            "membership", "pretplata", "premium", "upgrade",
        ],
    },
];

function classifyIntent(message: string): Intent {
    const lower = message.toLowerCase();
    // Emergency always wins, even if phrased as a "question about weather"
    for (const { intent, words } of INTENT_KEYWORDS) {
        if (intent === "EMERGENCY" && words.some((w) => lower.includes(w))) return "EMERGENCY";
    }
    // Score-based match across remaining intents: longest hit wins to handle overlaps
    // (e.g., "marina vrijeme" → SEARCH_MOORING wins over CHECK_WEATHER because "marina" is longer).
    let best: { intent: Intent; score: number } = { intent: "GENERAL_CHAT", score: 0 };
    for (const { intent, words } of INTENT_KEYWORDS) {
        if (intent === "EMERGENCY") continue;
        for (const w of words) {
            if (lower.includes(w) && w.length > best.score) {
                best = { intent, score: w.length };
            }
        }
    }
    return best.intent;
}

// ── Navigation helpers (Sprint 1.3) ──────────────────────────────────────────
function haversineNm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (d: number) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(km / 1.852).toFixed(1);
}

function initialBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (d: number) => d * Math.PI / 180;
    const toDeg = (r: number) => r * 180 / Math.PI;
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
    return +((toDeg(Math.atan2(y, x)) + 360) % 360).toFixed(0);
}

function estimateEta(distanceNm: number, speedKnots: number): string {
    if (speedKnots <= 0) return "N/A";
    const hours = distanceNm / speedKnots;
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

interface NavData {
    destinationName: string;
    destinationLat: number;
    destinationLng: number;
    bearingDeg: number;
    distanceNm: number;
    etaAt5kn: string;
    etaAt7kn: string;
}

function calculateNavData(
    userLat: number, userLng: number,
    destName: string, destLat: number, destLng: number,
): NavData {
    const dist = haversineNm(userLat, userLng, destLat, destLng);
    const bearing = initialBearing(userLat, userLng, destLat, destLng);
    return {
        destinationName: destName,
        destinationLat: destLat,
        destinationLng: destLng,
        bearingDeg: bearing,
        distanceNm: dist,
        etaAt5kn: estimateEta(dist, 5),
        etaAt7kn: estimateEta(dist, 7),
    };
}

// ── Fetch available moorings via PostGIS-backed RPC (geofenced, Verified-Partner first) ──
interface MooringRow {
    id: string;
    name: string;
    location: string;
    country: string;
    country_flag: string | null;
    lat: number;
    lng: number;
    price_per_night: number;
    max_boat_length: number | null;
    max_draft: number | null;
    amenities: string[];
    wind_protection: string;
    is_last_minute: boolean;
    is_now4today: boolean;
    is_verified_partner: boolean;
    is_premium_listing: boolean;
    winter_storage: boolean;
    mooring_units: number;
    rating: number;
    review_count: number;
    distance_km: number;
    mooring_layer: 'premium' | 'concierge' | 'explore';
}

async function fetchAvailableMoorings(
    checkIn: string,
    checkOut: string,
    userLat: number,
    userLng: number,
    boatLength?: number,
    radiusKm = 150,
): Promise<{ text: string; rows: MooringRow[]; checkIn: string; checkOut: string }> {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return { text: "Ahoj! AI kapetan na vezi... nemam dostupnih informacija (nedostaju konfiguracijski podaci).", rows: [], checkIn, checkOut };
    }

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 6000);

        const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/nearby_active_moorings`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
                user_lat: userLat,
                user_lng: userLng,
                radius_km: radiusKm,
                min_boat_length: boatLength && boatLength > 0 ? boatLength : null,
            }),
        });
        clearTimeout(tid);

        if (!rpcRes.ok) {
            console.error("Moorings RPC failed:", rpcRes.status, await rpcRes.text());
            return { text: "Ahoj! AI kapetan na vezi... nemam dostupnih informacija o vezovima.", rows: [], checkIn, checkOut };
        }

        const moorings: MooringRow[] = await rpcRes.json();

        // Filter out moorings already booked for the requested date range
        const conflictUrl = new URL(`${SUPABASE_URL}/rest/v1/bookings`);
        conflictUrl.searchParams.set("select", "mooring_id");
        conflictUrl.searchParams.set("booking_status", "neq.cancelled");
        conflictUrl.searchParams.set("check_in", `lte.${checkOut}`);
        conflictUrl.searchParams.set("check_out", `gte.${checkIn}`);

        const conflictRes = await fetch(conflictUrl.toString(), {
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const conflictBookings: { mooring_id: string }[] = conflictRes.ok ? await conflictRes.json() : [];
        const bookedMooringIds = new Set(conflictBookings.map((b) => b.mooring_id));

        const available = moorings.filter((m) => !bookedMooringIds.has(m.id));

        if (available.length === 0) {
            const hint = boatLength ? ` za brod duljine ${boatLength}m` : "";
            return {
                text: `Ahoj! AI kapetan na vezi... nemam slobodnih vezova${hint} u radijusu ${radiusKm} km od tvoje pozicije za traženi period.\n🔗 Proširi pretragu na: https://mooringbooking.com/explore?checkIn=${checkIn}&checkOut=${checkOut}`,
                rows: [],
                checkIn,
                checkOut,
            };
        }

        const top = available.slice(0, 5);
        const fromLat = userLat.toFixed(4);
        const fromLng = userLng.toFixed(4);
        const lines = top.map((m, i) => {
            const flag = m.country_flag ? `${m.country_flag} ` : "";
            const amenStr = m.amenities?.length > 0 ? m.amenities.join(", ") : "—";
            const maxBoat = m.max_boat_length ? `maks. brod ${m.max_boat_length}m` : "";
            const rating = m.rating > 0 ? ` | ⭐ ${m.rating.toFixed(1)}` : "";
            const lastMin = (m.is_last_minute || m.is_now4today) ? " 🔥 Last-minute!" : "";
            const verified = m.is_verified_partner ? " ✅ **Verified Partner**" : "";
            const premium = m.is_premium_listing ? " 👑 Premium" : "";
            const layer = m.mooring_layer || 'premium';
            const layerBadge = layer === 'concierge' ? " 📞 Concierge" : layer === 'explore' ? " 🧭 Navigate Only" : "";
            const dist = Number.isFinite(m.distance_km) ? ` | 📏 ${m.distance_km.toFixed(1)} km od tebe` : "";
            const destLat = m.lat.toFixed(4);
            const destLng = m.lng.toFixed(4);
            const osmLink = `https://www.openstreetmap.org/directions?from=${fromLat}%2C+${fromLng}&to=${destLat}%2C+${destLng}#map=13/${destLat}/${destLng}`;

            if (layer === 'explore') {
                return `${i + 1}. **${m.name}**${layerBadge} — ${flag}${m.location}, ${m.country}\n   Zaštita od vjetra: ${m.wind_protection}${rating}${dist}\n   🧭 Ruta: ${osmLink}\n   ⚠️ Samo navigacijski podatak — nema rezervacije.`;
            }

            const bookLink = layer === 'concierge'
                ? `https://mooringbooking.com/explore?mooring=${m.id}&checkIn=${checkIn}&checkOut=${checkOut}`
                : `https://mooringbooking.com/explore?mooring=${m.id}&checkIn=${checkIn}&checkOut=${checkOut}`;
            const bookLabel = layer === 'concierge' ? "📞 Zatraži rezervaciju" : "📌 Rezerviraj";
            return `${i + 1}. **${m.name}**${verified}${premium}${layerBadge} — ${flag}${m.location}, ${m.country}\n   💰 €${m.price_per_night}/noć${maxBoat ? ` | ${maxBoat}` : ""} | Zaštita od vjetra: ${m.wind_protection}${rating}${dist}${lastMin}\n   🛠️ Pogodnosti: ${amenStr}\n   🧭 Ruta: ${osmLink}\n   ${bookLabel}: ${bookLink}`;
        });

        return {
            text: `⚓ SLOBODNI VEZOVI (${checkIn} – ${checkOut}) u radijusu ${radiusKm} km:\n${lines.join("\n\n")}\n\n🔗 Svi vezovi: https://mooringbooking.com/explore?checkIn=${checkIn}&checkOut=${checkOut}`,
            rows: top,
            checkIn,
            checkOut,
        };
    } catch (e) {
        console.error("fetchAvailableMoorings error:", e);
        return { text: "Ahoj! AI kapetan na vezi... nemam dostupnih informacija u bazi.", rows: [], checkIn, checkOut };
    }
}

// ── Windy Point Forecast (atmosphere model) ───────────────────────────────────
function msToKnots(ms: number): string {
    return (ms * 1.94384).toFixed(1);
}

function msToBeaufort(ms: number): number {
    if (ms < 0.3) return 0;
    if (ms < 1.6) return 1;
    if (ms < 3.4) return 2;
    if (ms < 5.5) return 3;
    if (ms < 8.0) return 4;
    if (ms < 10.8) return 5;
    if (ms < 13.9) return 6;
    if (ms < 17.2) return 7;
    if (ms < 20.8) return 8;
    if (ms < 24.5) return 9;
    if (ms < 28.5) return 10;
    if (ms < 32.7) return 11;
    return 12;
}

interface WeatherData {
    windKnots: number;
    gustKnots: number;
    beaufort: number;
    tempC: number;
    dewpointC: number;
    pressurehPa: number;
    waveM: number;
    swellM: number;
    ok: boolean;
}

interface ForecastDay {
    date: string;
    windAvgKn: number;
    windMaxKn: number;
    gustMaxKn: number;
    beaufortMax: number;
    tempMinC: number;
    tempMaxC: number;
    pressureAvgHPa: number;
    waveMaxM: number;
    swellMaxM: number;
}

interface FullForecastResult {
    current: WeatherData;
    forecast: ForecastDay[];
    currentText: string;
    forecastText: string;
}

async function fetchFullForecast(lat: number, lng: number): Promise<FullForecastResult> {
    const empty: FullForecastResult = {
        current: { windKnots: 0, gustKnots: 0, beaufort: 0, tempC: 20, dewpointC: 15, pressurehPa: 1013, waveM: 0, swellM: 0, ok: false },
        forecast: [],
        currentText: "Meteorološki podaci trenutno nedostupni.",
        forecastText: "",
    };

    if (!WINDY_API_KEY) return empty;

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 10000);
        const opts = { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal };

        const [atmoRes, waveRes] = await Promise.all([
            fetch("https://api.windy.com/api/point-forecast/v2", {
                ...opts,
                body: JSON.stringify({ lat, lon: lng, model: "iconEu", parameters: ["wind", "windGust", "pressure", "temp", "dewpoint"], levels: ["surface"], key: WINDY_API_KEY }),
            }),
            fetch("https://api.windy.com/api/point-forecast/v2", {
                ...opts,
                body: JSON.stringify({ lat, lon: lng, model: "gfsWave", parameters: ["waves", "swell1"], levels: ["surface"], key: WINDY_API_KEY }),
            }),
        ]);
        clearTimeout(tid);

        if (!atmoRes.ok) return empty;
        const atmo = await atmoRes.json();
        const wave = waveRes.ok ? await waveRes.json() : null;

        const ts: number[] = atmo.ts ?? [];
        if (ts.length === 0) return empty;

        const arr = (obj: Record<string, unknown>, key: string): number[] =>
            Array.isArray(obj[key]) ? (obj[key] as number[]) : ts.map(() => 0);

        const uArr = arr(atmo, "wind_u-surface");
        const vArr = arr(atmo, "wind_v-surface");
        const gustArr = arr(atmo, "windGust-surface");
        const tempArr = arr(atmo, "temp-surface");
        const dewArr = arr(atmo, "dewpoint-surface");
        const presArr = arr(atmo, "pressure-surface");

        const waveTs: number[] = wave?.ts ?? [];
        const wvH = wave ? arr(wave, "waves_height-surface") : [];
        const swH = wave ? arr(wave, "swell1_height-surface") : [];
        const waveMap = new Map<number, { h: number; sh: number }>();
        waveTs.forEach((t, i) => waveMap.set(t, { h: wvH[i] ?? 0, sh: swH[i] ?? 0 }));

        const findWave = (t: number) => {
            if (waveTs.length === 0) return { h: 0, sh: 0 };
            let best = waveTs[0], bestDiff = Math.abs(t - waveTs[0]);
            for (let i = 1; i < waveTs.length; i++) {
                const d = Math.abs(t - waveTs[i]);
                if (d < bestDiff) { bestDiff = d; best = waveTs[i]; }
            }
            return waveMap.get(best) ?? { h: 0, sh: 0 };
        };

        // Parse current (index 0)
        const u0 = uArr[0] ?? 0, v0 = vArr[0] ?? 0;
        const windMs0 = Math.sqrt(u0 * u0 + v0 * v0);
        const gustMs0 = gustArr[0] ?? windMs0;
        const tempK0 = tempArr[0] ?? 288;
        const dewK0 = dewArr[0] ?? 283;
        const pressPa0 = presArr[0] ?? 101325;
        const bft0 = msToBeaufort(windMs0);
        const wv0 = findWave(ts[0]);

        const current: WeatherData = {
            windKnots: +(windMs0 * 1.94384).toFixed(1),
            gustKnots: +(gustMs0 * 1.94384).toFixed(1),
            beaufort: bft0,
            tempC: +(tempK0 - 273.15).toFixed(1),
            dewpointC: +(dewK0 - 273.15).toFixed(1),
            pressurehPa: Math.round(pressPa0 / 100),
            waveM: +(wv0.h).toFixed(1),
            swellM: +(wv0.sh).toFixed(1),
            ok: true,
        };

        const currentText = `🌬️ Vjetar: ${msToKnots(windMs0)} čv (udari ${msToKnots(gustMs0)} čv) — Beaufort ${bft0}\n🌡️ Temperatura: ${(tempK0 - 273.15).toFixed(1)}°C | Rosište: ${(dewK0 - 273.15).toFixed(1)}°C\n📊 Tlak: ${(pressPa0 / 100).toFixed(0)} hPa\n🌊 Valovi: ${wv0.h.toFixed(1)} m | Swell: ${wv0.sh.toFixed(1)} m`;

        // Group all timestamps by date for daily forecast
        const dailyMap = new Map<string, { winds: number[]; gusts: number[]; temps: number[]; pres: number[]; waves: number[]; swells: number[] }>();
        for (let i = 0; i < ts.length; i++) {
            const date = new Date(ts[i]).toISOString().split("T")[0];
            if (!dailyMap.has(date)) dailyMap.set(date, { winds: [], gusts: [], temps: [], pres: [], waves: [], swells: [] });
            const day = dailyMap.get(date)!;
            const u = uArr[i] ?? 0, vv = vArr[i] ?? 0;
            day.winds.push(Math.sqrt(u * u + vv * vv) * 1.94384);
            day.gusts.push((gustArr[i] ?? 0) * 1.94384);
            day.temps.push((tempArr[i] ?? 288) - 273.15);
            day.pres.push((presArr[i] ?? 101325) / 100);
            const wvi = findWave(ts[i]);
            day.waves.push(wvi.h);
            day.swells.push(wvi.sh);
        }

        const todayStr = new Date().toISOString().split("T")[0];
        const forecast: ForecastDay[] = [];
        const sortedDates = [...dailyMap.keys()].sort();
        for (const date of sortedDates) {
            if (date === todayStr) continue;
            if (forecast.length >= 7) break;
            const d = dailyMap.get(date)!;
            const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
            forecast.push({
                date,
                windAvgKn: +avg(d.winds).toFixed(1),
                windMaxKn: +Math.max(...d.winds).toFixed(1),
                gustMaxKn: +Math.max(...d.gusts).toFixed(1),
                beaufortMax: msToBeaufort(Math.max(...d.winds) / 1.94384),
                tempMinC: +Math.min(...d.temps).toFixed(1),
                tempMaxC: +Math.max(...d.temps).toFixed(1),
                pressureAvgHPa: Math.round(avg(d.pres)),
                waveMaxM: +Math.max(...d.waves).toFixed(1),
                swellMaxM: +Math.max(...d.swells).toFixed(1),
            });
        }

        const dayNames = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
        const forecastLines = forecast.map((f) => {
            const d = new Date(f.date + "T12:00:00Z");
            const dayName = dayNames[d.getUTCDay()];
            const warn = f.windMaxKn > 25 ? " ⚠️" : "";
            return `${dayName} ${f.date.slice(5)}: 🌬️ ${f.windAvgKn}–${f.windMaxKn} čv (Bft ${f.beaufortMax})${warn} | 🌡️ ${f.tempMinC}–${f.tempMaxC}°C | 🌊 val ${f.waveMaxM}m`;
        });
        const forecastText = forecastLines.length > 0
            ? `\n📅 7-DNEVNA PROGNOZA:\n${forecastLines.join("\n")}`
            : "";

        return { current, forecast, currentText, forecastText };
    } catch (e) {
        console.error("fetchFullForecast error:", (e as Error).message);
        return empty;
    }
}

// ── Embedding (gemini-embedding-001, 768 dims) ────────────────────────────────
async function embedQuery(text: string): Promise<number[] | null> {
    if (!GEMINI_API_KEY) return null;
    for (const api of ["v1beta", "v1"]) {
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(
                `https://generativelanguage.googleapis.com/${api}/models/${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({
                        model: `models/${EMBED_MODEL}`,
                        content: { parts: [{ text }] },
                        taskType: "RETRIEVAL_QUERY",
                        outputDimensionality: EMBED_DIM,
                    }),
                },
            );
            clearTimeout(tid);
            if (res.ok) {
                const j = await res.json();
                const values = j.embedding?.values as number[] | undefined;
                if (values && values.length === EMBED_DIM) return values;
            }
        } catch (e) {
            console.error(`embed ${api} error:`, (e as Error).message);
        }
    }
    return null;
}

interface KbHit {
    id: string;
    topic: string;
    content: string;
    lang: string;
    source_type: string;
    source_url: string | null;
    similarity: number;
}

async function kbSearch(userMessage: string, k = 3): Promise<KbHit[]> {
    const vec = await embedQuery(userMessage);
    if (!vec) return [];
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/kb_search`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({ query_embedding: `[${vec.join(",")}]`, k, lang_filter: null }),
        });
        clearTimeout(tid);
        if (!res.ok) {
            console.error("kb_search RPC failed:", res.status, await res.text());
            return [];
        }
        return await res.json();
    } catch (e) {
        console.error("kbSearch error:", (e as Error).message);
        return [];
    }
}

// ── Rescue authority resolver (FAZA 3 — dynamic MAYDAY) ───────────────────────
interface RescueAuthority {
    country_code: string;
    country_name: string;
    mrcc_phone: string;
    mrcc_alt_phone: string | null;
    vhf_emergency_channel: number;
    coast_guard_name: string | null;
    coast_guard_url: string | null;
}

// Lightweight lat/lng → country_code bbox table. Covers Med + Atlantic basin
// countries seeded in rescue_authorities. First match wins; order matters
// (narrow bboxes before the wide Adriatic/Med catch-alls).
const COUNTRY_BBOXES: Array<{ code: string; minLat: number; maxLat: number; minLng: number; maxLng: number }> = [
    // Adriatic east coast
    { code: "SI", minLat: 45.40, maxLat: 45.80, minLng: 13.35, maxLng: 13.95 },
    { code: "HR", minLat: 42.30, maxLat: 45.85, minLng: 13.40, maxLng: 19.50 },
    { code: "ME", minLat: 41.85, maxLat: 43.55, minLng: 18.40, maxLng: 20.40 },
    { code: "AL", minLat: 39.60, maxLat: 42.70, minLng: 19.20, maxLng: 21.10 },
    // Italy (peninsula incl. Sicily & Sardinia)
    { code: "IT", minLat: 35.40, maxLat: 47.10, minLng: 6.60, maxLng: 18.55 },
    // Greece + Aegean + Ionian
    { code: "GR", minLat: 34.70, maxLat: 41.80, minLng: 19.30, maxLng: 29.70 },
    // Turkey Aegean + Med coast
    { code: "TR", minLat: 35.80, maxLat: 42.10, minLng: 25.60, maxLng: 44.80 },
    // Cyprus
    { code: "CY", minLat: 34.50, maxLat: 35.80, minLng: 32.20, maxLng: 34.70 },
    // Malta
    { code: "MT", minLat: 35.75, maxLat: 36.10, minLng: 14.15, maxLng: 14.60 },
    // France — mainland & Corsica (only Med relevant bbox here)
    { code: "FR", minLat: 41.30, maxLat: 51.10, minLng: -5.10, maxLng: 9.60 },
    // Iberian peninsula
    { code: "ES", minLat: 35.90, maxLat: 43.90, minLng: -9.50, maxLng: 4.40 },
    { code: "PT", minLat: 36.95, maxLat: 42.20, minLng: -9.55, maxLng: -6.15 },
    // North Africa
    { code: "MA", minLat: 27.60, maxLat: 35.95, minLng: -13.20, maxLng: -0.95 },
    { code: "TN", minLat: 30.20, maxLat: 37.55, minLng: 7.50, maxLng: 11.60 },
    { code: "EG", minLat: 22.00, maxLat: 31.70, minLng: 24.70, maxLng: 36.90 },
    // North Sea / Channel
    { code: "BE", minLat: 49.50, maxLat: 51.55, minLng: 2.50, maxLng: 6.45 },
    { code: "NL", minLat: 50.70, maxLat: 53.70, minLng: 3.30, maxLng: 7.25 },
    { code: "DE", minLat: 47.20, maxLat: 55.10, minLng: 5.85, maxLng: 15.05 },
    { code: "GB", minLat: 49.80, maxLat: 61.00, minLng: -8.70, maxLng: 2.00 },
    // US (coastal — MRCC still routes nationally)
    { code: "US", minLat: 24.40, maxLat: 49.40, minLng: -125.00, maxLng: -66.90 },
];

function resolveCountryFromLatLng(lat: number, lng: number): string {
    for (const bb of COUNTRY_BBOXES) {
        if (lat >= bb.minLat && lat <= bb.maxLat && lng >= bb.minLng && lng <= bb.maxLng) {
            return bb.code;
        }
    }
    // Adriatic offshore default (between HR / IT / ME / AL)
    if (lat >= 41.5 && lat <= 45.9 && lng >= 12.0 && lng <= 20.0) return "HR";
    // Wider Mediterranean offshore default → IT
    if (lat >= 30.0 && lat <= 46.0 && lng >= -6.0 && lng <= 37.0) return "IT";
    return "HR"; // global fallback — Croatia is the platform's base country
}

const rescueCache = new Map<string, { row: RescueAuthority | null; exp: number }>();

async function getRescueAuthority(lat: number, lng: number): Promise<RescueAuthority | null> {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    const country = resolveCountryFromLatLng(lat, lng);
    const cached = rescueCache.get(country);
    if (cached && cached.exp > Date.now()) return cached.row;

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 3000);
        const url = new URL(`${SUPABASE_URL}/rest/v1/rescue_authorities`);
        url.searchParams.set("country_code", `eq.${country}`);
        url.searchParams.set("select", "country_code,country_name,mrcc_phone,mrcc_alt_phone,vhf_emergency_channel,coast_guard_name,coast_guard_url");
        url.searchParams.set("limit", "1");
        const res = await fetch(url.toString(), {
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            signal: controller.signal,
        });
        clearTimeout(tid);
        if (!res.ok) {
            console.error("rescue_authorities fetch failed:", res.status);
            rescueCache.set(country, { row: null, exp: Date.now() + 60_000 });
            return null;
        }
        const rows = await res.json() as RescueAuthority[];
        const row = rows[0] ?? null;
        rescueCache.set(country, { row, exp: Date.now() + 60 * 60 * 1000 }); // 1 hour TTL
        return row;
    } catch (e) {
        console.error("getRescueAuthority error:", (e as Error).message);
        return null;
    }
}

// ── Rate limiting (FAZA 6 — intent-aware, EMERGENCY bypass) ───────────────────
function decodeJwtSub(req: Request): string | null {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (!token || token.split(".").length !== 3) return null;
    try {
        const payload = token.split(".")[1];
        // base64url → base64
        const b64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
        const json = JSON.parse(atob(b64));
        return typeof json.sub === "string" ? json.sub : null;
    } catch {
        return null;
    }
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number; // -1 = unlimited
    reset_at: string;
    reason: string;
    used?: number;
}

// FAZA 7: fire-and-forget quality log. Caller should not await if latency matters.
interface QualityLogArgs {
    userId: string | null;
    conversationId: string | null;
    intent: Intent;
    confidence: number | null;
    flags: string[];
    language: string | null;
    latencyMs: number;
    paywall: boolean;
    emergency: boolean;
}

async function logResponseQuality(args: QualityLogArgs): Promise<string | null> {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_response_quality`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            signal: controller.signal,
            body: JSON.stringify({
                user_id: args.userId,
                conversation_id: args.conversationId,
                intent: args.intent,
                confidence: args.confidence,
                flags: args.flags,
                language: args.language,
                latency_ms: args.latencyMs,
                paywall: args.paywall,
                emergency: args.emergency,
            }),
        });
        clearTimeout(tid);
        if (!res.ok) {
            console.error("ai_response_quality insert failed:", res.status);
            return null;
        }
        const rows = await res.json();
        return Array.isArray(rows) && rows[0]?.id ? rows[0].id : null;
    } catch (e) {
        console.error("logResponseQuality error:", (e as Error).message);
        return null;
    }
}

function detectLanguage(text: string): string {
    // Crude server-side detection — frontends already pass lang via i18n,
    // but we may not have it here. Map a few obvious markers.
    const s = text.toLowerCase();
    if (/[čćšđž]/.test(s) || /\bvez\b|\bdanas\b|\bsutra\b|\bbrod\b/.test(s)) return "hr";
    if (/\bder\b|\bdie\b|\bdas\b|\bwetter\b|\bheute\b/.test(s)) return "de";
    if (/\bnon\b|\bcon\b|\bdi\b|\bche\b|\boggi\b|\bbarca\b/.test(s)) return "it";
    if (/\ble\b|\bla\b|\bou\b|\baujourd/.test(s)) return "fr";
    return "en";
}

// FAZA 8 — persistent chat history (authenticated users only).
// Calls the ai-captain Edge Function always run with the service role, so we
// resolve the conversation via RPC under the user's JWT-derived id but write
// messages directly to the table using service role (RLS bypass), which is
// safe because we set user_id = userId and reject null userId callers.

async function ensureConversationId(
    userId: string,
    requestedConversationId: string | null,
): Promise<string | null> {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
        // Prefer caller-provided UUID. We trust-but-verify: insert with the
        // given id only if not already owned by another user. If another
        // user owns it (shouldn't happen with v4 UUIDs) we mint a fresh one.
        const existingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/ai_conversations?id=eq.${requestedConversationId ?? ""}&select=id,user_id`,
            {
                headers: {
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
            },
        );
        if (requestedConversationId && existingRes.ok) {
            const rows = await existingRes.json();
            if (Array.isArray(rows) && rows.length > 0) {
                return rows[0].user_id === userId ? rows[0].id : null;
            }
        }

        const insertBody = requestedConversationId
            ? { id: requestedConversationId, user_id: userId }
            : { user_id: userId };

        const insRes = await fetch(`${SUPABASE_URL}/rest/v1/ai_conversations`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            body: JSON.stringify(insertBody),
        });
        if (!insRes.ok) {
            console.error("ensureConversationId insert failed:", insRes.status, await insRes.text());
            return null;
        }
        const created = await insRes.json();
        return Array.isArray(created) && created[0]?.id ? created[0].id : null;
    } catch (e) {
        console.error("ensureConversationId error:", (e as Error).message);
        return null;
    }
}

interface ChatMessageRow {
    conversation_id: string;
    user_id: string;
    role: "user" | "assistant";
    content: string;
    intent?: string | null;
    confidence?: number | null;
    metadata?: Record<string, unknown>;
}

async function insertChatMessages(rows: ChatMessageRow[]): Promise<void> {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
    if (rows.length === 0) return;
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_chat_messages`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
            signal: controller.signal,
            body: JSON.stringify(rows),
        });
        clearTimeout(tid);
        if (!res.ok) {
            console.error("ai_chat_messages insert failed:", res.status, await res.text());
        }
    } catch (e) {
        console.error("insertChatMessages error:", (e as Error).message);
    }
}

async function checkAndLogAiCall(userId: string, intent: Intent, isPremium: boolean): Promise<RateLimitResult | null> {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_and_log_ai_call`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({ p_user_id: userId, p_intent: intent, p_is_premium: isPremium }),
        });
        clearTimeout(tid);
        if (!res.ok) {
            console.error("check_and_log_ai_call failed:", res.status, await res.text());
            return null;
        }
        return await res.json() as RateLimitResult;
    } catch (e) {
        console.error("checkAndLogAiCall error:", (e as Error).message);
        return null;
    }
}

// ── Post-generation validator (anti-hallucination) ─────────────────────────────
interface Validation {
    confidence: number;
    flags: string[];
}

function validateReply(
    reply: string,
    rpcMoorings: MooringRow[],
    rescue: RescueAuthority | null,
): Validation {
    const flags: string[] = [];
    const knownMarinaNames = new Set(
        rpcMoorings.map((m) => m.name.toLowerCase().trim()),
    );

    const markers = /(?:\*\*)?(?:marina|aci\s+marina|aci)\s+([A-ZŠĐČĆŽ][a-zšđčćžA-ZŠĐČĆŽ\-]{2,30})(?:\*\*)?/g;
    const mentioned: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = markers.exec(reply)) !== null) {
        mentioned.push(m[0].replace(/\*\*/g, "").toLowerCase().trim());
    }
    for (const name of mentioned) {
        const fragment = name.replace(/^(aci\s+marina|aci|marina)\s+/i, "").trim();
        const isKnown = Array.from(knownMarinaNames).some((kn) => kn.includes(fragment) || fragment.includes(kn));
        if (!isKnown) {
            flags.push(`unverified_marina:${fragment}`);
        }
    }

    const vhfMatches = reply.match(/\bVHF\s*(?:kanal|channel|kan\.)?\s*(\d{1,3})\b/gi);
    if (vhfMatches) {
        for (const vm of vhfMatches) {
            const n = parseInt(vm.match(/\d+/)?.[0] ?? "0");
            if (n < 1 || n > 88) flags.push(`invalid_vhf:${n}`);
        }
    }

    // MRCC sanity: if the reply lists an international-format phone with a country
    // code that clearly doesn't match the resolved rescue authority, flag it.
    if (rescue) {
        const phoneMatches = reply.match(/\+\d[\d\s().-]{6,}\d/g);
        if (phoneMatches) {
            const canonical = rescue.mrcc_phone.replace(/\D/g, "");
            const altCanonical = (rescue.mrcc_alt_phone ?? "").replace(/\D/g, "");
            const rescueDial = canonical.slice(0, 3); // e.g. "385", "39"
            for (const raw of phoneMatches) {
                const digits = raw.replace(/\D/g, "");
                if (!digits) continue;
                const matchesCanonical =
                    (canonical && digits.endsWith(canonical.slice(-6))) ||
                    (altCanonical && digits.endsWith(altCanonical.slice(-6)));
                if (matchesCanonical) continue;
                // Heuristic: only flag numbers that look like MRCC-style country codes (leading country dial)
                if (rescueDial && !digits.startsWith(rescueDial.slice(0, 2))) {
                    flags.push(`wrong_mrcc_country:${digits.slice(0, 4)}`);
                }
            }
        }
    }

    const confidence = Math.max(0, 1 - 0.15 * flags.length);
    return { confidence, flags };
}

// ── Auto-discover available Gemini flash models ────────────────────────────────
async function getAvailableFlashModels(): Promise<string[]> {
    for (const api of ["v1", "v1beta"]) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/${api}/models?key=${GEMINI_API_KEY}&pageSize=50`
            );
            if (res.ok) {
                const data = await res.json();
                const models: string[] = (data.models ?? [])
                    .map((m: { name: string }) => m.name.replace("models/", ""))
                    .filter((n: string) =>
                        n.includes("flash") &&
                        !n.includes("thinking") &&
                        !n.includes("tts") &&
                        !n.includes("image")
                    )
                    .sort((a: string, b: string) => b.localeCompare(a));
                return models;
            }
        } catch (e) {
            console.error("ListModels error:", e);
        }
    }
    return [];
}

// ── Call Gemini ────────────────────────────────────────────────────────────────
async function callGemini(
    prompt: string,
    history: Array<{ role: string; parts: Array<{ text: string }> }>,
    maxOutputTokens = 1800,
): Promise<string> {
    if (!GEMINI_API_KEY) {
        return "⚓ AI Kapetan nije konfiguriran (nedostaje API ključ). Kontaktirajte podršku.";
    }

    const flashModels = await getAvailableFlashModels();
    const modelsToTry = flashModels.length > 0 ? flashModels : ["gemini-2.0-flash", "gemini-1.5-flash"];

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 120_000);

    for (const modelName of modelsToTry) {
        for (const apiVersion of ["v1", "v1beta"]) {
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        signal: controller.signal,
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: prompt }] },
                            contents: history,
                            generationConfig: {
                                maxOutputTokens,
                                temperature: 0.60,
                                topP: 0.9,
                            },
                        }),
                    }
                );

                if (res.ok) {
                    clearTimeout(tid);
                    const json = await res.json();
                    return json.candidates?.[0]?.content?.parts?.[0]?.text
                        ?? "Nije moguće generirati odgovor.";
                }

                const errText = await res.text();
                console.error(`${modelName}/${apiVersion} -> ${res.status}:`, errText.substring(0, 150));
            } catch (e) {
                const err = e as Error;
                if (err.name === "AbortError") {
                    clearTimeout(tid);
                    return "⚓ AI Kapetan je trebao previše vremena za odgovor. Pokušajte kraće pitanje.";
                }
                console.error("Fetch error:", err.message);
            }
        }
    }

    clearTimeout(tid);
    return "⚓ AI Kapetan privremeno nedostupan. Provjeri vezu i pokušaj ponovo.";
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS });
    }

    const reqStart = Date.now();
    try {
        const { messages, location, userProfile, vesselProfile, searchDates, isProviderContext, conversationId, preferences } = await req.json();

        const lat: number = location?.lat ?? 43.5;
        const lng: number = location?.lng ?? 16.4;

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const nextWeekStr = new Date(today.getTime() + 7 * 86400000).toISOString().split("T")[0];
        const checkIn: string = searchDates?.checkIn ?? todayStr;
        const checkOut: string = searchDates?.checkOut ?? nextWeekStr;

        const allMessages = messages as Array<{ role: string; content: string; isWelcome?: boolean }>;
        const lastUserMsg = [...allMessages].reverse().find((m) => m.role === "user")?.content ?? "";
        const vesselLength = (vesselProfile as { lengthM?: number } | undefined)?.lengthM;
        const boatLength: number | undefined = userProfile?.boatLength
            ? Number(userProfile.boatLength)
            : vesselLength && Number.isFinite(vesselLength)
                ? Number(vesselLength)
                : undefined;

        const intent: Intent = lastUserMsg ? classifyIntent(lastUserMsg) : "GENERAL_CHAT";
        const shouldSearchMoorings = intent === "SEARCH_MOORING";
        const shouldNavigate = intent === "NAVIGATION_ROUTE";

        // FAZA 6: intent-aware rate limit (EMERGENCY & premium bypass)
        const tierStr = (userProfile?.tier ?? "basic") as string;
        const isPremiumTier = ["sailor", "captain", "charter-fleet", "premium-monthly", "premium-annual", "admin"].includes(tierStr);
        const hasUnlimitedAiTier = ["sailor", "captain", "charter-fleet", "ai-only", "premium-monthly", "premium-annual", "admin"].includes(tierStr);
        const userId = decodeJwtSub(req);

        // FAZA 8: resolve/create persistent conversation for authenticated users.
        // Anonymous callers never get a conversationId back; their chat stays ephemeral.
        let activeConversationId: string | null = null;
        if (userId) {
            activeConversationId = await ensureConversationId(userId, conversationId ?? null);
        }

        let rateLimit: RateLimitResult | null = null;
        if (userId) {
            rateLimit = await checkAndLogAiCall(userId, intent, hasUnlimitedAiTier);
            if (rateLimit && !rateLimit.allowed) {
                const paywallQualityId = await logResponseQuality({
                    userId,
                    conversationId: activeConversationId,
                    intent,
                    confidence: null,
                    flags: ["paywall"],
                    language: detectLanguage(lastUserMsg),
                    latencyMs: Date.now() - reqStart,
                    paywall: true,
                    emergency: false,
                });
                return new Response(
                    JSON.stringify({
                        reply: "⭐ Iskoristio si sva besplatna AI Kapetan pitanja za ovaj mjesec.\n\nNadogradi na **Sailor** (€19.99/mj) ili **AI-Only** (€7.99/mj) za neograničen pristup, 7-dnevne prognoze i upozorenja na oluje! 🚢",
                        intent,
                        remaining: 0,
                        resetAt: rateLimit.reset_at,
                        paywall: true,
                        qualityId: paywallQualityId,
                        conversationId: activeConversationId,
                    }),
                    { headers: { ...CORS, "Content-Type": "application/json" }, status: 200 }
                );
            }
        }

        // Parallel: full forecast + moorings (conditional) + RAG KB + rescue authority
        const [forecastResult, mooringsResult, kbHits, rescue] = await Promise.all([
            fetchFullForecast(lat, lng),
            (shouldSearchMoorings || shouldNavigate)
                ? fetchAvailableMoorings(checkIn, checkOut, lat, lng, boatLength)
                : Promise.resolve({ text: "", rows: [] as MooringRow[], checkIn, checkOut }),
            lastUserMsg ? kbSearch(lastUserMsg, 3) : Promise.resolve([] as KbHit[]),
            getRescueAuthority(lat, lng),
        ]);

        const weatherStr = forecastResult.currentText;

        // F: Forecast gating — Basic users get 48h only, Premium gets full 7 days
        let forecastStr: string;
        if (!isPremiumTier && forecastResult.forecast.length > 2) {
            const limited = forecastResult.forecast.slice(0, 2);
            const dayNames = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
            const lines = limited.map((f) => {
                const d = new Date(f.date + "T12:00:00Z");
                const dayName = dayNames[d.getUTCDay()];
                const warn = f.windMaxKn > 25 ? " ⚠️" : "";
                return `${dayName} ${f.date.slice(5)}: 🌬️ ${f.windAvgKn}–${f.windMaxKn} čv (Bft ${f.beaufortMax})${warn} | 🌡️ ${f.tempMinC}–${f.tempMaxC}°C | 🌊 val ${f.waveMaxM}m`;
            });
            forecastStr = lines.length > 0
                ? `\n📅 48h PROGNOZA (Basic plan):\n${lines.join("\n")}\n⭐ Nadogradi na Sailor ili AI-Only za punu 7-dnevnu prognozu!`
                : "";
        } else {
            forecastStr = forecastResult.forecastText;
        }
        const weather: WeatherData | null = forecastResult.current.ok ? forecastResult.current : null;

        // Navigation calculation for NAVIGATION_ROUTE intent
        let navData: NavData | null = null;
        let navSection = "";
        if (shouldNavigate && mooringsResult.rows.length > 0) {
            const dest = mooringsResult.rows[0];
            navData = calculateNavData(lat, lng, dest.name, dest.lat, dest.lng);
            navSection = `\n\n═══ NAVIGACIJSKI IZRAČUN ═══\n📍 Odredište: ${navData.destinationName}\n🧭 Kurs: ${navData.bearingDeg}° | 📏 Udaljenost: ${navData.distanceNm} NM\n⏱️ ETA (5 čv): ${navData.etaAt5kn} | ETA (7 čv): ${navData.etaAt7kn}`;
        }

        // FAZA 2: prefer structured vesselProfile over legacy userProfile.boat_*
        const v = vesselProfile as undefined | {
            name?: string;
            boatType?: string;
            lengthM?: number;
            beamM?: number;
            draftM?: number;
            mmsi?: string;
            callSign?: string;
            insuranceExpiry?: string | null;
            engineMake?: string;
            engineModel?: string;
            engineHours?: number;
        };

        let boatInfo: string;
        if (v && (v.name || v.lengthM || v.draftM)) {
            const parts: string[] = [];
            if (v.name) parts.push(`Ime: ${v.name}`);
            if (v.boatType) parts.push(`Tip: ${v.boatType}`);
            if (v.lengthM) parts.push(`duljina ${v.lengthM}m`);
            if (v.beamM) parts.push(`širina ${v.beamM}m`);
            if (v.draftM) parts.push(`gaz ${v.draftM}m`);
            if (v.engineMake || v.engineModel) {
                parts.push(`motor ${[v.engineMake, v.engineModel].filter(Boolean).join(" ")}${v.engineHours ? ` (${v.engineHours} h)` : ""}`);
            }
            if (v.mmsi) parts.push(`MMSI ${v.mmsi}`);
            if (v.callSign) parts.push(`call sign ${v.callSign}`);
            if (v.insuranceExpiry) parts.push(`osiguranje do ${v.insuranceExpiry}`);
            boatInfo = `Brod — ${parts.join(", ")}.`;
        } else if (userProfile?.boatName) {
            boatInfo = `Brod: ${userProfile.boatName}${boatLength ? `, duljina ${boatLength}m` : ""}.`;
        } else if (boatLength) {
            boatInfo = `Brod: ${boatLength}m duljine.`;
        } else {
            boatInfo = "Podaci o brodu nisu uneseni.";
        }

        const mooringsSection = mooringsResult.text
            ? `\n\n═══ PRETRAGA VEZOVA ═══\n${mooringsResult.text}`
            : "";

        const kbSection = kbHits.length > 0
            ? `\n\n═══ RELEVANTNO ZNANJE (iz baze) ═══\n${
                kbHits
                    .map((h, i) => `${i + 1}. [${h.source_type}] ${h.topic}\n${h.content}`)
                    .join("\n\n")
            }`
            : "";

        // FAZA 3: dynamic MAYDAY section (country resolved from lat/lng)
        const rescueLines = rescue
            ? [
                `Država: ${rescue.country_name} (${rescue.country_code})`,
                `MAYDAY → VHF Ch.${rescue.vhf_emergency_channel}`,
                `MRCC: ${rescue.mrcc_phone}${rescue.mrcc_alt_phone ? ` (alt: ${rescue.mrcc_alt_phone})` : ""}`,
                rescue.coast_guard_name ? `Obalna straža: ${rescue.coast_guard_name}` : null,
                "EPIRB na 406 MHz",
            ].filter(Boolean).join(" | ")
            : "MAYDAY → VHF Ch.16 | MRCC Rijeka: +385 1 195 | EPIRB na 406 MHz";

        // FAZA 9: per-user preferences (answer style + experience level).
        // These MUST override the static length/format rules further down in
        // the prompt — otherwise "bullets" users still get 3+ sentence replies.
        const prefs = preferences as { answerStyle?: string; experienceLevel?: string } | undefined;
        const styleLine = (() => {
            switch (prefs?.answerStyle) {
                case "bullets":
                    return [
                        "STIL: **ISKLJUČIVO BULLET POINTS** — ovaj stil NADJAČAVA sva druga pravila o duljini i formatu.",
                        "• Cijeli odgovor su samo bulleti (simbol • ili crtica). BEZ uvodnih i zaključnih rečenica.",
                        "• Svaki bullet = jedna KRATKA rečenica (max ~12 riječi). Bez podbullet-a.",
                        "• Max 5 bullet-a po odgovoru. Ako treba više — odaberi 5 najvažnijih.",
                        "• Bez numeriranih lista, bez emoji naslova, bez odlomaka.",
                        "• Kad korisnik pita jednostavno pitanje, može biti i samo 1–2 bulleta.",
                    ].join("\n");
                case "detailed":
                    return [
                        "STIL: **DETALJNO** — pruži iscrpan, kontekstualan odgovor.",
                        "• Uvodna rečenica → ključni podaci strukturirano → zaključna preporuka.",
                        "• Koristi emoji naslove i numerirane liste kad je prirodno.",
                        "• 4+ rečenica gdje ima smisla; objasni nijanse i razloge.",
                    ].join("\n");
                case "balanced":
                default:
                    return [
                        "STIL: **BALANSIRANO** — kratki uvod, ključni podaci u bulletima, kratki završetak s preporukom.",
                        "• 2–4 bulleta, svaki 1 rečenica.",
                        "• Srednja duljina, bez nepotrebnog punjenja.",
                    ].join("\n");
            }
        })();
        const levelLine = (() => {
            switch (prefs?.experienceLevel) {
                case "beginner":
                    return [
                        "RAZINA: **POČETNIK** — korisnik ima malo/nimalo iskustva.",
                        "• Objasni nautičke termine u zagradi (npr. „privez (mooring)“).",
                        "• Koristi paralele iz svakodnevnog života.",
                        "• Uvijek naglasi sigurnosni korak i osnovni postupak.",
                        "• Ne pretpostavljaj predznanje (VHF, čvorovi, navigacija).",
                    ].join("\n");
                case "intermediate":
                    return [
                        "RAZINA: **SREDNJE ISKUSTVO** — zna osnove (pristajanje, sidrenje, VHF).",
                        "• Preskoči elementarna objašnjenja.",
                        "• Koristi standardne nautičke termine bez prevoda.",
                        "• Fokus na praktične savjete, manje teorije.",
                    ].join("\n");
                case "advanced":
                    return [
                        "RAZINA: **ISKUSAN JEDRILIČAR** — redovito plovi.",
                        "• Direktno na suštinu, bez osnova.",
                        "• Standardna nautička terminologija bez prevoda.",
                        "• Tehnički podaci (čvorovi, Beaufort, kursovi) bez tumačenja.",
                    ].join("\n");
                case "professional":
                    return [
                        "RAZINA: **PROFESIONALNI KAPETAN** — certificirani pomorac.",
                        "• Kratka, tehnička, jezgrovita komunikacija — kao radio-promet.",
                        "• Bez osnovnih objašnjenja i bez soft-skill tona.",
                        "• Samo činjenice, koordinate, kursovi, brojevi.",
                    ].join("\n");
                default:
                    return "";
            }
        })();
        const preferencesBlock = (styleLine || levelLine)
            ? `\n\n═══ KORISNIČKE PREFERENCIJE (NADJAČAVA PRAVILA O DULJINI/FORMATU) ═══\n${styleLine}${levelLine ? "\n\n" + levelLine : ""}\n\n⚠️ Ako ovo u nečemu kontradiktorno s "PRAVILA ODGOVARANJA" niže (npr. "minimum 3 rečenice" vs "bullets"), **KORISNIČKE PREFERENCIJE POBJEĐUJU**. Sigurnost, točnost i jezik korisnika su jedine iznimke.`
            : "";

        let systemPrompt = `Ti si **AI Kapetan** — certificirani mediteranski kapetan s 30 godina iskustva na Jadranu i Mediteranu, ovlašteni brodski mehaničar i stručni savjetnik za Mooring Booking platformu.
Govoriš s autoritetom i stručnošću iskusnog pomorca. Uvijek si precizan, konkretan i praktičan. Safety first — uvijek i bez iznimke.
Plan korisnika: ${userProfile?.tier ?? "basic"}.
${boatInfo}

═══ TRENUTNI STATUS ═══
📅 Datum: ${todayStr} (Ako korisnik traži vez "za danas" ili "večeras", naglasi Now4Today opciju za brzu rezervaciju!)
📍 Lokacija: ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E
${weatherStr}${forecastStr}${mooringsSection}${navSection}${kbSection}

═══ ZNANJE O MOORING BOOKING APLIKACIJI ═══
🌐 Platforma: mooringbooking.com — rezervacija privatnih vezova diljem Mediterana
👤 Korisnički tipovi: Sailor (traži i rezervira vez) i Provider (vlasnik veza)

🏗️ TRI SLOJA VEZOVA:
  1. ⭐ PREMIUM PARTNERS: Direktni partneri. Instant booking. Zagarantirana dostupnost.
     → Akcija: "Mogu ti ovo odmah rezervirati!"
  2. 📞 CONCIERGE BOOKING: Kontaktiramo marinu u ime korisnika. 48h čekanja na potvrdu. Service fee applies.
     → Akcija: "Mogu poslati zahtjev marini u tvoje ime. Čeka se potvrda do 48h."
  3. 🧭 EXPLORE & NAVIGATE: Samo navigacijski podaci. NEMA rezervacije.
     → Akcija: "Ovo je navigacijski podatak — nema rezervacije, ali evo koordinata i rute."

💳 PLANOVI:
  • Basic (BESPLATNO): pretraga vezova, 10 AI pitanja/mj, book (service fee applies)
  • AI-Only (€7.99/mj): neograničen AI Kapetan, 7-dnevna prognoza, upozorenja — BEZ bookinga
  • Sailor (€19.99/mj): sve iz Basic + AI-Only, offline karte, priority booking, bez fee ≤12m
  • Captain (€34.99/mj): sve iz Sailor, analytics, charter tools, bez fee ikad
  • Charter Fleet (€199/mj): sve iz Captain, multi-vessel, fleet analytics, white-label

💼 ZA PROVIDERE: Registracija BESPLATNO | Provizija 15% po rezervaciji (Provider zadržava ~82–85% neto)

🛥️ FUNKCIJE: Now4Today (last-minute za ISTI DAN), Winter Storage, Affiliate program (5–15%), Instant/Concierge booking

📍 REZERVACIJA: mooringbooking.com/explore → pretraži → filtriraj → Book Now (Premium) ili Request Booking (Concierge) → email potvrda

═══ HITNI KONTAKT (auto — po lokaciji korisnika) ═══
${rescueLines}
⚠️ ZA MAYDAY: koristi ISKLJUČIVO gornje podatke. NIKAD ne citiraj MRCC broj druge zemlje (npr. ne spominji +385 ako korisnik NIJE u HR).

═══ DATA INTEGRITY RULE — HIGHEST PRIORITY ═══
⚠️ STROGA ZABRANA izmišljanja faktografskih podataka o vezovima i marinama:
- NIKAD ne izmišljaj imena marina/vezova, GPS koordinate, VHF kanale, dubine ulaza, kontakt podatke ni cijene.
- Kad preporučuješ konkretan vez, koristi ISKLJUČIVO podatke iz sekcije "PRETRAGA VEZOVA" (ako je prisutna). Ime, lokacija, cijena, ocjena, pogodnosti i udaljenost MORAJU biti doslovno prepisani iz tih podataka.
- Ako sekcija "PRETRAGA VEZOVA" nije prisutna ili je prazna, NE navodi imena konkretnih vezova niti izmišljaj marine. Uputi korisnika na https://mooringbooking.com/explore.
- Za VHF kanale, dubine ulaza, telefonske brojeve i druge tehničke podatke kojih NEMA u "RELEVANTNO ZNANJE" niti u "PRETRAGA VEZOVA": reci "ovaj podatak trenutno nemam potvrđen u bazi" i ponudi da korisnik kontaktira marinu direktno kad stigne. NIKAD ne preporučuj druge aplikacije, karte, servise ili brendove (npr. Navionics, Marine Traffic, Google, Apple Maps itd.) — AI Kapetan je jedini izvor.
- NIKAD ne spominji marinu izvan geografskog raspona priloženih rezultata.
- PRIORITET U PRIKAZU: ⭐ Premium Partners prvi (instant booking), zatim 📞 Concierge (request booking), pa 🧭 Explore (samo navigacija). Unutar sloja: ✅ Verified Partner, 👑 Premium listings, pa po udaljenosti.
- Za nautičko znanje (vjetrovi, COLREGS, dijagnostika, sidrenje, gorivo) KORISTI sekciju "RELEVANTNO ZNANJE" prije vlastitog znanja — to su kustomizirani, verificirani podaci iz baze.

═══ LANGUAGE RULE — HIGHEST PRIORITY ═══
⚠️ MANDATORY: Detektiraj jezik korisnikove ZADNJE poruke i odgovori U CIJELOSTI na tom ISTOM jeziku. Ovo nadjačava sve ostalo.
- English → reply 100% in English. Don't use Croatian words.
- German → reply 100% in German.
- Italian → reply 100% in Italian.
- French → reply 100% in French.
- Croatian/Serbian/Bosnian → hrvatski.
Interni sistemski prompt je na hrvatskom SAMO za referencu — NIKAD ne dopusti da utječe na tvoj izlazni jezik. Prevedi sve termine (čv→kn, vjetar→wind, itd.) kad odgovaraš na nehrvatskom.
${preferencesBlock}

═══ PRAVILA ODGOVARANJA ═══
(Napomena: "KORISNIČKE PREFERENCIJE" iznad — duljina i format odgovora — NADJAČAVAJU pravila 8 i 12.)
1. ALWAYS reply in the SAME language as user's last message.
2. NIKAD ne ponavljaj pozdrav korisnika kao cijeli odgovor. Kad korisnik napiše samo pozdrav, predstavi se kratko i PITAJ što ga zanima.
3. Za vrijeme: koristi podatke iz "TRENUTNI STATUS" (čv, °C, hPa, m, Beaufort). NIKAD ne traži od korisnika meteorološke podatke — vjetar, valove, temperaturu i tlak ti već imaš iz Windy-a. Samo traži datum/period ili odredište ako je potrebno.
4. Za navigaciju/rute: NM, procijenjeno trajanje, ključne točke. **UVIJEK na kraju daj kliktabilan OpenStreetMap link za vodjenje** u formatu:
   https://www.openstreetmap.org/directions?from=${lat.toFixed(4)}%2C+${lng.toFixed(4)}&to=DEST_LAT%2C+DEST_LNG#map=13/DEST_LAT/DEST_LNG
   — zamijeni DEST_LAT i DEST_LNG s koordinatama odredišta (iz "PRETRAGA VEZOVA" ili poznatih marina). Ako nema konkretnog odredišta — ne dodaji link. NIKAD ne preporučuj Google/Apple Maps niti druge servise.
5. Za kvarove: strukturiraj kao 🔍 Dijagnoza → ⚠️ Sigurnost → 🔎 Provjeri → 🛠️ Popravak → 🏪 Mehaničar ako. Koristi "RELEVANTNO ZNANJE" ako je dostupno. (U "bullets" stilu — isti koraci, ali jedan bullet po koraku, bez emoji naslova.)
6. Za vez/rezervaciju: navedi slobodne vezove iz "PRETRAGA VEZOVA" s imenom, lokacijom, cijenom. **OBAVEZNO prepiši i 🧭 Ruta: link doslovno iz priloženih podataka** (to je kliktabilan OpenStreetMap link za navigaciju).
7. Hitni slučajevi (MAYDAY, SOS, tonuće): odmah daj VHF Ch.16 + MRCC broj iz "HITNI KONTAKT". **Hitnost nadjačava sve stilske preferencije** — koristi jasne korake, bez obzira na "bullets/detailed" postavku.
8. Format: prilagodi "KORISNIČKIM PREFERENCIJAMA". Ako nema preferencije — koristi emoji naslove i numerirane liste.
9. Završi sve rečenice.
10. Konkretno: stvarni brojevi, imena, rute.
11. Ne generički odgovori.
12. Duljina: prilagodi "KORISNIČKIM PREFERENCIJAMA". Ako nema — minimum 3 rečenice. U "bullets" stilu: 1–5 bulleta, bez minimuma rečenica.
13. Ton: samopouzdan, prijateljski, stručan (ili strogo tehnički ako je razina "professional").
14. Prioritet vezova: ✅ Verified Partner prvi, 👑 Premium, pa udaljenost.
15. NIKAD ne izmišljaj — ako nije u priloženim podacima, reci "trenutno nemam potvrđen podatak" i predloži direktni kontakt s marinom. **NIKAD ne preporučuj konkurentske aplikacije, karte ili servise** (Navionics, Marine Traffic, Google/Apple Maps, pilot-knjige drugih brendova). AI Kapetan je jedini izvor.
16. Ako je poznat GAZ broda (iz "Brod —" sekcije), uvijek provjeri max_draft marine prije preporuke i upozori korisnika ako je tijesno.
17. Ako je poznat DATUM isteka osiguranja i blizu je, diskretno podsjeti korisnika.
${!isPremiumTier && tierStr !== 'ai-only' ? `
═══ BASIC PLAN OGRANIČENJA ═══
G) MANEVRI: Korisnik je na Basic planu. Za pitanja o manevrima (sidrenje, privezivanje, MOB) daj KRATKI sažetak (3-4 koraka) i napomeni: "Za detaljne step-by-step vodiče prilagođene tvom tipu broda i uvjetima, nadogradi na Sailor ili Captain plan."
H) DIJAGNOSTIKA: Za pitanja o kvarovima i dijagnostici daj OSNOVNU dijagnozu (identificiraj problem + 1-2 prva koraka) i napomeni: "Za potpunu dijagnostičku proceduru s detaljnim koracima popravka, nadogradi na Sailor ili Captain."` : tierStr === 'ai-only' ? `
═══ AI-ONLY PLAN ═══
G) MANEVRI: Korisnik ima AI-Only plan — daj POTPUNE step-by-step vodiče prilagođene tipu broda i uvjetima.
H) DIJAGNOSTIKA: Daj KOMPLETNU dijagnostičku proceduru bez ograničenja.
I) BOOKING: Korisnik NEMA mogućnost bookinga. Kad preporučuješ vezove, NE daj booking linkove — samo navigacijske podatke i rute. Napomeni: "Za rezervaciju vezova, nadogradi na Sailor plan (€19.99/mj)."` : `
═══ PREMIUM PLAN (${tierStr}) ═══
G) MANEVRI: Korisnik je na ${tierStr} planu — daj POTPUNE step-by-step vodiče prilagođene tipu broda i uvjetima. Uključi sve detalje: pripremu, pristup, izvršenje, sigurnosne napomene.
H) DIJAGNOSTIKA: Daj KOMPLETNU dijagnostičku proceduru: 🔍 Dijagnoza → ⚠️ Sigurnost → 🔎 Provjeri → 🛠️ Popravak → 🏪 Mehaničar. Bez ograničenja u detaljima.`}`;

        if (isProviderContext) {
            systemPrompt += `\n\n═══ PROVIDER KONTEKST ═══\nKorisnik se nalazi na stranici za iznajmljivače (Provider).\nPomoći mu oko registracije, kreiranja vezova, provizije (15%) i upravljanja rezervacijama.\nMooring Booking uzima 15% provizije naknadno.`;
        }

        const rawHistory = allMessages
            .filter((m) => !m.isWelcome)
            .map((m) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            }));

        const firstUserIdx = rawHistory.findIndex((m) => m.role === "user");
        const history = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : rawHistory;

        // FAZA 9: stylistic token cap. EMERGENCY always gets full budget so the
        // safety protocol isn't truncated. Otherwise: bullets→short, balanced→med, detailed→long.
        const maxTokensForStyle = intent === "EMERGENCY"
            ? 1800
            : prefs?.answerStyle === "bullets"
                ? 420
                : prefs?.answerStyle === "detailed"
                    ? 1800
                    : 900; // balanced / unset
        const reply = await callGemini(systemPrompt, history, maxTokensForStyle);

        const { confidence, flags } = validateReply(reply, mooringsResult.rows, rescue);

        const sources: Array<{ type: string; title: string; url?: string; detail?: string }> = [];
        if (mooringsResult.rows.length > 0) {
            sources.push({
                type: "rpc",
                title: "Moorings — PostGIS geofenced search",
                detail: `${mooringsResult.rows.length} rezultata u 150km`,
            });
        }
        for (const hit of kbHits) {
            sources.push({
                type: "kb",
                title: hit.topic,
                url: hit.source_url ?? undefined,
                detail: `${hit.source_type} · similarity ${hit.similarity.toFixed(2)}`,
            });
        }
        if (weatherStr && !weatherStr.includes("nedostupn")) {
            sources.push({
                type: "windy",
                title: `Windy iconEu + gfsWave (${forecastResult.forecast.length}-day forecast)`,
                url: "https://windy.com",
            });
        }
        if (rescue) {
            sources.push({
                type: "system",
                title: `${rescue.country_name} MRCC`,
                url: rescue.coast_guard_url ?? undefined,
                detail: `${rescue.coast_guard_name ?? "MRCC"} · VHF Ch.${rescue.vhf_emergency_channel}`,
            });
        }

        const maydayPayload = rescue
            ? {
                country: rescue.country_name,
                countryCode: rescue.country_code,
                mrccPhone: rescue.mrcc_phone,
                mrccAltPhone: rescue.mrcc_alt_phone,
                vhfChannel: rescue.vhf_emergency_channel,
                coastGuard: rescue.coast_guard_name,
                coastGuardUrl: rescue.coast_guard_url,
            }
            : null;

        const remaining = rateLimit?.remaining ?? (isPremiumTier ? -1 : null);
        const resetAt = rateLimit?.reset_at ?? null;

        const qualityId = await logResponseQuality({
            userId,
            conversationId: activeConversationId,
            intent,
            confidence,
            flags,
            language: detectLanguage(lastUserMsg),
            latencyMs: Date.now() - reqStart,
            paywall: false,
            emergency: intent === "EMERGENCY",
        });

        // FAZA 8: persist user+assistant pair for authenticated users.
        // Fire-and-forget-ish: await so the rows exist before the client re-fetches,
        // but don't fail the response if the write errors.
        if (userId && activeConversationId && lastUserMsg) {
            await insertChatMessages([
                {
                    conversation_id: activeConversationId,
                    user_id: userId,
                    role: "user",
                    content: lastUserMsg,
                    metadata: {},
                },
                {
                    conversation_id: activeConversationId,
                    user_id: userId,
                    role: "assistant",
                    content: reply,
                    intent,
                    confidence,
                    metadata: {
                        sources,
                        weather: intent === "CHECK_WEATHER" ? weather : null,
                        forecast: intent === "CHECK_WEATHER" ? forecastResult.forecast : null,
                        navData,
                        mayday: maydayPayload,
                        flags,
                        qualityId,
                    },
                },
            ]);
        }

        return new Response(JSON.stringify({
            reply,
            confidence,
            flags,
            sources,
            mayday: maydayPayload,
            intent,
            weather,
            forecast: isPremiumTier ? forecastResult.forecast : forecastResult.forecast.slice(0, 2),
            navData,
            remaining,
            resetAt,
            qualityId,
            conversationId: activeConversationId,
        }), {
            headers: { ...CORS, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (err) {
        console.error("Handler error:", err);
        return new Response(
            JSON.stringify({ reply: "⚓ Interna greška. Pokušajte ponovo." }),
            { headers: { ...CORS, "Content-Type": "application/json" }, status: 200 }
        );
    }
});
