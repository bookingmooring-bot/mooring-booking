// Regional sea-routing graphs. Each region is built independently into its own
// marnet-style GeoJSON graph; the sea-route edge function picks the region whose
// bbox contains the route and loads only that graph (keeps each graph small
// enough for an Edge Function). Bbox = [minLng, minLat, maxLng, maxLat].
//
// Start with the Adriatic (most moorings, hardest island channels = best test),
// then add the other Mediterranean regions one by one with the same script.
export const REGIONS = {
  adriatic: {
    label: "Adriatic",
    bbox: [12.0, 39.5, 20.0, 46.0],
    // Known open-water pairs used for the build-time self-check (must route,
    // and the straight line between them crosses islands/land).
    selfCheck: [
      { from: [16.44, 43.51], to: [16.45, 43.17], note: "Split -> Hvar (around islands)" },
      { from: [13.85, 44.87], to: [15.23, 44.12], note: "Pula -> Zadar (down the coast)" },
      { from: [18.09, 42.65], to: [17.19, 43.17], note: "Dubrovnik -> Korcula" },
    ],
  },
  aegean: {
    label: "Aegean",
    bbox: [22.5, 34.5, 28.5, 41.0],
    gridNM: 1.5, // many islands, but trim graph size for upload/runtime limits
    selfCheck: [
      { from: [23.60, 37.90], to: [25.30, 37.45], note: "Piraeus -> Mykonos (Cyclades)" },
      { from: [28.10, 36.20], to: [27.10, 36.85], note: "Rhodes -> Kos (Dodecanese)" },
      { from: [25.10, 37.05], to: [24.90, 37.40], note: "Paros -> Syros" },
    ],
  },
  ionian: {
    label: "Ionian",
    bbox: [14.5, 35.5, 22.0, 40.5],
    gridNM: 1.5,
    selfCheck: [
      { from: [19.85, 39.60], to: [20.60, 38.90], note: "Corfu -> Lefkada" },
      { from: [20.50, 38.20], to: [20.85, 37.85], note: "Kefalonia -> Zakynthos" },
      { from: [15.55, 38.20], to: [17.20, 39.00], note: "Sicily (Ionian) -> Crotone" },
    ],
  },
  tyrrhenian: {
    label: "Tyrrhenian",
    bbox: [8.0, 37.0, 16.5, 44.5],
    gridNM: 2, // open sea with large islands (Sardinia, Corsica, Sicily)
    selfCheck: [
      { from: [14.10, 40.70], to: [13.40, 38.30], note: "Naples -> Palermo" },
      { from: [11.60, 42.00], to: [9.70, 40.95], note: "Civitavecchia -> Olbia (Sardinia)" },
      { from: [9.30, 41.30], to: [9.50, 41.10], note: "Bonifacio strait -> N Sardinia" },
    ],
  },
  westmed: {
    label: "West Med",
    bbox: [-1.0, 36.0, 9.5, 44.5],
    gridNM: 2, // open sea with large islands (Balearics, Corsica/Sardinia)
    selfCheck: [
      { from: [2.30, 41.30], to: [2.60, 39.65], note: "Barcelona -> Palma (Mallorca)" },
      { from: [1.50, 38.90], to: [-0.20, 39.40], note: "Ibiza -> Valencia" },
      { from: [5.40, 43.20], to: [7.20, 43.60], note: "Marseille -> Nice (Riviera)" },
    ],
  },
};

// Build parameters (pragmatic first pass; tune per region later).
export const BUILD = {
  gridNM: 1, // grid spacing in nautical miles
  coastBufferNM: 0.15, // keep-away margin around land so edges don't graze rocks
  edgeSampleNM: 0.2, // sample spacing when testing an edge for land crossing
  coordDecimals: 5, // path-finder keys nodes by coord rounded to 1e-5
};
