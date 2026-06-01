declare module "searoute-js" {
  type Position = [number, number];

  interface PointFeature {
    type: "Feature";
    geometry: { type: "Point"; coordinates: Position };
    properties?: Record<string, unknown>;
  }

  interface LineStringFeature {
    type: "Feature";
    geometry: { type: "LineString"; coordinates: Position[] };
    properties: { length: number; units: string; [k: string]: unknown };
  }

  type SearouteUnits = "kilometers" | "miles" | "nauticalmiles" | "degrees" | "radians";

  /**
   * Computes the shortest sea route between two GeoJSON Point features.
   * Coordinates are [longitude, latitude]. Returns a LineString feature whose
   * `properties.length` is expressed in `units` (default nautical miles).
   * Designed for route visualisation — not for actual maritime navigation.
   */
  export default function searoute(
    origin: PointFeature,
    destination: PointFeature,
    units?: SearouteUnits
  ): LineStringFeature;
}
