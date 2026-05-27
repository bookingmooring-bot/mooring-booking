import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const BATCH_SIZE = 50;

// ── Region bounding boxes (coastal zones) ────────────────────────────────────

interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

const REGION_BBOX: Record<string, BBox> = {
  croatia:    { south: 42.3,  west: 13.4,  north: 45.85, east: 19.5 },
  italy:      { south: 36.6,  west: 6.6,   north: 47.1,  east: 18.6 },
  greece:     { south: 34.8,  west: 19.3,  north: 41.8,  east: 29.7 },
  montenegro: { south: 41.85, west: 18.4,  north: 42.6,  east: 20.4 },
  slovenia:   { south: 45.42, west: 13.3,  north: 45.6,  east: 13.9 },
  albania:    { south: 39.6,  west: 19.2,  north: 42.1,  east: 21.1 },
  turkey:     { south: 36.0,  west: 25.5,  north: 42.1,  east: 44.8 },
  spain:      { south: 36.0,  west: -9.3,  north: 43.8,  east: 4.3 },
  france:     { south: 42.3,  west: -1.8,  north: 51.1,  east: 9.6 },
  portugal:   { south: 36.9,  west: -9.5,  north: 42.2,  east: -6.2 },
  malta:      { south: 35.8,  west: 14.18, north: 36.1,  east: 14.6 },
  cyprus:     { south: 34.5,  west: 32.2,  north: 35.7,  east: 34.6 },
  tunisia:    { south: 30.2,  west: 7.5,   north: 37.4,  east: 11.6 },
};

const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  croatia:    { name: "Croatia",    flag: "\u{1F1ED}\u{1F1F7}" },
  italy:      { name: "Italy",      flag: "\u{1F1EE}\u{1F1F9}" },
  greece:     { name: "Greece",     flag: "\u{1F1EC}\u{1F1F7}" },
  montenegro: { name: "Montenegro", flag: "\u{1F1F2}\u{1F1EA}" },
  slovenia:   { name: "Slovenia",   flag: "\u{1F1F8}\u{1F1EE}" },
  albania:    { name: "Albania",    flag: "\u{1F1E6}\u{1F1F1}" },
  turkey:     { name: "Turkey",     flag: "\u{1F1F9}\u{1F1F7}" },
  spain:      { name: "Spain",      flag: "\u{1F1EA}\u{1F1F8}" },
  france:     { name: "France",     flag: "\u{1F1EB}\u{1F1F7}" },
  portugal:   { name: "Portugal",   flag: "\u{1F1F5}\u{1F1F9}" },
  malta:      { name: "Malta",      flag: "\u{1F1F2}\u{1F1F9}" },
  cyprus:     { name: "Cyprus",     flag: "\u{1F1E8}\u{1F1FE}" },
  tunisia:    { name: "Tunisia",    flag: "\u{1F1F9}\u{1F1F3}" },
};

const ALL_FEATURE_TYPES = ["marina", "anchorage", "harbour", "pier", "bay"];

// ── Overpass query builder ───────────────────────────────────────────────────

function buildOverpassQuery(bbox: BBox, featureTypes: string[]): string {
  const { south, west, north, east } = bbox;
  const bboxStr = `${south},${west},${north},${east}`;
  const parts: string[] = [];

  for (const ft of featureTypes) {
    switch (ft) {
      case "marina":
        parts.push(`node["leisure"="marina"](${bboxStr});`);
        parts.push(`way["leisure"="marina"](${bboxStr});`);
        break;
      case "anchorage":
        parts.push(`node["seamark:type"="anchorage"](${bboxStr});`);
        parts.push(`way["seamark:type"="anchorage"](${bboxStr});`);
        break;
      case "harbour":
        parts.push(`node["seamark:type"="harbour"](${bboxStr});`);
        parts.push(`way["seamark:type"="harbour"](${bboxStr});`);
        parts.push(`node["harbour"="yes"](${bboxStr});`);
        break;
      case "pier":
        parts.push(`node["man_made"="pier"](${bboxStr});`);
        parts.push(`way["man_made"="pier"](${bboxStr});`);
        break;
      case "bay":
        parts.push(`node["natural"="bay"](${bboxStr});`);
        parts.push(`way["natural"="bay"](${bboxStr});`);
        break;
    }
  }

  return `[out:json][timeout:120];(${parts.join("")});out center tags;`;
}

// ── OSM tag → moorings record mapper ─────────────────────────────────────────

interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function extractAmenities(tags: Record<string, string>): string[] {
  const amenities: string[] = [];
  if (tags["fuel:diesel"] === "yes" || tags["amenity"] === "fuel" || tags["fuel"] === "yes") amenities.push("fuel");
  if (tags["drinking_water"] === "yes" || tags["water"] === "yes") amenities.push("water");
  if (tags["power_supply"] === "yes" || tags["electricity"] === "yes") amenities.push("electricity");
  if (tags["internet_access"] === "yes" || tags["internet_access"] === "wifi" || tags["wifi"] === "yes") amenities.push("wifi");
  if (tags["shower"] === "yes") amenities.push("shower");
  if (tags["toilets"] === "yes" || tags["toilet"] === "yes") amenities.push("toilet");
  if (tags["laundry"] === "yes") amenities.push("laundry");
  if (tags["restaurant"] === "yes" || tags["amenity"] === "restaurant") amenities.push("restaurant");
  if (tags["crane"] === "yes" || tags["seamark:harbour:crane"] === "yes") amenities.push("crane");
  return amenities;
}

function osmToMooring(
  el: OsmElement,
  region: string
): Record<string, unknown> | null {
  const tags = el.tags ?? {};
  const name = tags["name"] || tags["seamark:name"] || tags["name:en"];
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  const countryInfo = COUNTRY_MAP[region] ?? { name: region, flag: "" };
  const amenities = extractAmenities(tags);

  const capacity = parseInt(tags["capacity"] ?? "0", 10) || null;
  const hasWebsite = !!(tags["website"] || tags["contact:website"]);
  const hasPhone = !!(tags["phone"] || tags["contact:phone"]);

  const isRich = (hasWebsite || hasPhone) && amenities.length >= 1;
  const mooringLayer = isRich ? "concierge" : "explore";

  const maxLength = parseFloat(tags["seamark:harbour:max_length"] ?? "") || null;
  const maxDraft = parseFloat(tags["seamark:harbour:max_draft"] ?? "") || null;

  return {
    name,
    location: tags["addr:city"] || tags["addr:place"] || tags["is_in"] || countryInfo.name,
    country: countryInfo.name,
    country_flag: countryInfo.flag,
    address: [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]].filter(Boolean).join(", ") || null,
    lat,
    lng: lon,
    source_url: tags["website"] || tags["contact:website"] || null,
    contact_phone: tags["phone"] || tags["contact:phone"] || null,
    contact_email: tags["email"] || tags["contact:email"] || null,
    vhf_channel: tags["vhf_channel"] || tags["seamark:calling-in_point:channel"] || tags["communication:vhf"] || null,
    operating_hours: tags["opening_hours"] || null,
    mooring_units: capacity,
    max_boat_length: maxLength,
    max_draft: maxDraft,
    amenities,
    price_per_night: 0,
    mooring_layer: mooringLayer,
    data_source: "osm",
    osm_id: el.id,
    status: "active",
    owner_id: null,
    is_premium_listing: false,
    is_verified_partner: false,
    rating: 0,
    review_count: 0,
  };
}

// ── Deduplication ────────────────────────────────────────────────────────────

function normName(n: string): string {
  return (n || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

interface ExistingMooring {
  id: string;
  name: string;
  lat: number;
  lng: number;
  data_source: string;
  osm_id: number | null;
}

function findDuplicate(
  record: Record<string, unknown>,
  existing: ExistingMooring[]
): { dup: ExistingMooring; canUpdate: boolean } | null {
  const rName = normName(record.name as string);
  const rLat = record.lat as number;
  const rLng = record.lng as number;
  const rOsmId = record.osm_id as number;

  for (const ex of existing) {
    if (ex.osm_id != null && ex.osm_id === rOsmId) {
      return { dup: ex, canUpdate: ex.data_source === "osm" };
    }
    const exName = normName(ex.name);
    if (rName === exName) {
      return { dup: ex, canUpdate: ex.data_source === "osm" };
    }
    if (
      Math.abs(ex.lat - rLat) < 0.005 &&
      Math.abs(ex.lng - rLng) < 0.005
    ) {
      return { dup: ex, canUpdate: ex.data_source === "osm" };
    }
  }
  return null;
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    const region: string = (body.region ?? "croatia").toLowerCase();
    const customBbox: BBox | undefined = body.bbox;
    const featureTypes: string[] = body.featureTypes ?? ALL_FEATURE_TYPES;
    const dryRun: boolean = body.dryRun === true;
    const triggeredBy: string = body.triggeredBy ?? "admin_manual";

    const bbox = customBbox ?? REGION_BBOX[region];
    if (!bbox) {
      return new Response(
        JSON.stringify({ error: `Unknown region: ${region}. Use one of: ${Object.keys(REGION_BBOX).join(", ")}` }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Create import log entry
    let logId: string | null = null;
    if (!dryRun) {
      const { data: logRow } = await supabase
        .from("osm_import_log")
        .insert({
          region,
          bbox,
          feature_types: featureTypes,
          triggered_by: triggeredBy,
          status: "running",
        })
        .select("id")
        .single();
      logId = logRow?.id ?? null;
    }

    // Query Overpass API
    const query = buildOverpassQuery(bbox, featureTypes);
    let elements: OsmElement[] = [];

    let retries = 0;
    while (retries < 3) {
      const overpassRes = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "MooringBooking/1.0" },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (overpassRes.status === 429) {
        retries++;
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries)));
        continue;
      }

      if (!overpassRes.ok) {
        const errText = await overpassRes.text();
        throw new Error(`Overpass API error ${overpassRes.status}: ${errText.slice(0, 500)}`);
      }

      const json = await overpassRes.json();
      elements = json.elements ?? [];
      break;
    }

    // Map OSM elements to mooring records
    const records: Record<string, unknown>[] = [];
    for (const el of elements) {
      const rec = osmToMooring(el, region);
      if (rec) records.push(rec);
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({
          dryRun: true,
          region,
          bbox,
          featureTypes,
          fetched: elements.length,
          mapped: records.length,
          sample: records.slice(0, 10),
        }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // Fetch existing moorings in bbox for dedup
    const { data: existingRaw } = await supabase
      .from("moorings")
      .select("id, name, lat, lng, data_source, osm_id")
      .gte("lat", bbox.south)
      .lte("lat", bbox.north)
      .gte("lng", bbox.west)
      .lte("lng", bbox.east);

    const existing: ExistingMooring[] = (existingRaw ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      lat: r.lat as number,
      lng: r.lng as number,
      data_source: r.data_source as string,
      osm_id: r.osm_id as number | null,
    }));

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const toInsert: Record<string, unknown>[] = [];
    const toUpdate: { id: string; data: Record<string, unknown> }[] = [];

    for (const rec of records) {
      const dup = findDuplicate(rec, existing);
      if (dup) {
        if (dup.canUpdate) {
          toUpdate.push({ id: dup.dup.id, data: rec });
        } else {
          skipped++;
        }
      } else {
        toInsert.push(rec);
      }
    }

    // Batch insert
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("moorings").insert(batch);
      if (error) {
        errorCount += batch.length;
        errors.push(`Insert batch ${i}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

    // Batch update
    for (const item of toUpdate) {
      const { error } = await supabase
        .from("moorings")
        .update(item.data)
        .eq("id", item.id);
      if (error) {
        errorCount++;
        errors.push(`Update ${item.id}: ${error.message}`);
      } else {
        updated++;
      }
    }

    // Update log
    if (logId) {
      await supabase
        .from("osm_import_log")
        .update({
          fetched_count: elements.length,
          inserted_count: inserted,
          updated_count: updated,
          skipped_count: skipped,
          error_count: errorCount,
          errors: errors.slice(0, 50),
          completed_at: new Date().toISOString(),
          status: errorCount > 0 && inserted === 0 ? "failed" : "completed",
        })
        .eq("id", logId);
    }

    return new Response(
      JSON.stringify({
        region,
        bbox,
        featureTypes,
        fetched: elements.length,
        mapped: records.length,
        inserted,
        updated,
        skipped,
        errors: errorCount,
        errorDetails: errors.slice(0, 10),
        logId,
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
