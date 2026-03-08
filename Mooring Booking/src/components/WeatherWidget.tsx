import { Cloud, Wind, Waves, Sun, CloudRain, AlertTriangle, ThermometerSun, Navigation, Clock, Gauge, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchNauticalForecastList, getUserLocation, NauticalWeather } from "../services/weatherService";

const conditionIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="text-gold" size={32} />,
  cloudy: <Cloud className="text-muted-foreground" size={32} />,
  rainy: <CloudRain className="text-secondary" size={32} />,
  drizzle: <CloudRain className="text-secondary" size={32} />,
  stormy: <AlertTriangle className="text-destructive" size={32} />,
  foggy: <Cloud className="text-muted-foreground" size={32} />,
  snowy: <CloudRain className="text-secondary" size={32} />,
  unknown: <Sun className="text-gold" size={32} />,
};

/** Beaufort color: 0-3=green, 4-5=yellow, 6-7=orange, 8+=red */
const beaufortColor = (b: number): string => {
  if (b <= 3) return "text-success";
  if (b <= 5) return "text-yellow-500";
  if (b <= 7) return "text-warning";
  return "text-destructive";
};

const beaufortLabel = (b: number): string => {
  const labels = ["Calm", "Light air", "Light breeze", "Gentle breeze", "Moderate breeze",
    "Fresh breeze", "Strong breeze", "Near gale", "Gale", "Strong gale", "Storm", "Violent storm", "Hurricane"];
  return labels[Math.min(b, 12)];
};

/** Arrow pointing in wind direction */
const WindArrow = ({ deg }: { deg: number }) => (
  <span
    style={{ display: "inline-block", transform: `rotate(${deg}deg)`, fontSize: "1rem" }}
    title={`${deg}°`}
  >↑</span>
);

const mockWeatherData: NauticalWeather = {
  windSpeed: 15, windDirection: "NW", windDirDeg: 315, windGust: 20,
  waveHeight: 0.8, wavePeriod: 6, waveDirection: 315,
  swellHeight: 0.5, swellPeriod: 8, swellDirection: 300,
  visibility: 15, temperature: 24, dewpoint: 16,
  condition: "sunny", alerts: [], pressure: 1013, humidity: 50, cape: 0,
  description: "Clear skies, moderate NW wind",
  beaufort: 4, dataSource: "simulated",
};

const WeatherWidget = () => {
  const [forecasts, setForecasts] = useState<NauticalWeather[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [locationName, setLocationName] = useState("Adriatic Sea");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  const weather = forecasts[selectedIndex] || mockWeatherData;

  useEffect(() => {
    // Load cached data immediately for instant render
    const cachedWeather = localStorage.getItem("cachedForecasts");
    if (cachedWeather) {
      try { setForecasts(JSON.parse(cachedWeather)); } catch { /* ignore */ }
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const load = async () => {
      if (!navigator.onLine) { setIsLoading(false); return; }
      try {
        const loc = await getUserLocation();
        const list = await fetchNauticalForecastList(loc.lat, loc.lng);
        if (list.length > 0) {
          setForecasts(list);
          localStorage.setItem("cachedForecasts", JSON.stringify(list));
          localStorage.setItem("weatherCacheTime", Date.now().toString());
          // Try to reverse-geocode location name (best effort)
          try {
            const geo = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`
            );
            const geoData = await geo.json();
            const city = geoData.address?.city || geoData.address?.town || geoData.address?.village;
            const country = geoData.address?.country;
            if (city) setLocationName(country ? `${city}, ${country}` : city);
          } catch { /* location name stays default */ }
        }
      } catch (e) {
        console.error("Error loading weather:", e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 600_000); // Refresh every 10 min

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "Now";
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      + " " + d.toLocaleDateString([], { weekday: "short" });
  };

  const windAlert = weather.windGust > 25 ? { level: "danger", message: `Gusts ${weather.windGust} kn — ${beaufortLabel(weather.beaufort)}` }
    : weather.windSpeed > 18 ? { level: "warning", message: `Wind ${weather.windSpeed} kn — ${beaufortLabel(weather.beaufort)}` }
      : null;
  const waveAlert = weather.waveHeight > 2 ? { level: "danger", message: `High waves ${weather.waveHeight}m — small craft caution` }
    : weather.waveHeight > 1.2 ? { level: "warning", message: `Moderate waves ${weather.waveHeight}m` }
      : null;
  const stormAlert = weather.cape > 1000 ? { level: "danger", message: `⛈️ Thunderstorm risk (CAPE ${weather.cape} J/kg)` } : null;

  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation size={16} className="text-secondary" />
          <span className="font-heading font-semibold text-foreground text-sm">{locationName}</span>
        </div>
        <div className="flex items-center gap-2">
          {weather.dataSource && (
            <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {weather.dataSource === "windy" ? "⚡ Windy" : weather.dataSource === "openweather" ? "OWM" : "Simulated"}
            </span>
          )}
          {isOffline && (
            <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">Offline</span>
          )}
        </div>
      </div>

      {/* Main current condition */}
      <div className="flex items-center gap-4 mb-4">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-muted/50 animate-pulse" />
        ) : (
          conditionIcons[weather.condition] ?? conditionIcons.unknown
        )}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-3xl font-bold text-foreground">{weather.temperature}</span>
            <span className="text-muted-foreground">°C</span>
          </div>
          <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
        </div>
      </div>

      {/* Forecast time slider */}
      {forecasts.length > 1 && (
        <div className="mb-5 bg-muted/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock size={14} />
              <span>Forecast Time</span>
            </div>
            <span className="text-xs font-semibold text-primary">
              {selectedIndex === 0 ? "Now" : formatTime(weather.timestamp)}
            </span>
          </div>
          <input
            type="range" min="0" max={forecasts.length - 1} value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Now</span>
            <span>+{Math.round((forecasts.length - 1) * 3)}h</span>
          </div>
        </div>
      )}

      {/* Main grid — Wind + Waves + Temp */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Wind */}
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <Wind size={18} className={`mx-auto mb-1 ${beaufortColor(weather.beaufort)}`} />
          <div className={`font-semibold text-sm ${beaufortColor(weather.beaufort)}`}>
            {weather.windSpeed} kn
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <WindArrow deg={weather.windDirDeg} />
            {weather.windDirection}
          </div>
        </div>

        {/* Waves */}
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <Waves size={18} className="text-secondary mx-auto mb-1" />
          <div className="font-semibold text-foreground text-sm">{weather.waveHeight.toFixed(1)} m</div>
          <div className="text-xs text-muted-foreground">{weather.wavePeriod}s · {weather.waveDirection}°</div>
        </div>

        {/* Temperature */}
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <ThermometerSun size={18} className="text-gold mx-auto mb-1" />
          <div className="font-semibold text-foreground text-sm">{weather.temperature}°C</div>
          <div className="text-xs text-muted-foreground">Dew {weather.dewpoint}°C</div>
        </div>
      </div>

      {/* Secondary row — Gusts + Pressure + Swell */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <Wind size={14} className="text-muted-foreground mx-auto mb-0.5" />
          <div className="font-medium text-foreground text-xs">{weather.windGust} kn</div>
          <div className="text-[10px] text-muted-foreground">Gusts</div>
        </div>
        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <Gauge size={14} className="text-muted-foreground mx-auto mb-0.5" />
          <div className="font-medium text-foreground text-xs">{weather.pressure} hPa</div>
          <div className="text-[10px] text-muted-foreground">Pressure</div>
        </div>
        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <Compass size={14} className="text-muted-foreground mx-auto mb-0.5" />
          <div className="font-medium text-foreground text-xs">
            {weather.swellHeight > 0 ? `${weather.swellHeight.toFixed(1)}m` : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground">Swell</div>
        </div>
      </div>

      {/* Beaufort scale badge */}
      <div className={`text-center text-xs font-medium mb-3 ${beaufortColor(weather.beaufort)}`}>
        Beaufort {weather.beaufort} — {beaufortLabel(weather.beaufort)}
      </div>

      {/* Alerts */}
      {(windAlert || waveAlert || stormAlert) && (
        <div className="space-y-2">
          {[windAlert, waveAlert, stormAlert].filter(Boolean).map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs p-2 rounded-lg ${alert!.level === "danger"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
                }`}
            >
              <AlertTriangle size={14} />
              <span>{alert!.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
