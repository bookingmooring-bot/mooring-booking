# Windy Point Forecast API — Full Parameter Reference

Source: https://api.windy.com/point-forecast/docs

## Endpoint

```
POST https://api.windy.com/api/point-forecast/v2
```

## Request Body

```json
{
  "lat": 43.508,
  "lon": 16.439,
  "model": "iconEu",
  "parameters": ["wind", "windGust", "waves", ...],
  "levels": ["surface"],
  "key": "YOUR_API_KEY"
}
```

---

## Available Models

| Model | Coverage | Resolution | Best for |
|---|---|---|---|
| `gfs` | Global | ~28 km | Ocean, open sea |
| `iconEu` | Europe + Adriatic | ~7 km | Adriatic, Med (recommended) |
| `arome` | France + surroundings | ~2.5 km | French coast |
| `gfsWave` | Global wave only | ~28 km | Wave-only queries |
| `namConus` | USA | ~12 km | US waters |

> **Adriatic recommendation:** Always prefer `iconEu` for the Adriatic Sea and Mediterranean.
> It updates every 3 hours and has higher resolution than GFS.

---

## Wind Parameters

| Parameter | Key in response | Unit | Notes |
|---|---|---|---|
| Wind U component | `wind_u-surface` | m/s | East component |
| Wind V component | `wind_v-surface` | m/s | North component |
| Wind Gust | `gust-surface` | m/s | Max gust |

> Wind `u` and `v` must be combined: `speed = √(u²+v²)`, then converted to knots (`× 1.944`).  
> Direction: `dir = (270 - atan2(v,u) * 180/π) % 360`

---

## Wave Parameters

| Parameter | Key in response | Unit | Notes |
|---|---|---|---|
| Significant wave height | `waves-surface` | m | Combined sea + swell |
| Wave period | `wavePeriod-surface` | s | Mean period |
| Wave direction | `waveDirection-surface` | ° | Direction FROM which waves come |
| Primary swell height | `swell1-surface` | m | — |
| Primary swell period | `swell1Period-surface` | s | — |
| Primary swell direction | `swell1Direction-surface` | ° | — |
| Secondary swell height | `swell2-surface` | m | (GFS only) |
| Secondary swell period | `swell2Period-surface` | s | (GFS only) |

> ⚠️ `waves`, `wavePeriod`, `waveDirection`, `swell1`, `swell2` are only available in
> `gfs` and `gfsWave` models. `iconEu` does NOT support wave parameters — for European
> waters you must mix: use `iconEu` for wind/temp/pressure and `gfsWave` for waves.

---

## Atmosphere Parameters

| Parameter | Key in response | Unit | Notes |
|---|---|---|---|
| Air temperature | `temp-surface` | K | Subtract 273.15 for °C |
| Dewpoint | `dewpoint-surface` | K | Fog estimation: temp - dewpoint < 2°C = fog risk |
| Relative humidity | `rh-surface` | % | — |
| Pressure (surface) | `pressure-surface` | Pa | Divide by 100 for hPa |
| Precipitation | `precip-surface` | mm/h | Accumulated per timestep |
| Precipitation type | `ptype-surface` | code | 0=none, 1=rain, 5=snow |
| Snow | `snowPrecip-surface` | mm/h | GFS/NAM only |
| Cloud cover | `lclouds-surface` | % | Low clouds |
| Cloud cover | `mclouds-surface` | % | Mid clouds |
| Cloud cover | `hclouds-surface` | % | High clouds |
| CAPE | `cape-surface` | J/kg | > 1000 = thunderstorm risk |
| Visibility | `visibility-surface` | m | < 1000 m = fog/low visibility |

---

## Response Format

```json
{
  "ts": [1700000000000, 1700010800000, ...],
  "units": {
    "wind_u-surface": "m*s-1",
    "temp-surface": "K",
    "pressure-surface": "Pa",
    ...
  },
  "wind_u-surface": [2.1, 3.4, ...],
  "wind_v-surface": [-1.2, -2.0, ...],
  "temp-surface": [291.5, 290.0, ...],
  ...
}
```

- `ts` — array of Unix timestamps in **milliseconds** (use `new Date(ts[i])`)
- Timestep: typically **3 hours** for most models
- All arrays have the same length as `ts`
- `null` = no data for that slot

---

## Useful Conversions

```typescript
// Kelvin → Celsius
const tempC = (K: number) => (K - 273.15).toFixed(1);

// Pa → hPa
const hPa = (Pa: number) => (Pa / 100).toFixed(0);

// m/s → knots
const knots = (ms: number) => (ms * 1.944).toFixed(1);

// m/s → km/h
const kmh = (ms: number) => (ms * 3.6).toFixed(0);

// meters visibility
const visLabel = (m: number) => m >= 10000 ? '> 10 km' : `${(m/1000).toFixed(1)} km`;
```

---

## Recommended Nautical Request (Adriatic/Mediterranean)

For wind and atmosphere use `iconEu`, for waves use `gfsWave` (two separate requests):

**Request 1 — Atmosphere (iconEu):**
```json
{
  "lat": 43.508, "lon": 16.439,
  "model": "iconEu",
  "parameters": ["wind", "windGust", "pressure", "temp", "dewpoint", "precip", "ptype", "cape"],
  "levels": ["surface"],
  "key": "YOUR_KEY"
}
```

**Request 2 — Waves (gfsWave):**
```json
{
  "lat": 43.508, "lon": 16.439,
  "model": "gfsWave",
  "parameters": ["waves", "wavePeriod", "waveDirection", "swell1", "swell1Period", "swell1Direction"],
  "levels": ["surface"],
  "key": "YOUR_KEY"
}
```

Merge both responses by aligning the `ts` arrays (they may have different timestep intervals).

---

## Rate Limits & Pricing

- Free tier: check https://api.windy.com/keys for current limits
- Requests are per unique lat/lon call
- Cache responses on the frontend (5–10 min TTL) to avoid hitting limits
