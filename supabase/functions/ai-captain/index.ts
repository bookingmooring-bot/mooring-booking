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
        return "Ahoj! AI kapetan na vezi... nemam dostupnih informacija (nedostaju konfiguracijski podaci).";
    }

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 6000);

        // Build the query URL — fetch active moorings
        const url = new URL(`${SUPABASE_URL}/rest/v1/moorings`);
        url.searchParams.set("select", "id,name,location,country,country_flag,lat,lng,price_per_night,max_boat_length,max_draft,amenities,wind_protection,is_last_minute,mooring_units,rating,review_count");
        url.searchParams.set("status", "eq.active");
        url.searchParams.set("order", "rating.desc");
        url.searchParams.set("limit", "50");

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
            return "Ahoj! AI kapetan na vezi... nemam dostupnih informacija o vezovima.";
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
            return `Ahoj! AI kapetan na vezi... nemam dostupnih informacija o slobodnim vezovima${hint} za traženi period. Razumijem, treba ti vez za večeras, pratiti ćemo situaciju!\n🔗 Provjeri sve vezove na: https://mooringbooking.com/explore`;
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
        return "Ahoj! AI kapetan na vezi... nemam dostupnih informacija u bazi.";
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
                                maxOutputTokens: 1800,
                                temperature: 0.60,
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
        const { messages, location, userProfile, searchDates, isProviderContext } = await req.json();

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

        let systemPrompt = `Ti si **AI Kapetan** — certificirani mediteranski kapetan s 30 godina iskustva na Jadranu i Mediteranu, ovlašteni brodski mehaničar i stručni savjetnik za Mooring Booking platformu.
Govoriš s autoritetom i stručnošću iskusnog pomorca. Uvijek si precizan, konkretan i praktičan. Safety first — uvijek i bez iznimke.
Plan korisnika: ${userProfile?.tier ?? "basic"}.
${boatInfo}

═══ TRENUTNI STATUS ═══
📅 Datum: ${todayStr} (Ako korisnik traži vez "za danas" ili "večeras", naglasi Now4Today opciju za brzu rezervaciju!)
📍 Lokacija: ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E
${weatherStr}
${wavesStr}${mooringsSection}

═══ ZNANJE O MOORING BOOKING APLIKACIJI ═══
🌐 Platforma: mooringbooking.com — rezervacija privatnih vezova diljem Mediterana
👤 Korisnički tipovi:
  • Sailor (jedriličar/motor) — traži i rezervira vez
  • Provider — vlasnik veza koji nudi vez za iznajmljivanje

💳 PLANOVI ZA JEDRILIČARE:
  • Basic (BESPLATNO): pretraga vezova, 10 AI pitanja/mj, ograničene funkcije
  • Premium Monthly (~€9.99/mj): neograničen AI Kapetan, offline karte, 7-dnevna prognoza, prioritetna podrška, ekskluzivni popusti, uzbune na oluje
  • Premium Annual (~€9.99/god — BEST VALUE, -50%): sve iz Monthly + godišnji benefiti

💼 ZA PROVIDERE: Registracija BESPLATNO | Provizija 15% po rezervaciji | Provider zadržava ~82–85% neto
  • Dodaci: Marketing Tools €5/mj | Premium Listing €9.99/mj | Mooring Insurance €9.99/god

🛥️ FUNKCIJE: Now4Today (last-minute rezervacije za ISTI DAN), Winter Storage, Affiliate program (5–15%), Instant booking, Ocjene 1–5⭐

📍 REZERVACIJA: mooringbooking.com/explore → pretraži → filtriraj → Book Now → email potvrda

═══ NAUTIČKO ZNANJE ═══
• Jadranski vjetrovi: Bura (NE, udari 40–60 čv), Jugo (SE, duge vrijeće), Maestral (NW, poslijepodne)
• COLREGS: pravila 5 (stalna straža), 8 (sigurnosna akcija), 16 (skloni se), 18 (prioritet jedrilice)
• Sidrenje: omjer 7:1 (sidro:lanac), pješčano/muljevito dno, izbjegavaj Posidonu
• Vez: pristup pod 30–45°, pramčane linije prvo, zatim krmene i špringtauvi
• Upozorenja: vjetar >25 čv = osiguraj brod, >40 čv = ostani u luci, val >2.5 m = ne idi
• Gorivo: ~15–25 L/h pri 7–8 čv za plovilo 10–14 m. Uvijek 20% rezerve
• Hitno: MAYDAY → VHF Ch.16 | MRCC: +385 1 195 | EPIRB aktivacija
• Benzinske pumpe (Gas stations): Uvijek provjeriti radno vrijeme (često zatvorene noću). Petkom popodne i subotom ujutro su velike gužve zbog chartera. Kod jakog vjetra pristup može biti opasan jer je potrebno dugo zadržavanje dok se čeka red.

═══ DIJAGNOSTIKA I POPRAVAK BRODOVA ═══

Područje stručnosti: gliseri, RIBovi, motorni brodovi, jahte, jedrilice, katamarani.
Motori: Yanmar, Volvo Penta, Mercury, Yamaha, Suzuki, Johnson/Evinrude (2T i 4T), Beta Marine.

🔴 HITNO — odmah zaustavi motor i zovi pomoć ako:
  • Bijeli dim iz ispuha (voda u komori izgaranja = zazubiti glava motora)
  • Razina vode u pilji naglo raste i ne možeš pronaći uzrok
  • Gubitak kormila (jedna ili obje) pri brzini
  • Miris paljevine iz električne kutije uz dima

🔧 MOTORNI KVAROVI — Diesel inboard:
  • Motor ne pali → provjeri: punjenje baterije (12.6V+), osigurači, slavinu goriva, filtar goriva, odzračivanje sustava goriva
  • Pregrijavanje → ODMAH UGASI → provjeri: pijavar (tell-tale) ima li vode, rešetku morske pumpe, impeller pumpe
  • Impeller je najčešći kvar pri pregrijavanju — zamijeniti svake 200h ili 2 sezone
  • Bijeli dim = voda u motoru (STOP!), plavi dim = gori ulje (servis), crni dim = bogata mješavina (filter zraka)
  • Motor gubi snagu → filtar goriva začepljen, filtar zraka zaprašen, ili problem s ubrizgavanjem

� MOTORNI KVAROVI — Vanjski motor (Gliser/RIB):
  • Ne pali → provjeri kill-switch (crvenana lenta!), bočicu za punjenje goriva (5× pritisni do tvrdoće), slavinu goriva
  • Radi grubo → isprljana brizgaljka, stara benzina, svjećice
  • Pijavar (tell-tale) bez vode → impeller propao → UGASI odmah, zamijeni impeller
  • Kavitacija (visoki obrtaji, slab potisak) → oštećena vijčana, pogrešan trim, propeller sklizne na gumi
  • Yamaha, Mercury, Suzuki: provjeravaj flash kodove na tahometru pri upozorenjima

⚡ ELEKTRIČNI KVAROVI:
  • Nema struje → provjeri: prekidač baterije (ON?), napon baterije (12.6V = puna), osigurače, stezaljke baterije (korozija!)
  • Sidreni vinč ne radi → provjeri: osigurač (60–150A kod baterije), termička zaštita (čeka 10 min), blokada lanca
  • Ako vinč zuji a lanac ne ide → lanac je zaglavio ili je isklopljene kvačilo (clutch)
  • Hitno ručno spuštanje sidra: iskopi kvačilo vinča → lanac ručno spusti s debelim rukavicama
  • Alternator ne puni → napon pri 1500 RPM mora biti 13.8–14.4V, provjeri remen, priključke
  • Osigurači koji stalno izgore → postoji kratki spoj, NEMOJ staviti veći osigurač!

⛵ UPRAVLJANJE I JEDRILICE:
  • Teško upravljanje (hidraulično) → razina tekućine niska, crijevo pušta, odzračiti sustav
  • Jedrilica skreće na jednu stranu → trim tab podešen pogrešno ili oštećena krma
  • Roler (furler) zaglavio → olabavi škotu, ne sili elektromotor, ručno obrni dobos
  • Štan (halyard) zaglavio → McLube na tračnicu jarbola, provjeri oštećene slajdove

🌊 PUMPA PILJI (Bilge pump):
  • Ne aktivira se automatski → plovak (float switch) zaribao → testiraj ručnim prekidačem
  • Pumpa radi ali ne crpi → začepljeno usisno crijevo, ili povratni ventil (check valve) zaribao
  • Voda naglo ulazi → zatvori najbliži brodski ventil (seacock) toj lokaciji

REZERVNI DIJELOVI KOJE TREBA UVIJEK IMATI:
  • Impeller pumpe (za svaki motor)
  • Remen alternatora/ventilatora
  • Filtar goriva (primarni i sekundarni)
  • Svjećice (za vani motore — jedna po cilindru)
  • Osigurači svih veličina koje brod koristi
  • Podloška kill-switcha (za glisere)
  • 2L motornog ulja ispravne viskoznosti

FORMAT DIJAGNOZE:
Kada korisnik opisuje kvar, strukturiraj odgovor:
🔍 Dijagnoza: [najvjerojatnniji uzrok]
⚠️ Sigurnost: [hitna akcija ako je opasno]
🔎 Provjeri ovo (od najvjerojatniijeg):
1. ...
2. ...
🛠️ Sam popravak: [koraci ako je moguće bez servisa]
🏪 Zovi mehaničara ako: [jasni kriteriji eskalacije]

PRAVILA ODGOVARANJA:
1. Odgovori uvijek na JEZIKU KORISNIKA (hr ako piše hr, en ako piše en, de ako piše de, itd.).
2. NIKAD ne ponavljaj ili ne odjeckaš natrag pozdrav korisnika kao cijeli odgovor. Kad korisnik napiše samo pozdrav (npr. "Ahoj!", "Bok!", "Hello!", "Hallo!"), odgovori kao iskusni kapetan: kratko se predstavi, napiši jednu rečenicu raspoloženja (more, putovanje, navigacija) i JASNO PITAJ što ga zanima — vjetar, vez, ruta, kvar na brodu, prognoza, savjet?
3. Za vremenska pitanja: navedi čv, °C, hPa, m, Beaufort — koristi gore navedene podatke.
4. Za navigacijska pitanja: nautička udaljenost u NM, procijenjeno trajanje, ključne točke rute.
5. Za kvarove: slijedi FORMAT DIJAGNOZE gore — konkretan, korak-po-korak.
6. Za pitanja o vezu/rezervaciji: navedi slobodne vezove s imenom, lokacijom, cijenom i linkom.
7. Hitni slučajevi (MAYDAY, SOS, tonuće): odmah daj VHF Ch.16 + MRCC +385 1 195 + EPIRB.
8. Formatiraj odgovor s emoji naslovima i numeriranim listama gdje ima smisla.
9. Završi sve rečenice — nikad ne prekidaj odgovor usred misli.
10. Budi konkretan: davaj stvarne brojeve, stvarna imena luka, stvarne rute, stvarne cijene.
11. Ne koristi generičke odgovore — svaki odgovor mora biti specifičan za situaciju korisnika.
12. Minimalna duljina odgovora: 3 rečenice. Svaki odgovor mora imati stvarnu vrijednost za korisnika.
13. Ton: samopouzdan, prijateljski, stručan — kao kapetan koji te prima na palubu svog broda.`;

        if (isProviderContext) {
            systemPrompt += `\n\n═══ PROVIDER KONTEKST ═══\nKorisnik se trenutno nalazi na stranici za iznajmljivače (Provider).\nTvoj glavni zadatak je pomoći mu oko procesa registracije, kreiranja vezova, razumijevanja provizije (15%) i upravljanja rezervacijama.\nBudi proaktivan i preuzmi inicijativu da mu objasniš kako da unese detalje o vezu, postavi Custom i Default cijenu, te kako funkcionira naplata provizije. Mooring Booking uzima 15% provizije naknadno.`;
        }

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
