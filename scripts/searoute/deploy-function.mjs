// Deploy the sea-route edge function via the Supabase Management API
// (CLI binary is broken on this Windows host; MCP is unauthorized). Sends the
// function source files as multipart/form-data. No static assets — the graph is
// loaded from the sea_route_graph table at runtime.
//
//   node scripts/searoute/deploy-function.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const FN_DIR = path.join(REPO, "supabase/functions/sea-route");
const PROJECT_REF = "bblxawscmyzelinidkmb";
const SLUG = "sea-route";

const token = fs.readFileSync(path.join(REPO, ".env"), "utf8").match(/^ACSESSUPA=(.*)$/m)?.[1].trim();
if (!token) { console.error("ACSESSUPA not found in .env"); process.exit(1); }

const SOURCE_FILES = ["index.ts", "router.ts"]; // entrypoint + local dep
const metadata = { name: SLUG, entrypoint_path: "index.ts", verify_jwt: true };

const form = new FormData();
form.append("metadata", JSON.stringify(metadata));
for (const rel of SOURCE_FILES) {
  const content = fs.readFileSync(path.join(FN_DIR, rel), "utf8");
  // Each source file is a `file` part; filename is the path used in metadata/imports.
  form.append("file", new Blob([content], { type: "application/typescript" }), rel);
}

console.log(`Deploying "${SLUG}" (${SOURCE_FILES.join(", ")}) to project ${PROJECT_REF}…`);
const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/deploy?slug=${SLUG}`,
  { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form },
);
const text = await res.text();
console.log("HTTP", res.status);
console.log(text.slice(0, 800));
if (!res.ok) process.exit(1);
console.log("Deployed OK.");
