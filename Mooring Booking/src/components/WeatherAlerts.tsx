import { useState, useEffect } from "react";
import { Wind, Waves, Cloud, AlertTriangle, Thermometer, Droplets, Compass, Ship, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { fetchNauticalForecast, getUserLocation, NauticalWeather } from "../services/weatherService";

interface WeatherAlert {
  id: string;
  type: 'wind' | 'wave' | 'storm' | 'fog' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  expiresAt: Date;
}

// Fallback weather data (used when offline or API fails)
const fallbackWeather: NauticalWeather = {
  temperature: 24, windSpeed: 18, windDirection: "NW", windDirDeg: 315,
  windGust: 24, waveHeight: 1.2, wavePeriod: 6, waveDirection: 315,
  swellHeight: 0.8, swellPeriod: 8, swellDirection: 300,
  humidity: 65, visibility: 12, pressure: 1015,
  condition: "Partly Cloudy", alerts: [], cape: 0,
  description: "Partly cloudy, moderate NW wind",
  dewpoint: 16, beaufort: 5, dataSource: "simulated",
};

const mockAlerts: WeatherAlert[] = [
  {
    id: "1",
    type: "wind",
    severity: "medium",
    title: "Strong Wind Advisory",
    description: "Northwest winds 25-30 knots expected in the Adriatic Sea. Small craft advisory in effect.",
    location: "Adriatic Sea - Croatian Coast",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    id: "2",
    type: "wave",
    severity: "low",
    title: "Moderate Swell",
    description: "Wave heights 1.5-2m expected from the southwest. Exercise caution when entering harbors.",
    location: "Ionian Sea - Greek Islands",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
  },
  {
    id: "3",
    type: "traffic",
    severity: "high",
    title: "Harbor Congestion Alert",
    description: "Heavy yacht traffic reported. Extended wait times for berth allocation. Consider alternative moorings.",
    location: "Dubrovnik Marina, Croatia",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  },
  {
    id: "4",
    type: "storm",
    severity: "critical",
    title: "Thunderstorm Warning",
    description: "Severe thunderstorms with lightning possible. Seek shelter immediately. Avoid open water.",
    location: "Gulf of Naples, Italy",
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
  },
];

const severityColors = {
  low: "bg-success/10 border-success text-success",
  medium: "bg-warning/10 border-warning text-warning",
  high: "bg-destructive/10 border-destructive text-destructive",
  critical: "bg-destructive border-destructive text-white",
};

const alertIcons = {
  wind: Wind,
  wave: Waves,
  storm: Cloud,
  fog: Droplets,
  traffic: Ship,
};

const WeatherAlerts = () => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<NauticalWeather>(fallbackWeather);
  const [alerts, setAlerts] = useState<WeatherAlert[]>(mockAlerts);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const load = async () => {
      if (!navigator.onLine) {
        // Restore cached data
        const cached = localStorage.getItem('cachedWeatherAlerts');
        if (cached) {
          try { setWeather(JSON.parse(cached)); } catch { /* ignore */ }
        }
        return;
      }
      try {
        const loc = await getUserLocation();
        const liveWeather = await fetchNauticalForecast(loc.lat, loc.lng);
        setWeather(liveWeather);
        setLastUpdate(new Date());
        localStorage.setItem('cachedWeatherAlerts', JSON.stringify(liveWeather));

        // Convert NauticalWeather alerts → WeatherAlert objects
        const dynamicAlerts: WeatherAlert[] = liveWeather.alerts.map((msg, i) => ({
          id: `live-${i}`,
          type: msg.includes('wave') || msg.includes('Wave') ? 'wave'
            : msg.includes('Thunderstorm') || msg.includes('gale') ? 'storm'
              : msg.includes('Fog') || msg.includes('fog') ? 'fog'
                : 'wind',
          severity: msg.includes('🚨') ? 'critical' : msg.includes('⚠️') ? 'medium' : 'low',
          title: msg.replace(/^[^a-zA-Z]+/, '').split(':')[0].trim(),
          description: msg,
          location: 'Current Location',
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        }));

        if (dynamicAlerts.length > 0) setAlerts(dynamicAlerts);
        else setAlerts([]);
      } catch (e) {
        console.error('WeatherAlerts load error:', e);
      }
    };

    load();
    const interval = setInterval(load, 600_000); // Refresh every 10 min

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // No simulation needed — real data refreshes every 10 min via the load() interval above

  const dismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-warning/20 border border-warning rounded-lg p-3 flex items-center gap-2 text-warning">
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">Offline Mode - Showing cached data</span>
        </div>
      )}

      {/* Current Weather Card */}
      <div className="bg-card rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg text-foreground">Current Conditions</h3>
          <span className="text-xs text-muted-foreground">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Temperature */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Thermometer className="mx-auto mb-2 text-destructive" size={24} />
            <p className="text-2xl font-bold text-foreground">{weather.temperature.toFixed(1)}°C</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>

          {/* Wind */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Wind className="mx-auto mb-2 text-secondary" size={24} />
            <p className="text-2xl font-bold text-foreground">{weather.windSpeed.toFixed(0)} kn</p>
            <p className="text-xs text-muted-foreground">{weather.windDirection} · {weather.windGust} kn gusts</p>
          </div>

          {/* Waves */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Waves className="mx-auto mb-2 text-primary" size={24} />
            <p className="text-2xl font-bold text-foreground">{weather.waveHeight.toFixed(1)} m</p>
            <p className="text-xs text-muted-foreground">{weather.wavePeriod}s · {weather.waveDirection}°</p>
          </div>

          {/* Visibility */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Compass className="mx-auto mb-2 text-success" size={24} />
            <p className="text-2xl font-bold text-foreground">{weather.visibility} km</p>
            <p className="text-xs text-muted-foreground">Visibility</p>
          </div>
        </div>

        {/* Extra nautical row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Swell</p>
            <p className="text-sm font-semibold text-foreground">
              {weather.swellHeight > 0 ? `${weather.swellHeight.toFixed(1)}m · ${weather.swellPeriod}s` : '—'}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Pressure</p>
            <p className="text-sm font-semibold text-foreground">{weather.pressure} hPa</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">CAPE</p>
            <p className={`text-sm font-semibold ${weather.cape > 1000 ? 'text-destructive' : 'text-foreground'}`}>
              {weather.cape > 0 ? `${weather.cape} J/kg` : '—'}
            </p>
          </div>
        </div>

        {/* Condition */}
        <div className="mt-3 flex items-center justify-center gap-2 text-muted-foreground">
          <Cloud size={18} />
          <span>{weather.description}</span>
          <span className="text-xs">•</span>
          <span>Beaufort {weather.beaufort}</span>
          {weather.dataSource && (
            <><span className="text-xs">•</span>
              <span className="text-xs capitalize">via {weather.dataSource}</span></>
          )}
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-destructive text-destructive-foreground rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>
              <p className="font-bold">⚠️ CRITICAL WEATHER ALERT</p>
              <p className="text-sm">{criticalAlerts[0].title}: {criticalAlerts[0].description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
            <Bell size={20} />
            Active Alerts ({activeAlerts.length})
          </h3>
        </div>

        {activeAlerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-lg border-l-4 p-4 flex items-start gap-3",
                severityColors[alert.severity]
              )}
            >
              <Icon size={24} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm opacity-90 mt-1">{alert.description}</p>
                    <p className="text-xs mt-2 opacity-75">
                      📍 {alert.location} • Expires: {alert.expiresAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {activeAlerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p>No active weather alerts</p>
          </div>
        )}
      </div>

      {/* Harbor Traffic */}
      <div className="bg-card rounded-xl shadow-card p-6">
        <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Ship size={20} />
          Marina Traffic Status
        </h3>
        <div className="space-y-3">
          {[
            { name: "Dubrovnik Marina", status: "busy", waitTime: "45 min", fill: 85 },
            { name: "Dubrovnik ACI", status: "moderate", waitTime: "15 min", fill: 60 },
            { name: "Zadar Marina", status: "light", waitTime: "5 min", fill: 35 },
            { name: "Hvar Port", status: "very busy", waitTime: "1h+", fill: 95 },
          ].map((marina) => (
            <div key={marina.name} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{marina.name}</span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    marina.fill > 80 ? "bg-destructive/20 text-destructive" :
                      marina.fill > 50 ? "bg-warning/20 text-warning" :
                        "bg-success/20 text-success"
                  )}>
                    {marina.status}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      marina.fill > 80 ? "bg-destructive" :
                        marina.fill > 50 ? "bg-warning" :
                          "bg-success"
                    )}
                    style={{ width: `${marina.fill}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Wait time: ~{marina.waitTime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherAlerts;
