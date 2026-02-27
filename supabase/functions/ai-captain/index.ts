import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const WINDY_API_KEY = Deno.env.get("WINDY_API_KEY") ?? "4w1wpCKBi8zaoPySF3fMcXfXjUQQGzJy";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Mooring intent detection ──────────────────────────────────────────────────
function wantsMooringSearch(message: string): boolean {
    const keywords = [
        "vez", "veza", "vezovi", "vezova", "slobodan", "slobodni", "slobodnih",
        "mooring", "marina", "luka", "lukama", "pier", "berth",
        "rezerv", "booking", "knjiga", "bookiraj", "bookirati",
        "privez", "priveza", "privežem", "privezati", "privezujem",
        "ima li", "imate li", "postoji li", "gdje da pristanem",
        "gdje mogu", "gdje bih mogao", "preporuk", "preporuč",
        "available", "find a berth", "find mooring", "any free",
        "slobodno mjesto", "kako rezervirati", "kako bookirati",
    ];
    const lower = message.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
}

// ── Fetch available moorings from Supabase ────────────────────────────────────
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
    mooring_units: number;
    rating: number;
    review_count: number;
}

async function fetchAvailableMoorings(
    checkIn: string,
    checkOut: string,
    boatLength?: number,
): Promise<string> {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return "ℹ️ Pretraga vezova trenutno nije dostupna (nedostaju konfiguracijski podaci).";
    }

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 6000);

        // Build the query URL — fetch active moorings
        const url = new URL(`${SUPABASE_URL}/rest/v1/moorings`);
        url.searchParams.set("select", "id,name,location,country,country_flag,lat,lng,price_per_night,max_boat_length,max_draft,amenities,wind_protection,is_last_minute,mooring_units,rating,review_count");
        url.searchParams.set("status", "eq.active");
        url.searchParams.set("order", "rating.desc");
        url.searchParams.set("limit", "10");

        // If boat length is specified, filter moorings that can accommodate it
        if (boatLength && boatLength > 0) {
            url.searchParams.set("max_boat_length", `gte.${boatLength}`);
        }

        const res = await fetch(url.toString(), {
            headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
        });
        clearTimeout(tid);

        if (!res.ok) {
            console.error("Moorings fetch failed:", res.status, await res.text());
            return "ℹ️ Pretraga vezova trenutno nije dostupna.";
        }

        const moorings: MooringRow[] = await res.json();

        // Now fetch conflicting bookings for the date range
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

        // Filter out booked moorings
        const available = moorings.filter((m) => !bookedMooringIds.has(m.id));

        if (available.length === 0) {
            const hint = boatLength ? ` za brod duljine ${boatLength}m` : "";
            return `ℹ️ Trenutno nema dostupnih vezova${hint} za period ${checkIn} – ${checkOut} u sustavu.\n🔗 Provjeri sve vezove na: https://mooringbooking.com/explore`;
        }

        const lines = available.slice(0, 5).map((m, i) => {
            const flag = m.country_flag ? `${m.country_flag} ` : "";
            const amenStr = m.amenities?.length > 0 ? m.amenities.join(", ") : "—";
            const maxBoat = m.max_boat_length ? `maks. brod ${m.max_boat_length}m` : "";
            const rating = m.rating > 0 ? ` | ⭐ ${m.rating.toFixed(1)}` : "";
            const lastMin = m.is_last_minute ? " 🔥 Last-minute!" : "";
            return `${i + 1}. **${m.name}** — ${flag}${m.location}, ${m.country}\n   💰 €${m.price_per_night}/noć${maxBoat ? ` | ${maxBoat}` : ""} | Zaštita od vjetra: ${m.wind_protection}${rating}${lastMin}\n   🛠️ Pogodnosti: ${amenStr}`;
        });

        return `⚓ SLOBODNI VEZOVI (${checkIn} – ${checkOut}):\n${lines.join("\n\n")}\n\n🔗 Rezerviraj na: https://mooringbooking.com/explore`;
    } catch (e) {
        console.error("fetchAvailableMoorings error:", e);
        return "ℹ️ Pretraga vezova trenutno nije dostupna.";
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

async function fetchWindyWeather(lat: number, lng: number): Promise<string> {
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 8000);

        const res = await fetch("https://api.windy.com/api/point-forecast/v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                lat, lon: lng,
                model: "iconEu",
                parameters: ["wind", "windGust", "pressure", "temp", "dewpoint"],
                levels: ["surface"],
                key: WINDY_API_KEY,
            }),
        });
        clearTimeout(tid);

        if (!res.ok) return "Windy API nedostupan.";
        const data = await res.json();

        const windMs: number = data["wind_u-surface"]?.[0] ?? 0;
        const gustMs: number = data["windGust-surface"]?.[0] ?? 0;
        const tempK: number = data["temp-surface"]?.[0] ?? 288;
        const pressurePa: number = data["pressure-surface"]?.[0] ?? 101325;
        const dewK: number = data["dewpoint-surface"]?.[0] ?? 283;
        const bft = msToBeaufort(windMs);

        return `🌬️ Vjetar: ${msToKnots(windMs)} čv (udari ${msToKnots(gustMs)} čv) — Beaufort ${bft}\n🌡️ Temperatura: ${(tempK - 273.15).toFixed(1)}°C | Rosište: ${(dewK - 273.15).toFixed(1)}°C\n📊 Tlak: ${(pressurePa / 100).toFixed(0)} hPa`;
    } catch {
        return "Meteorološki podaci trenutno nedostupni.";
    }
}

// ── Windy Wave model ──────────────────────────────────────────────────────────
async function fetchWindyWaves(lat: number, lng: number): Promise<string> {
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 8000);

        const res = await fetch("https://api.windy.com/api/point-forecast/v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                lat, lon: lng,
                model: "gfsWave",
                parameters: ["waves", "swell1"],
                levels: ["surface"],
                key: WINDY_API_KEY,
            }),
        });
        clearTimeout(tid);

        if (!res.ok) return "Podaci o valovima nedostupni.";
        const data = await res.json();

        const waveH = (data["waves_height-surface"]?.[0] ?? 0).toFixed(1);
        const swellH = (data["swell1_height-surface"]?.[0] ?? 0).toFixed(1);
        return `🌊 Visina valova: ${waveH} m | Swell: ${swellH} m`;
    } catch {
        return "Podaci o valovima trenutno nedostupni.";
    }
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
                    .sort((a: string, b: string) => b.localeCompare(a)); // newest first
                console.log(`Models (${api}):`, JSON.stringify(models));
                return models;
            }
        } catch (e) {
            console.error("ListModels error:", e);
        }
    }
    return [];
}

// ── Call Gemini ────────────────────────────────────────────────────────────────
async function callGemini(prompt: string, history: Array<{ role: string; parts: Array<{ text: string }> }>): Promise<string> {
    if (!GEMINI_API_KEY) {
        return "⚓ AI Kapetan nije konfiguriran (nedostaje API ključ). Kontaktirajte podršku.";
    }

    // Auto-discover which flash models are available for this API key
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
                                maxOutputTokens: 1500,
                                temperature: 0.65,
                                topP: 0.9,
                            },
                        }),
                    }
                );

                if (res.ok) {
                    clearTimeout(tid);
                    const json = await res.json();
                    console.log(`Success: ${modelName} on ${apiVersion}`);
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

    try {
        const { messages, location, userProfile, searchDates } = await req.json();

        const lat: number = location?.lat ?? 43.5;
        const lng: number = location?.lng ?? 16.4;

        // Date range for mooring search: provided dates or next 7 days
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const nextWeekStr = new Date(today.getTime() + 7 * 86400000).toISOString().split("T")[0];
        const checkIn: string = searchDates?.checkIn ?? todayStr;
        const checkOut: string = searchDates?.checkOut ?? nextWeekStr;

        // Extract the last user message text for intent detection
        const allMessages = messages as Array<{ role: string; content: string; isWelcome?: boolean }>;
        const lastUserMsg = [...allMessages].reverse().find((m) => m.role === "user")?.content ?? "";
        const boatLength: number | undefined = userProfile?.boatLength
            ? Number(userProfile.boatLength)
            : undefined;

        // Fetch weather + waves + (conditionally) moorings in parallel
        const shouldSearchMoorings = wantsMooringSearch(lastUserMsg);
        const [weatherStr, wavesStr, mooringsStr] = await Promise.all([
            fetchWindyWeather(lat, lng),
            fetchWindyWaves(lat, lng),
            shouldSearchMoorings ? fetchAvailableMoorings(checkIn, checkOut, boatLength) : Promise.resolve(""),
        ]);

        const boatInfo = userProfile?.boatName
            ? `Brod: ${userProfile.boatName}${boatLength ? `, duljina ${boatLength}m` : ""}.`
            : boatLength
                ? `Brod: ${boatLength}m duljine.`
                : "Podaci o brodu nisu uneseni.";

        const mooringsSection = mooringsStr
            ? `\n\n═══ PRETRAGA VEZOVA ═══\n${mooringsStr}`
            : "";

        const systemPrompt = `Ti si **AI Kapetan** — iskusni mediteranski kapetan s 30 godina iskustva na Jadranu i Mediteranu, i stručni asistent za Mooring Booking aplikaciju.
Govoriš s autoritetom, ali prijateljski. Safety first — uvijek.
Plan korisnika: ${userProfile?.tier ?? "basic"}.
${boatInfo}

═══ TRENUTNO STANJE MORA (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E) ═══
${weatherStr}
${wavesStr}${mooringsSection}

═══ ZNANJE O MOORING BOOKING APLIKACIJI ═══
🌐 Platforma: mooringbooking.com — rezervacija privatnih vezova diljem Mediterana
👤 Korisnički tipovi:
  • Sailor (jedriličar/motor) — traži i rezervira vez
  • Provider — vlasnik veza koji nudi vez za iznajmljivanje

💳 PLANOVI ZA JEDRILIČARE (Sailor Subscription):
  • Basic (BESPLATNO): pretraga vezova, 10 AI pitanja/mj, ograničene funkcije
  • Premium Monthly (~€9.99/mj): neograničen AI Kapetan, offline karte, 7-dnevna prognoza, prioritetna podrška, ekskluzivni popusti, uzbune na oluje, napredne nautičke informacije
  • Premium Annual (~€9.99/god — BEST VALUE, uštedite 50%): sve iz Monthly + dodatni godišnji benefiti

💼 ZA PROVIDERE (vlasnike vezova):
  • Registracija i listanje veza: BESPLATNO
  • Provizija: 15% po rezervaciji (Stripe fee 2.9% + €0.30 oduzet od iznosa)
  • Provider zadrži 85% neto iznosa (primjer: €100 booking → Provider dobiva ~€82.28)
  • Opcijski dodaci:
    - Marketing Tools: €5/mj (istaknuto oglašavanje)
    - Premium Listing: €9.99/mj (prioritetan prikaz u pretrazi)
    - Mooring Insurance: €9.99/god (osiguranje trećih strana i medijacija sigurnosti veza)

🛥️ POSEBNE FUNKCIJE APLIKACIJE:
  • Now4Today: last-minute rezervacije za isti dan — brod koji treba vez odmah!
  • Winter Storage: zimovanje broda (wet/dry/oba tipa)
  • Affiliate program: 5–15% za preporučene korisnike (plaća platforma, ne provider)
  • Kalender dostupnosti: provider blokira termine, korisnik vidi slobodne dane
  • Instant booking: potvrda rezervacije odmah, bez čekanja
  • Securno plaćanje: Visa, Mastercard, PayPal, Google Pay, Maestro, cash
  • Ocjene i recenzije: jedriličari ocjenjuju vez 1–5 zvjezdica
  • Affiliate link: korisnici i provideri mogu dijeliti referalne linkove

📍 KAKO REZERVIRATI VEZ:
  1. Posjeti mooringbooking.com/explore
  2. Pretraži po lokaciji, datumu check-in/check-out, duljini broda
  3. Filtriraj po pogodnostima (voda, struja, WiFi, tuš, toalet, gorivo, restoran)
  4. Klikni "Book Now" → unesi podatke broda → odaberi plaćanje → potvrdi
  5. Dobivaš confirmation_code putem emaila

═══ NAUTIČKO ZNANJE ═══
• Jadranski vjetrovi: Bura (NE, udari 40–60 čv), Jugo (SE, duge vrijeće), Maestral (NW, poslijepodne)
• COLREGS: pravila 5 (stalna straža), 8 (sigurnosna akcija), 16 (plovilo koje se mora skloniti), 18 (prioritet)
• Sidrenje: omjer 7:1 (sidro:lanac), pješčano/muljevito dno, izbjegavaj Posidonu
• Vez (mooring): pristup pod 30–45°, pramčane linije prvo, zatim krmene i špringtauvi
• Brzine: jedrenjak 4–5 čv, motorni 6–8 čv za procjenu trajanja puta
• Upozorenja: vjetar >25 čv = osiguraj brod, >40 čv = ostani u luci, val >2.5 m = ne idi
• Jadran: mikroplimarstvo ≤0.5 m, struje 0.5–2 čv uz kanale
• Gostovnica: Q žuta zastava pri prvom pristajanju u stranoj luci (EU customs)
• Brodski dokumenti: dozvola za plovilo + skipperska potvrda + VHF radio dozvola
• Gorivo: ~15–25 L/h pri 7–8 čv za plovilo 10–14 m. Uvijek 20% rezerve
• Hitno: MAYDAY → VHF Ch.16 | MRCC: +385 1 195 | EPIRB aktivacija

PRAVILA ODGOVARANJA:
1. Odgovori uvijek na JEZIKU KORISNIKA (hr ako piše hr, en ako piše en).
2. Za vremenska pitanja: navedi čv, °C, hPa, m, Beaufort — koristi gore navedene podatke.
3. Za navigacijska pitanja: nautička udaljenost u NM, procijenjeno trajanje, ključne točke rute.
4. Za pitanja o vezu/rezervaciji: ako imaš SLOBODNE VEZOVE iz pretrage — NAVEDI IH s imenom, lokacijom, cijenom i linkom.
5. Za pitanja o aplikaciji: daj točne informacije iz APP ZNANJA (planovi, cijene, funkcije).
6. Hitni slučajevi (MAYDAY, SOS): odmah daj VHF Ch.16 + MRCC +385 1 195 + EPIRB proceduru.
7. Formatiraj odgovor s emoji naslovima i numeriranim listama gdje ima smisla.
8. Završi sve rečenice — nikad ne prekidaj odgovor usred misli.
9. Budi konkretan: davaj stvarne brojeve, stvarna imena luka, stvarne rute, stvarne cijene.`;

        const rawHistory = allMessages
            .filter((m) => !m.isWelcome)
            .map((m) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            }));

        // Ensure history starts with a user message
        const firstUserIdx = rawHistory.findIndex((m) => m.role === "user");
        const history = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : rawHistory;

        const reply = await callGemini(systemPrompt, history);

        return new Response(JSON.stringify({ reply }), {
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
