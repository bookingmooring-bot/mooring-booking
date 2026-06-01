import { calculateDistanceNM } from "@/lib/navigation";
import { supabase } from "@/lib/supabase";

export interface SeaRoute {
  /** Polyline points in Leaflet [lat, lng] order. */
  positions: [number, number][];
  /** Route length following the sea, in nautical miles. */
  lengthNM: number;
}

/** Outcome of asking the server for a precise (post-booking) route. */
export type PreciseRouteResult =
  | { kind: "precise"; route: SeaRoute; cached: boolean }
  | { kind: "upsell" } // entitled gate failed — show "book to unlock" hint, then approximate
  | { kind: "none" }; // any other failure — silently fall back to approximate

/** Below this straight-line distance a routed path adds nothing — use a straight line instead. */
const MIN_ROUTE_NM = 0.3;

/**
 * Approximate sea route that follows water and avoids land, computed entirely
 * client-side with `searoute-js` (lazy-loaded so its embedded network data stays
 * out of the main bundle). Returns null when routing is unnecessary or fails, so
 * callers can fall back to a straight line.
 *
 * Inputs/outputs use Leaflet [lat, lng] order; searoute-js uses [lng, lat] so we
 * flip on the way in and out.
 */
export async function computeSeaRoute(
  from: [number, number],
  to: [number, number]
): Promise<SeaRoute | null> {
  if (calculateDistanceNM(from, to) < MIN_ROUTE_NM) return null;

  try {
    const { default: searoute } = await import("searoute-js");

    const origin = {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [from[1], from[0]] as [number, number] },
      properties: {},
    };
    const destination = {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [to[1], to[0]] as [number, number] },
      properties: {},
    };

    const route = searoute(origin, destination);
    const coords = route?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;

    // Flip [lng, lat] -> [lat, lng] for Leaflet.
    const positions = coords.map(([lng, lat]) => [lat, lng] as [number, number]);
    const lengthNM =
      typeof route.properties?.length === "number"
        ? route.properties.length
        : calculateDistanceNM(from, to);

    return { positions, lengthNM };
  } catch {
    return null;
  }
}

/**
 * Precise, land-aware sea route from the `sea-route` edge function. Server-gated:
 * only a user who has paid/booked this mooring gets a route. Returns:
 *  - { kind: 'precise' } when a route is computed (or cache hit),
 *  - { kind: 'upsell' } when the user has not booked this mooring (403),
 *  - { kind: 'none' } for any other case (logged out, out-of-area, no path, error)
 * so the caller can fall back to the approximate route. Never throws.
 */
export async function fetchPreciseSeaRoute(
  from: [number, number],
  mooringId: string
): Promise<PreciseRouteResult> {
  try {
    const { data, error } = await supabase.functions.invoke("sea-route", {
      body: { mooringId, from: { lat: from[0], lng: from[1] } },
    });

    // Non-2xx surfaces as FunctionsHttpError; inspect the JSON body for the gate.
    if (error) {
      const reason = await readInvokeReason(error);
      return reason === "not_booked" ? { kind: "upsell" } : { kind: "none" };
    }
    if (data?.precise === true && Array.isArray(data.positions) && data.positions.length > 1) {
      return {
        kind: "precise",
        route: { positions: data.positions, lengthNM: data.lengthNM },
        cached: data.cached === true,
      };
    }
    if (data?.reason === "not_booked") return { kind: "upsell" };
    return { kind: "none" };
  } catch {
    return { kind: "none" };
  }
}

/** Best-effort: pull the `reason` field out of a FunctionsHttpError response body. */
async function readInvokeReason(error: unknown): Promise<string | null> {
  try {
    const ctx = (error as { context?: Response })?.context;
    if (ctx && typeof ctx.json === "function") {
      const body = await ctx.clone().json();
      return body?.reason ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}
