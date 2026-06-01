// Faza 2: precise, land-avoiding sea route — gated to users who have a paid/booked
// the specific mooring. Computes the shortest water path over a self-hosted regional
// graph (geojson-path-finder, same lib searoute-js uses) and caches the result.
// Non-entitled or out-of-area requests get a non-200 so the client falls back to the
// Faza 1 approximate route.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { makeRouter, haversineNM, type Router } from './router.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ---- CORS -------------------------------------------------------------------
const ALLOWED_ORIGINS = new Set([
  'https://mooring-booking.com', 'https://www.mooring-booking.com',
  'https://mooringbooking.com', 'https://www.mooringbooking.com',
  'https://ai-captain.app', 'https://www.ai-captain.app',
  'http://localhost:8080', 'http://localhost:5173',
]);
function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.mooring-booking.com';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}
const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });

// ---- regional graphs (loaded lazily, cached per warm instance) --------------
interface RegionMeta {
  region: string; label: string; bbox: [number, number, number, number]; version: string;
}
interface LoadedRegion {
  meta: RegionMeta;
  router: Router;
}

// Graphs live in the sea_route_graph table (not bundled as static files), so the
// function is pure code and deployable via the Management API; adding a region is
// just an INSERT. Metas are cached per warm instance; full graphs lazy-loaded.
let regionMetas: RegionMeta[] | null = null;
const loaded = new Map<string, LoadedRegion | null>();

function inBbox(lng: number, lat: number, b: [number, number, number, number]) {
  return lng >= b[0] && lng <= b[2] && lat >= b[1] && lat <= b[3];
}

async function getRegionMetas(): Promise<RegionMeta[]> {
  if (regionMetas) return regionMetas;
  const { data, error } = await supabase
    .from('sea_route_graph')
    .select('region,label,bbox,version');
  if (error) { console.error('sea-route: meta query failed:', error.message); return []; }
  regionMetas = (data ?? []).map((r: any) => ({
    region: r.region, label: r.label, bbox: r.bbox as [number, number, number, number], version: r.version,
  }));
  return regionMetas;
}

const bboxArea = (b: [number, number, number, number]) => (b[2] - b[0]) * (b[3] - b[1]);

// Pick the region whose bbox contains BOTH endpoints (route must stay in one
// graph). Region bboxes overlap at their seams, so prefer the SMALLEST matching
// bbox — that's the tightest, most-local graph for the area.
async function pickRegion(o: { lat: number; lng: number }, d: { lat: number; lng: number }) {
  const metas = await getRegionMetas();
  let best: RegionMeta | null = null;
  for (const m of metas) {
    if (inBbox(o.lng, o.lat, m.bbox) && inBbox(d.lng, d.lat, m.bbox)) {
      if (!best || bboxArea(m.bbox) < bboxArea(best.bbox)) best = m;
    }
  }
  return best;
}

async function inflateGzB64(b64: string): Promise<any> {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}

async function loadRegion(meta: RegionMeta): Promise<LoadedRegion | null> {
  if (loaded.has(meta.region)) return loaded.get(meta.region)!;
  try {
    const { data, error } = await supabase
      .from('sea_route_graph').select('graph_gz_b64').eq('region', meta.region).single();
    if (error || !data?.graph_gz_b64) throw new Error(error?.message ?? 'no graph row');
    const graph = await inflateGzB64(data.graph_gz_b64); // { nodes, edges }
    const router = makeRouter(graph.nodes, graph.edges); // cheap CSR build, once per warm instance
    const lr: LoadedRegion = { meta, router };
    loaded.set(meta.region, lr);
    return lr;
  } catch (e) {
    console.error(`sea-route: failed to load region ${meta.region}:`, String(e));
    loaded.set(meta.region, null);
    return null;
  }
}

// Max distance the user may be from the nearest water node before we give up
// (keeps us from snapping across a peninsula). ~5 NM.
const MAX_SNAP_NM = 5;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });

  try {
    // 1. Auth — must be a logged-in user.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(req, 401, { error: 'unauthorized' });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !user) return json(req, 401, { error: 'unauthorized' });

    // 2. Validate body.
    const body = await req.json().catch(() => null);
    const mooringId = body?.mooringId;
    const from = body?.from;
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(mooringId ?? '') ||
        !Number.isFinite(from?.lat) || !Number.isFinite(from?.lng) ||
        Math.abs(from.lat) > 90 || Math.abs(from.lng) > 180) {
      return json(req, 400, { error: 'bad_request' });
    }

    // 3. Booking gate (service-role bypasses RLS).
    const { data: allowed, error: gateErr } = await supabase.rpc('has_paid_booking', {
      p_user: user.id, p_mooring: mooringId,
    });
    if (gateErr) { console.error('sea-route gate error:', gateErr.message); return json(req, 500, { error: 'gate_failed' }); }
    if (!allowed) return json(req, 403, { precise: false, reason: 'not_booked' });

    // 4. Mooring coords (the destination is never trusted from the client).
    const { data: mooring, error: mErr } = await supabase
      .from('moorings').select('lat,lng').eq('id', mooringId).single();
    if (mErr || !mooring || !Number.isFinite(mooring.lat) || !Number.isFinite(mooring.lng)) {
      return json(req, 404, { precise: false, reason: 'mooring_missing' });
    }
    const dest = { lat: mooring.lat as number, lng: mooring.lng as number };

    // 5. Region select — both endpoints must fall inside one regional graph.
    const meta = await pickRegion(from, dest);
    if (!meta) return json(req, 422, { precise: false, reason: 'out_of_area' });

    // 6. Cache read.
    const originKey = `${from.lat.toFixed(3)},${from.lng.toFixed(3)}`;
    {
      const { data: hit } = await supabase
        .from('route_cache')
        .select('positions,length_nm')
        .eq('mooring_id', mooringId).eq('origin_key', originKey).eq('graph_version', meta.version)
        .maybeSingle();
      if (hit) {
        supabase.from('route_cache')
          .update({ last_used_at: new Date().toISOString() })
          .eq('mooring_id', mooringId).eq('origin_key', originKey).eq('graph_version', meta.version)
          .then(() => {}); // best-effort touch
        return json(req, 200, { precise: true, positions: hit.positions, lengthNM: hit.length_nm, cached: true });
      }
    }

    // 7. Load region + snap + route.
    const region = await loadRegion(meta);
    if (!region) return json(req, 503, { precise: false, reason: 'graph_unavailable' });

    const sIdx = region.router.nearestIndex(from.lng, from.lat);
    const dIdx = region.router.nearestIndex(dest.lng, dest.lat);
    const res = region.router.route(sIdx, dIdx);
    if (!res || res.path.length < 2) {
      return json(req, 200, { precise: false, reason: 'no_route' });
    }
    // Guard: don't snap across a peninsula — origin must be near its snapped node.
    const snapNM = haversineNM(from.lng, from.lat, res.path[0][0], res.path[0][1]);
    if (snapNM > MAX_SNAP_NM) {
      return json(req, 422, { precise: false, reason: 'out_of_area' });
    }

    // 8. Assemble polyline in Leaflet [lat,lng], with true endpoints bookending the path.
    const positions: [number, number][] = [
      [from.lat, from.lng],
      ...res.path.map(([lng, lat]) => [lat, lng] as [number, number]),
      [dest.lat, dest.lng],
    ];
    let lengthNM = 0;
    for (let i = 1; i < positions.length; i++) {
      lengthNM += haversineNM(positions[i - 1][1], positions[i - 1][0], positions[i][1], positions[i][0]);
    }
    lengthNM = Math.round(lengthNM * 100) / 100;

    // 9. Cache write (best-effort).
    supabase.from('route_cache').upsert({
      mooring_id: mooringId, origin_key: originKey, graph_version: meta.version,
      positions, length_nm: lengthNM,
    }, { onConflict: 'mooring_id,origin_key,graph_version' }).then(({ error }) => {
      if (error) console.error('sea-route cache write:', error.message);
    });

    return json(req, 200, { precise: true, positions, lengthNM, cached: false });
  } catch (err) {
    console.error('sea-route error:', String(err));
    return json(req, 500, { error: 'internal' });
  }
});
