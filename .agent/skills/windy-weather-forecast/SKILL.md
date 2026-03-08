---
name: windy-weather-forecast
description: >
  Integrates the Windy Point Forecast API (https://api.windy.com/api/point-forecast/v2)
  to fetch and display nautical weather forecasts for mariners, sailors, and marina operators.
  Use this skill whenever the user asks about:
  - Weather conditions for a specific marina, port, or anchorage
  - Wind speed/direction, wave height, sea conditions
  - Marine weather forecast for a sailing route or departure
  - What the weather will be like for mooring or anchoring
  - Tide and sea state information for sailors
  - Adding a weather widget or forecast component to the Mooring Booking app
  - Fetching live or forecast weather data from Windy
  Always use this skill when the topic is marine/nautical weather, even if the user doesn't
  explicitly mention "Windy" or "API" — context words like "vjetar", "valovi", "more", "prognoza",
  "mornar", "brod", "sidro", "luka" or "marina" are strong triggers.
---

# Windy Point Forecast — Nautical Weather Skill

This skill enables fetching and displaying marine weather forecasts from the Windy API,
specifically optimised for mariners and marina operators in the Mooring Booking app.

## Overview

The Windy Point Forecast API returns time-series weather data for a given lat/lon position.
We use it to show sailors everything they need: wind, gusts, waves, pressure, visibility, and precipitation.

**API Endpoint:** `POST https://api.windy.com/api/point-forecast/v2`  
**Auth:** API key via `key` field in the request body.  
**Env variable:** `VITE_WINDY_API_KEY` (in `.env`)

Read the full parameter reference before implementing: [`references/windy-parameters.md`](references/windy-parameters.md)

---

## Nautical Parameters to Always Request

These are the parameters a mariner needs to see. Request all of them by default:

```json
{
  "parameters": [
    "wind",        // Wind speed (u/v components → convert to knots + bearing)
    "windGust",    // Wind gust speed
    "waves",       // Significant wave height
    "wavePeriod",  // Wave period (swell period in seconds)
    "waveDirection", // Wave direction (degrees)
    "swell1",      // Primary swell height
    "swell1Direction", // Primary swell direction
    "swell1Period",    // Primary swell period
    "pressure",    // Atmospheric pressure (hPa) — for storm detection
    "temp",        // Air temperature
    "dewpoint",    // Dewpoint — used for fog estimation
    "precip",      // Precipitation (rain/snow)
    "ptype",       // Precipitation type
    "visibility",  // Visibility in meters
    "cape"         // CAPE — convective energy, indicates thunderstorm risk
  ],
  "levels": ["surface"],
  "model": "gfs"   // Use GFS for global coverage; IconEU for Europe (higher res)
}
```

> **Model selection:** Use `iconEu` for Adriatic/Mediterranean (higher resolution, ~7km).
> Fall back to `gfs` if `iconEu` doesn't cover the requested location.

---

## How to Display Data for Mariners

When building a UI component (React/TSX), always show these sections:

### 1. Current Conditions (next forecast slot)
| Label | Parameter | Display Format |
|---|---|---|
| 💨 Wind | `wind-surface` (u/v → speed+dir) | e.g. `14 kn NNE` |
| 🌬️ Gusts | `gust-surface` | e.g. `20 kn` |
| 🌊 Wave height | `waves-surface` | e.g. `1.2 m` |
| 🌊 Wave period | `wavePeriod-surface` | e.g. `6 s` |
| 🧭 Wave dir | `waveDirection-surface` | e.g. `210°` |
| ☁️ Pressure | `pressure-surface` | e.g. `1013 hPa` |
| 🌡️ Air temp | `temp-surface` | e.g. `18 °C` |
| 🌧️ Precip | `precip-surface` | e.g. `0 mm` |
| 👁️ Visibility | `visibility-surface` | e.g. `> 10 km` |

### 2. 48h Forecast Timeline
Show a horizontal scrollable timeline with 3h intervals. For each slot, show:
- Time (local)
- Wind speed + direction icon (arrow)
- Wave height
- Precipitation icon

### 3. Safety Alerts
Automatically generate alerts if:
- Wind gust > 25 kn → ⚠️ Strong gust warning
- Wave height > 2 m → ⚠️ Rough sea warning
- CAPE > 1000 J/kg → ⛈️ Thunderstorm risk
- Visibility < 1000 m → 🌫️ Fog warning
- Pressure drop > 5 hPa in 3h → ⚠️ Rapid pressure fall (storm approaching)

---

## Implementation Pattern

### Fetching Data (TypeScript utility)

```typescript
// src/lib/windy.ts
export interface WindyForecastRequest {
  lat: number;
  lon: number;
  model?: 'gfs' | 'iconEu';
}

export async function fetchNauticalForecast(req: WindyForecastRequest) {
  const apiKey = import.meta.env.VITE_WINDY_API_KEY;
  
  const body = {
    lat: req.lat,
    lon: req.lon,
    model: req.model ?? 'iconEu',
    parameters: [
      'wind', 'windGust', 'waves', 'wavePeriod', 'waveDirection',
      'swell1', 'swell1Direction', 'swell1Period',
      'pressure', 'temp', 'dewpoint', 'precip', 'ptype', 'cape'
    ],
    levels: ['surface'],
    key: apiKey,
  };

  const res = await fetch('https://api.windy.com/api/point-forecast/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Windy API error: ${res.status}`);
  return res.json();
}
```

### Wind u/v → Speed + Direction

```typescript
// Convert u/v wind components to knots and bearing
export function windComponents(u: number, v: number) {
  const speedMs = Math.sqrt(u * u + v * v);
  const speedKn = speedMs * 1.944; // m/s → knots
  const dirDeg = (270 - Math.atan2(v, u) * (180 / Math.PI)) % 360;
  return { speedKn: Math.round(speedKn), dirDeg: Math.round(dirDeg) };
}

export function bearingToCardinal(deg: number): string {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE',
                 'S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}
```

### .env Setup

Add the following to `.env` (and `.env.example`):
```
VITE_WINDY_API_KEY=your_windy_api_key_here
```

Get a key at: https://api.windy.com/keys (Point Forecast API section)

---

## Integration in Mooring Booking App

When adding weather to a marina detail page or booking confirmation:

1. Extract marina `lat`/`lng` from the existing marina data (already in Supabase).
2. Call `fetchNauticalForecast({ lat, lon: lng, model: 'iconEu' })` on component mount.
3. Parse timestamps: `new Date(ts[i])` → local time.
4. Map `wind-surface` u/v arrays through `windComponents()`.
5. Show the **Current Conditions** card and **48h Timeline** and **Safety Alerts** sections.

See [`references/windy-parameters.md`](references/windy-parameters.md) for the full list of
available parameters, their units, and which models support them.

---

## Beaufort Scale Reference (for UI labels)

| Beaufort | Knots | Description |
|---|---|---|
| 0 | < 1 | Calm |
| 1–3 | 1–10 | Light breeze |
| 4–5 | 11–21 | Moderate / Fresh breeze |
| 6 | 22–27 | Strong breeze |
| 7 | 28–33 | Near gale ⚠️ |
| 8+ | 34+ | Gale / Storm 🚫 |

Use Beaufort number to color-code the wind display (green → yellow → orange → red).
