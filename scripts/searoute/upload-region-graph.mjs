// Upload a built region graph into the sea_route_graph table (so the edge
// function can load it from the DB instead of a bundled static file).
//
//   node scripts/searoute/upload-region-graph.mjs <regionKey>
//
// Reads the compact graph + meta from supabase/functions/sea-route/data/,
// then upserts via the Supabase Management API (ACSESSUPA token from .env).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const DATA = path.join(__dirname, "build");
const PROJECT_REF = "bblxawscmyzelinidkmb";

const regionKey = process.argv[2];
if (!regionKey) {
  console.error("Usage: node upload-region-graph.mjs <regionKey>");
  process.exit(1);
}

const token = fs.readFileSync(path.join(REPO, ".env"), "utf8").match(/^ACSESSUPA=(.*)$/m)?.[1].trim();
if (!token) { console.error("ACSESSUPA not found in .env"); process.exit(1); }

const meta = JSON.parse(fs.readFileSync(path.join(DATA, `${regionKey}.meta.json`), "utf8"));
// Ship the gzipped graph as base64 — keeps the upload ~1 MB (under the Management
// API request limit) and the row small; the edge function inflates it.
const graphGzB64 = fs.readFileSync(path.join(DATA, `${regionKey}.graph.json.gz`)).toString("base64");
console.log(`Uploading ${regionKey} v${meta.version}: ${meta.nodes} nodes / ${meta.edges} edges (${(graphGzB64.length / 1e6).toFixed(2)} MB base64)`);

// The Management API runs plain SQL (no bind params), so inline the values.
// base64 is [A-Za-z0-9+/=] only (no quotes/escapes); bbox/numbers are safe.
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
if (!/^[A-Za-z0-9+/=]+$/.test(graphGzB64)) { console.error("unexpected base64 chars"); process.exit(1); }
const bboxLit = `ARRAY[${meta.bbox.map(Number).join(",")}]::double precision[]`;
const query = `
INSERT INTO public.sea_route_graph (region, label, bbox, version, graph_gz_b64, nodes, edges, updated_at)
VALUES (${q(regionKey)}, ${q(meta.label)}, ${bboxLit}, ${q(meta.version)}, ${q(graphGzB64)}, ${Number(meta.nodes)}, ${Number(meta.edges)}, now())
ON CONFLICT (region) DO UPDATE SET
  label = EXCLUDED.label, bbox = EXCLUDED.bbox, version = EXCLUDED.version,
  graph_gz_b64 = EXCLUDED.graph_gz_b64, nodes = EXCLUDED.nodes, edges = EXCLUDED.edges, updated_at = now();
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const text = await res.text();
console.log("HTTP", res.status, text.slice(0, 300));
if (!res.ok) process.exit(1);
console.log("Uploaded OK.");
