// Admin helper: embeds all nautical_kb rows where embedding IS NULL.
// Trigger with POST to this endpoint (service-role key in auth header).
// Safe to re-run; only updates unembedded rows. Batches to respect Gemini quota.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function embedText(text: string): Promise<number[] | null> {
    for (const api of ["v1beta", "v1"]) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/${api}/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "models/text-embedding-004",
                        content: { parts: [{ text }] },
                        taskType: "RETRIEVAL_DOCUMENT",
                    }),
                },
            );
            if (res.ok) {
                const j = await res.json();
                return j.embedding?.values ?? null;
            }
            console.error(`embed ${api} ${res.status}:`, (await res.text()).slice(0, 200));
        } catch (e) {
            console.error("embed error:", (e as Error).message);
        }
    }
    return null;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

    try {
        // Fetch unembedded rows
        const listRes = await fetch(
            `${SUPABASE_URL}/rest/v1/nautical_kb?select=id,topic,content&embedding=is.null`,
            {
                headers: {
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
            },
        );
        if (!listRes.ok) {
            return new Response(JSON.stringify({ error: "list failed", status: listRes.status }), {
                headers: { ...CORS, "Content-Type": "application/json" },
                status: 500,
            });
        }
        const rows: Array<{ id: string; topic: string; content: string }> = await listRes.json();

        let ok = 0;
        let failed = 0;
        for (const row of rows) {
            const text = `${row.topic}\n\n${row.content}`;
            const vec = await embedText(text);
            if (!vec) {
                failed++;
                continue;
            }
            const upd = await fetch(
                `${SUPABASE_URL}/rest/v1/nautical_kb?id=eq.${row.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "apikey": SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    body: JSON.stringify({ embedding: `[${vec.join(",")}]`, updated_at: new Date().toISOString() }),
                },
            );
            if (upd.ok) ok++;
            else {
                failed++;
                console.error(`update ${row.id} ${upd.status}:`, (await upd.text()).slice(0, 200));
            }
            // Gentle rate-limit
            await new Promise((r) => setTimeout(r, 100));
        }

        return new Response(
            JSON.stringify({ total: rows.length, embedded: ok, failed }),
            { headers: { ...CORS, "Content-Type": "application/json" }, status: 200 },
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: (err as Error).message }), {
            headers: { ...CORS, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
