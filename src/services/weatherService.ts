// Nautical Weather Service
// Primary: Windy Point Forecast API (iconEu + gfsWave)
// Fallback: OpenWeatherMap API
// Last fallback: Realistic simulated Mediterranean weather

const WINDY_API_URL = 'https://api.windy.com/api/point-forecast/v2';

export interface NauticalWeather {
  windSpeed: number;      // knots
  windDirection: string;  // N, NE, E, etc.
  windDirDeg: number;     // degrees (0-360)
  windGust: number;       // knots
  waveHeight: number;     // meters (real measurement)
  wavePeriod: number;     // seconds
  waveDirection: number;  // degrees (direction FROM which waves come)
  swellHeight: number;    // meters (primary swell)
  swellPeriod: number;    // seconds
  swellDirection: number; // degrees
  visibility: number;     // kilometers
  temperature: number;    // celsius
  dewpoint: number;       // celsius (for fog estimation)
  condition: string;      // sunny, cloudy, rainy, stormy, foggy
  alerts: string[];       // weather warnings
  pressure: number;       // hPa
  humidity: number;       // %
  cape: number;           // J/kg (thunderstorm risk > 1000)
  description: string;    // human readable
  timestamp?: number;     // unix timestamp ms
  beaufort: number;       // Beaufort scale 0-12
  dataSource: 'windy' | 'openweather' | 'simulated';
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

/** m/s → knots */
const msToKnots = (ms: number): number => Math.round(ms * 1.94384);

/** Kelvin → Celsius */
const kelvinToCelsius = (k: number): number => Math.round((k - 273.15) * 10) / 10;

/** Pascal → hPa */
const paToHpa = (pa: number): number => Math.round(pa / 100);

/** Wind u/v components → speed (m/s) + direction (degrees) */
const windFromUV = (u: number, v: number): { speedMs: number; dirDeg: number } => ({
  speedMs: Math.sqrt(u * u + v * v),
  dirDeg: Math.round((270 - Math.atan2(v, u) * (180 / Math.PI) + 360) % 360),
});

/** Degrees → 16-point cardinal direction */
const degreesToCardinal = (deg: number): string => {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

/** Knots → Beaufort number */
const knotsToBeaufort = (kn: number): number => {
  if (kn < 1) return 0;
  if (kn < 4) return 1;
  if (kn < 7) return 2;
  if (kn < 11) return 3;
  if (kn < 17) return 4;
  if (kn < 22) return 5;
  if (kn < 28) return 6;
  if (kn < 34) return 7;
  if (kn < 41) return 8;
  if (kn < 48) return 9;
  if (kn < 56) return 10;
  if (kn < 64) return 11;
  return 12;
};

/** Convert OpenWeather condition ID → condition string */
const owmIdToCondition = (id: number): string => {
  if (id >= 200 && id < 300) return 'stormy';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 700 && id < 800) return 'foggy';
  if (id === 800) return 'sunny';
  if (id > 800) return 'cloudy';
  return 'unknown';
};

/** Derive condition from weather parameters */
const deriveCondition = (
  windKn: number,
  cape: number,
  precipMm: number,
  ptype: number,
  tempC: number,
  dewpointC: number,
): string => {
  if (cape > 1500 || windKn > 35) return 'stormy';
  if (ptype === 5 || tempC < 0) return 'snowy';
  if (precipMm > 2) return 'rainy';
  if (precipMm > 0.2) return 'drizzle';
  if (tempC - dewpointC < 2) return 'foggy'; // near saturation
  if (windKn > 15) return 'cloudy';
  return 'sunny';
};

/** Generate weather alerts from NauticalWeather values */
const generateAlerts = (w: Partial<NauticalWeather>): string[] => {
  const alerts: string[] = [];
  if (w.windGust && w.windGust > 40) alerts.push('🚨 Gale force gusts: Navigation dangerous, remain in port');
  else if (w.windGust && w.windGust > 25) alerts.push('⚠️ Strong gust warning: Secure vessel and loose items');
  if (w.windSpeed && w.windSpeed > 30) alerts.push('⚠️ Strong wind warning: Small craft advisory');
  if (w.waveHeight && w.waveHeight > 2.5) alerts.push('🌊 High waves: Not recommended for small craft');
  else if (w.waveHeight && w.waveHeight > 1.5) alerts.push('🌊 Moderate waves: Exercise caution');
  if (w.cape && w.cape > 1000) alerts.push('⛈️ Thunderstorm risk: Avoid open water');
  if (w.visibility && w.visibility < 1) alerts.push('🌫️ Fog warning: Reduce speed, use radar');
  return alerts;
};

/** Human-readable description */
const buildDescription = (condition: string, windDir: string, windSpeed: number): string => {
  const condLabels: Record<string, string> = {
    sunny: 'Clear skies', cloudy: 'Partly cloudy', stormy: 'Thunderstorms possible',
    foggy: 'Morning fog', rainy: 'Light rain', drizzle: 'Drizzle', snowy: 'Snow', unknown: 'Variable',
  };
  const base = condLabels[condition] ?? 'Variable conditions';
  if (windSpeed > 20) return `${base}, strong ${windDir} wind`;
  if (windSpeed > 10) return `${base}, moderate ${windDir} wind`;
  return `${base}, light winds`;
};

// ─── Get user location ────────────────────────────────────────────────────────

export const getUserLocation = (): Promise<{ lat: number; lng: number }> =>
  new Promise((resolve) => {
    const fallback = { lat: 43.5, lng: 16.4 }; // Split, Croatia — Adriatic default
    if (!navigator.geolocation) { resolve(fallback); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(fallback),
      { timeout: 5000, maximumAge: 300_000 },
    );
  });

// ─── Windy API ────────────────────────────────────────────────────────────────

interface WindyResponse {
  ts: number[];
  units: Record<string, string>;
  [key: string]: number[] | string[] | number | Record<string, string>;
}

/** Fetch a single Windy Point Forecast request */
const windyRequest = async (
  lat: number,
  lon: number,
  model: 'iconEu' | 'gfsWave' | 'gfs',
  parameters: string[],
  apiKey: string,
): Promise<WindyResponse> => {
  const res = await fetch(WINDY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon, model, parameters, levels: ['surface'], key: apiKey }),
  });
  if (!res.ok) throw new Error(`Windy API error ${res.status} (${model})`);
  return res.json();
};

/** Merge atmosphere + wave Windy responses into NauticalWeather[] */
const parseWindyResponses = (
  atmo: WindyResponse,
  wave: WindyResponse,
): NauticalWeather[] => {
  const ts = atmo.ts as number[];

  // Helper: safely get array or fill with zeros
  const arr = (resp: WindyResponse, key: string): number[] =>
    Array.isArray(resp[key]) ? (resp[key] as number[]) : ts.map(() => 0);

  const u = arr(atmo, 'wind_u-surface');
  const v = arr(atmo, 'wind_v-surface');
  const gust = arr(atmo, 'gust-surface');
  const temp = arr(atmo, 'temp-surface');
  const dew = arr(atmo, 'dewpoint-surface');
  const pres = arr(atmo, 'pressure-surface');
  const prec = arr(atmo, 'precip-surface');
  const pty = arr(atmo, 'ptype-surface');
  const cape = arr(atmo, 'cape-surface');

  // Wave data — gfsWave response keys use format: waves_height-surface, swell1_period-surface etc.
  const waveTs = wave.ts as number[];
  const wvH = arr(wave, 'waves_height-surface');
  const wvP = arr(wave, 'waves_period-surface');
  const wvD = arr(wave, 'waves_direction-surface');
  const swH = arr(wave, 'swell1_height-surface');
  const swP = arr(wave, 'swell1_period-surface');
  const swD = arr(wave, 'swell1_direction-surface');

  // Build a wave map keyed by closest timestamp
  const waveMap = new Map<number, { h: number; p: number; d: number; sh: number; sp: number; sd: number }>();
  waveTs.forEach((t, i) => {
    waveMap.set(t, { h: wvH[i] ?? 0, p: wvP[i] ?? 6, d: wvD[i] ?? 0, sh: swH[i] ?? 0, sp: swP[i] ?? 8, sd: swD[i] ?? 0 });
  });

  const findClosestWave = (t: number) => {
    let best = waveTs[0];
    let bestDiff = Infinity;
    waveTs.forEach((wt) => { const d = Math.abs(wt - t); if (d < bestDiff) { bestDiff = d; best = wt; } });
    return waveMap.get(best) ?? { h: 0, p: 6, d: 0, sh: 0, sp: 8, sd: 0 };
  };

  return ts.map((t, i) => {
    const { speedMs, dirDeg } = windFromUV(u[i] ?? 0, v[i] ?? 0);
    const speedKn = msToKnots(speedMs);
    const gustKn = msToKnots(gust[i] ?? speedMs);
    const windDir = degreesToCardinal(dirDeg);
    const tempC = kelvinToCelsius(temp[i] ?? 293);
    const dewC = kelvinToCelsius(dew[i] ?? 285);
    const hPa = paToHpa(pres[i] ?? 101300);
    const precipMm = prec[i] ?? 0;
    const ptypeVal = pty[i] ?? 0;
    const capeVal = cape[i] ?? 0;
    const condition = deriveCondition(speedKn, capeVal, precipMm, ptypeVal, tempC, dewC);
    const wv = findClosestWave(t);
    const humidity = Math.min(100, Math.max(0, Math.round(100 - (tempC - dewC) * 5)));

    const w: NauticalWeather = {
      windSpeed: speedKn,
      windDirection: windDir,
      windDirDeg: dirDeg,
      windGust: gustKn,
      waveHeight: Math.round((wv.h) * 10) / 10,
      wavePeriod: Math.round(wv.p),
      waveDirection: Math.round(wv.d),
      swellHeight: Math.round(wv.sh * 10) / 10,
      swellPeriod: Math.round(wv.sp),
      swellDirection: Math.round(wv.sd),
      visibility: 15, // Windy doesn't return visibility directly; estimate below
      temperature: tempC,
      dewpoint: dewC,
      condition,
      alerts: [],
      pressure: hPa,
      humidity,
      cape: Math.round(capeVal),
      description: buildDescription(condition, windDir, speedKn),
      timestamp: t,
      beaufort: knotsToBeaufort(speedKn),
      dataSource: 'windy',
    };

    // Fog/visibility estimate from dewpoint spread
    if (tempC - dewC < 1) w.visibility = 0.2;
    else if (tempC - dewC < 2) w.visibility = 1;
    else if (tempC - dewC < 4) w.visibility = 5;
    else w.visibility = 15;

    w.alerts = generateAlerts(w);
    return w;
  });
};

/** Fetch full nautical forecast from Windy (atmosphere + waves) */
const fetchWindyForecast = async (lat: number, lng: number): Promise<NauticalWeather[]> => {
  const apiKey = import.meta.env.VITE_WINDY_API_KEY;
  if (!apiKey) throw new Error('VITE_WINDY_API_KEY not set');

  const [atmo, wave] = await Promise.all([
    windyRequest(lat, lng, 'iconEu', ['wind', 'windGust', 'temp', 'dewpoint', 'pressure', 'precip', 'ptype', 'cape'], apiKey),
    windyRequest(lat, lng, 'gfsWave', ['waves', 'windWaves', 'swell1', 'swell2'], apiKey),
  ]);

  return parseWindyResponses(atmo, wave);
};

// ─── OpenWeatherMap fallback ──────────────────────────────────────────────────

const estimateWaveHeight = (windKnots: number): number => {
  if (windKnots < 5) return 0.1;
  if (windKnots < 10) return 0.3;
  if (windKnots < 15) return 0.6;
  if (windKnots < 20) return 1.0;
  if (windKnots < 25) return 1.5;
  if (windKnots < 30) return 2.0;
  if (windKnots < 35) return 2.5;
  return 3.0 + (windKnots - 35) * 0.1;
};

interface OWMForecastItem {
  wind?: { speed?: number; gust?: number; deg?: number };
  weather?: { id?: number; description?: string }[];
  main?: { temp?: number; dew_point?: number; pressure?: number; humidity?: number };
  visibility?: number;
  dt: number;
}

const owmItemToWeather = (item: OWMForecastItem, timestamp: number): NauticalWeather => {
  const windSpeed = msToKnots(item.wind?.speed || 0);
  const windGust = msToKnots(item.wind?.gust || item.wind?.speed || 0);
  const windDirDeg = item.wind?.deg || 0;
  const windDir = degreesToCardinal(windDirDeg);
  const waveH = estimateWaveHeight(windSpeed);
  const condition = owmIdToCondition(item.weather?.[0]?.id || 800);
  const tempC = Math.round(item.main?.temp || 20);
  const dewC = Math.round(item.main?.dew_point || tempC - 5);

  const w: NauticalWeather = {
    windSpeed, windDirection: windDir, windDirDeg, windGust,
    waveHeight: Math.round(waveH * 10) / 10,
    wavePeriod: 6, waveDirection: 0, swellHeight: 0, swellPeriod: 8, swellDirection: 0,
    visibility: Math.round((item.visibility || 10000) / 1000),
    temperature: tempC, dewpoint: dewC,
    condition, alerts: [],
    pressure: item.main?.pressure || 1013,
    humidity: item.main?.humidity || 60,
    cape: 0,
    description: item.weather?.[0]?.description || buildDescription(condition, windDir, windSpeed),
    timestamp,
    beaufort: knotsToBeaufort(windSpeed),
    dataSource: 'openweather',
  };
  w.alerts = generateAlerts(w);
  return w;
};

const fetchOWMForecastList = async (lat: number, lng: number): Promise<NauticalWeather[]> => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('No OWM key');

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`,
  );
  if (!res.ok) throw new Error(`OWM error ${res.status}`);
  const data = await res.json();
  return data.list.map((item: OWMForecastItem) => owmItemToWeather(item, item.dt * 1000));
};

// ─── Simulated weather fallback ───────────────────────────────────────────────

const generateSimulatedWeather = (lat: number, lng: number, timestamp?: number): NauticalWeather => {
  const now = timestamp ? new Date(timestamp) : new Date();
  const hour = now.getHours();
  const month = now.getMonth();

  let baseWind = 8 + Math.random() * 12;
  let windDir = 'NW';
  let windDirDeg = 315;

  // Adriatic — Bura/Yugo patterns
  if (lng > 13 && lng < 20 && lat > 40 && lat < 46) {
    const bura = Math.random() > 0.5;
    windDir = bura ? 'NE' : 'SE';
    windDirDeg = bura ? 45 : 135;
    if (bura) baseWind += 5;
  }
  // Aegean — Meltemi
  else if (lng > 22 && lng < 29 && lat > 35 && lat < 40) {
    windDir = month >= 5 && month <= 8 ? 'N' : 'NW';
    windDirDeg = month >= 5 && month <= 8 ? 0 : 315;
    if (month >= 6 && month <= 7) baseWind += 8;
  }
  if (hour >= 12 && hour <= 18) baseWind += 4;
  if (hour >= 22 || hour <= 6) baseWind = Math.max(3, baseWind - 8);

  const windSpeed = Math.round(baseWind);
  const windGust = Math.round(windSpeed * (1.2 + Math.random() * 0.3));
  const waveH = estimateWaveHeight(windSpeed);
  const baseTemp = month >= 5 && month <= 9 ? 25 : 15;
  const temperature = baseTemp + (hour >= 10 && hour <= 16 ? 5 : -3) + Math.floor(Math.random() * 5);
  const dewpoint = temperature - 5 - Math.random() * 5;
  const condition = windSpeed > 30 ? 'stormy' : Math.random() > 0.8 ? 'cloudy' : 'sunny';

  const w: NauticalWeather = {
    windSpeed, windDirection: windDir, windDirDeg, windGust,
    waveHeight: Math.round(waveH * 10) / 10,
    wavePeriod: 5 + Math.round(Math.random() * 4),
    waveDirection: windDirDeg,
    swellHeight: Math.round(waveH * 0.6 * 10) / 10,
    swellPeriod: 8 + Math.round(Math.random() * 4),
    swellDirection: windDirDeg,
    visibility: 15 + Math.round(Math.random() * 5),
    temperature, dewpoint, condition, alerts: [],
    pressure: 1010 + Math.round(Math.random() * 20),
    humidity: 55 + Math.round(Math.random() * 30),
    cape: Math.round(Math.random() * 300),
    description: buildDescription(condition, windDir, windSpeed),
    timestamp: timestamp ?? Date.now(),
    beaufort: knotsToBeaufort(windSpeed),
    dataSource: 'simulated',
  };
  w.alerts = generateAlerts(w);
  return w;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch a list of forecast entries for a location (primary call for WeatherWidget) */
export const fetchNauticalForecastList = async (lat: number, lng: number): Promise<NauticalWeather[]> => {
  // 1. Try Windy
  try {
    const list = await fetchWindyForecast(lat, lng);
    if (list.length > 0) return list;
  } catch (e) {
    console.warn('Windy forecast failed, falling back to OWM:', e);
  }

  // 2. Try OpenWeatherMap
  try {
    const list = await fetchOWMForecastList(lat, lng);
    if (list.length > 0) return list;
  } catch (e) {
    console.warn('OWM forecast failed, using simulated data:', e);
  }

  // 3. Simulated fallback (8 × 3h slots)
  const now = Date.now();
  return Array.from({ length: 8 }, (_, i) =>
    generateSimulatedWeather(lat, lng, now + i * 3 * 60 * 60 * 1000),
  );
};

/** Fetch a single current weather reading */
export const fetchNauticalForecast = async (lat: number, lng: number): Promise<NauticalWeather> => {
  const list = await fetchNauticalForecastList(lat, lng);
  return list[0];
};

// ─── Format helpers (used by AI Captain) ─────────────────────────────────────

const getApproachDirection = (windDir: string): string => {
  const opposite: Record<string, string> = {
    N: 'south', NNE: 'south', NE: 'southwest', ENE: 'west', E: 'west',
    ESE: 'northwest', SE: 'northwest', SSE: 'north', S: 'north',
    SSW: 'north', SW: 'northeast', WSW: 'east', W: 'east',
    WNW: 'southeast', NW: 'southeast', NNW: 'south',
  };
  return opposite[windDir] || 'upwind';
};

export const formatNauticalWeatherResponse = (weather: NauticalWeather): string => {
  let r = `🌬️ **Current Nautical Conditions** _(via ${weather.dataSource})_\n\n`;
  r += `**Wind:** ${weather.windSpeed} kn from ${weather.windDirection}`;
  if (weather.windGust > weather.windSpeed + 5) r += ` (gusting ${weather.windGust} kn)`;
  r += ` — Beaufort ${weather.beaufort}\n`;
  r += `**Waves:** ${weather.waveHeight}m, ${weather.wavePeriod}s period\n`;
  if (weather.swellHeight > 0.3) r += `**Swell:** ${weather.swellHeight}m, ${weather.swellPeriod}s\n`;
  r += `**Pressure:** ${weather.pressure} hPa\n`;
  r += `**Temperature:** ${weather.temperature}°C\n`;
  r += `**Conditions:** ${weather.description}\n\n`;
  if (weather.cape > 1000) r += `⛈️ **High CAPE (${weather.cape} J/kg):** Thunderstorm risk!\n\n`;
  if (weather.alerts.length > 0) {
    r += `**⚠️ Alerts:**\n`;
    weather.alerts.forEach(a => { r += `${a}\n`; });
    r += '\n';
  }
  r += `**📋 Recommendations:**\n`;
  if (weather.windSpeed < 10 && weather.waveHeight < 0.5) {
    r += `✅ Excellent conditions for mooring and sailing\n✅ Suitable for all experience levels\n`;
  } else if (weather.windSpeed < 20 && weather.waveHeight < 1.5) {
    r += `✅ Good sailing conditions\n⚠️ Secure loose items on deck\n`;
    r += `💡 Approach from ${getApproachDirection(weather.windDirection)} for best control\n`;
  } else if (weather.windSpeed < 30) {
    r += `⚠️ Experienced sailors only\n⚠️ Use spring lines when mooring\n💡 Consider reefing sails\n`;
  } else {
    r += `🚨 DANGEROUS CONDITIONS\n🚨 Seek shelter immediately\n💡 Double-check mooring lines\n`;
  }
  return r;
};
