// Build a marnet-style sea-routing graph for one region, fully offline.
//
//   node scripts/searoute/build-region-graph.mjs <regionKey>
//   node scripts/searoute/build-region-graph.mjs adriatic
//
// Pipeline: load Natural Earth 10m land (cached) -> clip to the region bbox ->
// buffer land for a coast margin -> spatial-index it -> lay a ~1 NM grid ->
// keep water points -> connect 8-neighbour edges whose segment stays in water ->
// prune to the largest connected component -> emit a GeoJSON LineString
// FeatureCollection (the exact shape geojson-path-finder@1.5.3 / searoute-js eat),
// plus a node sidecar and meta. Self-checks a few known routes before writing.
//
// Output (committed, loaded by the sea-route edge function):
//   supabase/functions/sea-route/data/<region>.marnet.json(.gz)
//   supabase/functions/sea-route/data/<region>.nodes.json(.gz)
//   supabase/functions/sea-route/data/<region>.meta.json

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import bboxClip from "@turf/bbox-clip";
import flatten from "@turf/flatten";
import buffer from "@turf/buffer";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";

import { REGIONS, BUILD } from "./regions.mjs";
import { makeRouter, haversineNM } from "./router.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const CACHE = path.join(__dirname, ".cache", "ne_10m_land.json");
// Build artifacts live next to the script; the graph is uploaded into the
// sea_route_graph table (see upload-region-graph.mjs), not bundled in the function.
const OUT_DIR = path.join(__dirname, "build");

const t0 = Date.now();
const ms = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const log = (...a) => console.log(`[${ms()}]`, ...a);

// ---- region ----------------------------------------------------------------
const regionKey = process.argv[2];
if (!regionKey || !REGIONS[regionKey]) {
  console.error(`Usage: node build-region-graph.mjs <regionKey>\nKnown: ${Object.keys(REGIONS).join(", ")}`);
  process.exit(1);
}
const region = REGIONS[regionKey];
const [minLng, minLat, maxLng, maxLat] = region.bbox;
const { coastBufferNM, edgeSampleNM, coordDecimals } = BUILD;
// Open, large-island regions (Tyrrhenian, West Med) use a coarser grid so the
// graph fits the Edge Function's 256 MB / upload limits; island-dense regions
// (Adriatic, Aegean) stay fine. Per-region override wins over the default.
const gridNM = region.gridNM ?? BUILD.gridNM;
const round = (n) => Number(n.toFixed(coordDecimals));

log(`Region "${region.label}" bbox=[${region.bbox.join(", ")}]  grid=${gridNM} NM  buffer=${coastBufferNM} NM`);

// ---- 1. load + clip land ----------------------------------------------------
if (!fs.existsSync(CACHE)) {
  console.error(`Missing coastline cache: ${CACHE}\nDownload it once (online):\n  node -e "fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/physical/ne_10m_land.json').then(r=>r.text()).then(t=>require('fs').writeFileSync('${CACHE.replace(/\\/g, "/")}',t))"`);
  process.exit(1);
}
log("Loading Natural Earth 10m land…");
const land = JSON.parse(fs.readFileSync(CACHE, "utf8"));

log("Clipping to region bbox…");
const clippedPolys = [];
for (const feat of land.features) {
  const clipped = bboxClip(feat, region.bbox);
  if (!clipped.geometry || !clipped.geometry.coordinates.length) continue;
  for (const poly of flatten(clipped).features) {
    if (poly.geometry && poly.geometry.coordinates.length) clippedPolys.push(poly);
  }
}
log(`Clipped land polygons: ${clippedPolys.length}`);

// ---- 2. buffer land (coast margin) -----------------------------------------
log("Buffering land for coast margin…");
const bufferedPolys = [];
for (const poly of clippedPolys) {
  try {
    const b = buffer(poly, coastBufferNM, { units: "nauticalmiles" });
    if (b && b.geometry) {
      for (const fp of flatten(b).features) bufferedPolys.push(fp);
    }
  } catch {
    bufferedPolys.push(poly); // fall back to the unbuffered polygon
  }
}
log(`Buffered land polygons: ${bufferedPolys.length}`);

// ---- 3. spatial index of land polygon bboxes -------------------------------
// Uniform hash grid: cell -> [polygon indices]. Keeps point/edge water tests
// from scanning every polygon.
const CELL = 0.25; // degrees
const cellKey = (lng, lat) => `${Math.floor(lng / CELL)},${Math.floor(lat / CELL)}`;
const polyBox = []; // [minLng,minLat,maxLng,maxLat] per buffered polygon
const index = new Map();
for (let i = 0; i < bufferedPolys.length; i++) {
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const ring of bufferedPolys[i].geometry.coordinates) {
    for (const [x, y] of ring) {
      if (x < bx0) bx0 = x; if (y < by0) by0 = y;
      if (x > bx1) bx1 = x; if (y > by1) by1 = y;
    }
  }
  polyBox.push([bx0, by0, bx1, by1]);
  for (let cx = Math.floor(bx0 / CELL); cx <= Math.floor(bx1 / CELL); cx++) {
    for (let cy = Math.floor(by0 / CELL); cy <= Math.floor(by1 / CELL); cy++) {
      const k = `${cx},${cy}`;
      (index.get(k) || index.set(k, []).get(k)).push(i);
    }
  }
}

// Point is on land if inside any candidate buffered polygon.
function isLand(lng, lat) {
  const cand = index.get(cellKey(lng, lat));
  if (!cand) return false;
  const pt = point([lng, lat]);
  for (const i of cand) {
    const [bx0, by0, bx1, by1] = polyBox[i];
    if (lng < bx0 || lng > bx1 || lat < by0 || lat > by1) continue;
    if (booleanPointInPolygon(pt, bufferedPolys[i])) return true;
  }
  return false;
}
const isWater = (lng, lat) => !isLand(lng, lat);

// ---- 4. grid + water nodes --------------------------------------------------
// Constant lat/lon step (dLon at mid-latitude) keeps a clean (row,col) lattice
// so 8-neighbour offsets and node identity are deterministic.
const midLat = (minLat + maxLat) / 2;
const dLat = gridNM / 60;
const dLon = (gridNM / 60) / Math.cos((midLat * Math.PI) / 180);
const nRows = Math.floor((maxLat - minLat) / dLat) + 1;
const nCols = Math.floor((maxLng - minLng) / dLon) + 1;
log(`Grid ${nRows} rows x ${nCols} cols (${nRows * nCols} candidate points)…`);

const nodes = new Map(); // "r,c" -> [lng,lat] (rounded), water only
const coordKey = (lng, lat) => `${lng},${lat}`;
for (let r = 0; r < nRows; r++) {
  const lat = round(minLat + r * dLat);
  for (let c = 0; c < nCols; c++) {
    const lng = round(minLng + c * dLon);
    if (isWater(lng, lat)) nodes.set(`${r},${c}`, [lng, lat]);
  }
  if (r % 50 === 0) log(`  water scan row ${r}/${nRows} — kept ${nodes.size}`);
}
log(`Water nodes: ${nodes.size}`);

// ---- 5. edges (8-connectivity, forward offsets) ----------------------------
// A segment is kept only if every sample along it is water (cheap, reuses the
// point index; dense enough at this resolution to reject island crossings).
const sampleSteps = Math.max(2, Math.ceil(gridNM / edgeSampleNM));
function segmentInWater(a, b) {
  for (let s = 1; s < sampleSteps; s++) {
    const f = s / sampleSteps;
    if (isLand(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)) return false;
  }
  return true;
}
const FORWARD = [[1, 0], [0, 1], [1, 1], [1, -1]];
const edges = []; // [aKey, bKey, [lngA,latA], [lngB,latB]]
for (const [key, a] of nodes) {
  const [r, c] = key.split(",").map(Number);
  for (const [dr, dc] of FORWARD) {
    const bKey = `${r + dr},${c + dc}`;
    const b = nodes.get(bKey);
    if (!b) continue;
    if (segmentInWater(a, b)) edges.push([key, bKey, a, b]);
  }
}
log(`Candidate edges: ${edges.length}`);

// ---- 6. prune to largest connected component -------------------------------
const adj = new Map();
for (const [ak, bk] of edges) {
  (adj.get(ak) || adj.set(ak, []).get(ak)).push(bk);
  (adj.get(bk) || adj.set(bk, []).get(bk)).push(ak);
}
const comp = new Map();
let best = null, bestSize = 0;
for (const start of adj.keys()) {
  if (comp.has(start)) continue;
  const id = comp.size;
  const stack = [start];
  comp.set(start, id);
  let size = 0;
  while (stack.length) {
    const n = stack.pop();
    size++;
    for (const m of adj.get(n) || []) if (!comp.has(m)) { comp.set(m, id); stack.push(m); }
  }
  if (size > bestSize) { bestSize = size; best = id; }
}
const keptEdges = edges.filter(([ak, bk]) => comp.get(ak) === best && comp.get(bk) === best);
log(`Largest component: ${bestSize} nodes, ${keptEdges.length} edges (dropped ${edges.length - keptEdges.length} edges)`);

// ---- 7. emit COMPACT indexed graph -----------------------------------------
// The runtime (Supabase Edge Function: 256 MB / 2 s CPU) cannot afford
// geojson-path-finder's topology compaction (~440 MB heap, ~2.2 s). Instead we
// ship a compact { nodes:[[lng,lat],...], edges:[[ai,bi,weightNM],...] } graph and
// run a lightweight Dijkstra at request time (~36 MB heap, ~40 ms build, ~8 ms/route).
const nodeIdx = new Map();
const graphNodes = [];
function nodeId(c) {
  const k = coordKey(c[0], c[1]);
  let i = nodeIdx.get(k);
  if (i === undefined) { i = graphNodes.length; graphNodes.push(c); nodeIdx.set(k, i); }
  return i;
}
const cEdges = keptEdges.map(([, , a, b]) => {
  const w = haversineNM(a[0], a[1], b[0], b[1]);
  return [nodeId(a), nodeId(b), Math.round(w * 1000) / 1000];
});
const compact = { nodes: graphNodes, edges: cEdges };

// ---- 8. self-check: run the SAME Dijkstra the edge function will use ---------
log("Self-check: routing sample pairs with the runtime Dijkstra…");
const { route, nearestIndex } = makeRouter(graphNodes, cEdges);
let failed = 0;
for (const chk of region.selfCheck || []) {
  const s = nearestIndex(chk.from[0], chk.from[1]);
  const d = nearestIndex(chk.to[0], chk.to[1]);
  const r = route(s, d);
  const ok = r && r.path.length > 1;
  log(`  ${ok ? "OK " : "FAIL"} ${chk.note} — ${ok ? r.path.length + " pts, " + r.distNM.toFixed(1) + " NM" : "no route"}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Self-check failed for ${failed} pair(s). Not writing output. Tune buffer/connectivity for "${regionKey}".`);
  process.exit(1);
}

// ---- 9. write outputs -------------------------------------------------------
fs.mkdirSync(OUT_DIR, { recursive: true });
const graphJson = JSON.stringify(compact);
const version = crypto.createHash("sha256").update(graphJson).digest("hex").slice(0, 12);

const p = path.join(OUT_DIR, `${regionKey}.graph.json`);
fs.writeFileSync(p, graphJson);
fs.writeFileSync(p + ".gz", zlib.gzipSync(graphJson, { level: 9 }));
const gGz = fs.statSync(p + ".gz").size;

const meta = {
  region: regionKey,
  label: region.label,
  bbox: region.bbox,
  version,
  build: { gridNM, coastBufferNM, edgeSampleNM, coordDecimals, connectivity: 8 },
  nodes: graphNodes.length,
  edges: cEdges.length,
  bytes: { graphRaw: graphJson.length, graphGz: gGz },
  generatedFrom: "naturalearth_10m_land",
};
fs.writeFileSync(path.join(OUT_DIR, `${regionKey}.meta.json`), JSON.stringify(meta, null, 2));

log(`DONE "${regionKey}" v${version}`);
log(`  nodes=${meta.nodes} edges=${meta.edges}`);
log(`  graph: ${(graphJson.length / 1e6).toFixed(1)} MB raw / ${(gGz / 1e6).toFixed(2)} MB gz`);
log(`  -> ${path.relative(REPO, OUT_DIR)}/${regionKey}.graph.json(.gz)`);
