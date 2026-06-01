import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { DivIcon, Icon, LatLngBounds } from "leaflet";
import { X, Navigation, Compass, Copy, Locate, Loader2, Route, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { NavigationDestination } from "@/lib/navigation";
import { calculateBearing, calculateDistanceNM, bearingToCompass } from "@/lib/navigation";
import { computeSeaRoute, fetchPreciseSeaRoute } from "@/lib/searoute";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const destinationIcon = new DivIcon({
  className: "nav-destination-marker",
  html: `<div style="
    background: #ef4444;
    color: white;
    width: 32px; height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
  "><span style="transform: rotate(45deg); font-size: 14px;">⚓</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const userIcon = new DivIcon({
  className: "nav-user-marker",
  html: `<div style="
    background: #3b82f6;
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const FitBounds = ({ bounds }: { bounds: LatLngBounds | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [bounds, map]);
  return null;
};

interface Props {
  destination: NavigationDestination;
  onClose: () => void;
}

const NavigationMapModal = ({ destination, onClose }: Props) => {
  const { t } = useTranslation();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [routePositions, setRoutePositions] = useState<[number, number][] | null>(null);
  const [routeLengthNM, setRouteLengthNM] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeSource, setRouteSource] = useState<"precise" | "approx" | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError(t("nav.geoUnavailable", "Geolocation is not supported by your browser"));
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: t("nav.geoDenied", "Location access denied. Showing destination only."),
          2: t("nav.geoUnavailable", "Location unavailable. Showing destination only."),
          3: t("nav.geoTimeout", "Location request timed out. Showing destination only."),
        };
        setGeoError(msgs[err.code] || msgs[2]);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [t]);

  const destPos: [number, number] = [destination.lat, destination.lng];

  // Resolve the route once we know where the user is, in three tiers:
  //   1. precise server route (sea-route edge fn) — only if booked this mooring,
  //   2. approximate client route (searoute-js) — everyone else,
  //   3. straight line — when neither yields a path (left as routePositions=null).
  useEffect(() => {
    if (!userPos) {
      setRoutePositions(null);
      setRouteLengthNM(null);
      setRouteSource(null);
      setShowUpsell(false);
      return;
    }
    let cancelled = false;
    const dest: [number, number] = [destination.lat, destination.lng];
    setRouteLoading(true);

    const useApprox = async () => {
      const route = await computeSeaRoute(userPos, dest);
      if (cancelled) return;
      setRoutePositions(route?.positions ?? null);
      setRouteLengthNM(route?.lengthNM ?? null);
      setRouteSource(route ? "approx" : null);
    };

    (async () => {
      try {
        if (destination.mooringId) {
          const precise = await fetchPreciseSeaRoute(userPos, destination.mooringId);
          if (cancelled) return;
          if (precise.kind === "precise") {
            setRoutePositions(precise.route.positions);
            setRouteLengthNM(precise.route.lengthNM);
            setRouteSource("precise");
            setShowUpsell(false);
            return;
          }
          if (precise.kind === "upsell") setShowUpsell(true);
        }
        await useApprox();
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userPos, destination.lat, destination.lng, destination.mooringId]);

  const { distance, bearing, compass } = useMemo(() => {
    if (!userPos) return { distance: null, bearing: null, compass: null };
    return {
      distance: calculateDistanceNM(userPos, destPos),
      bearing: calculateBearing(userPos, destPos),
      compass: bearingToCompass(calculateBearing(userPos, destPos)),
    };
  }, [userPos, destPos]);

  const bounds = useMemo(() => {
    if (!userPos) return null;
    if (routePositions && routePositions.length > 1) return new LatLngBounds(routePositions);
    return new LatLngBounds(userPos, destPos);
  }, [userPos, destPos, routePositions]);

  const center: [number, number] = userPos
    ? [(userPos[0] + destPos[0]) / 2, (userPos[1] + destPos[1]) / 2]
    : destPos;

  const copyCoords = () => {
    navigator.clipboard.writeText(`${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}`);
    toast.success(t("nav.coordsCopied", "Coordinates copied!"));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-card border-b shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0 -ml-2">
            <ArrowLeft size={18} className="mr-1" />
            {t("nav.back", "Back")}
          </Button>
          <Navigation size={20} className="text-primary shrink-0" />
          <h2 className="font-heading font-bold text-lg text-foreground truncate">
            {destination.label || t("nav.destination", "Destination")}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X size={20} />
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
              <span>{t("nav.locating", "Getting your location...")}</span>
            </div>
          </div>
        )}
        <MapContainer
          center={center}
          zoom={userPos ? 8 : 12}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.openseamap.org">OpenSeaMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <TileLayer
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            opacity={1}
          />

          {bounds && <FitBounds bounds={bounds} />}

          {/* Destination marker */}
          <Marker position={destPos} icon={destinationIcon} />

          {/* User position marker */}
          {userPos && <Marker position={userPos} icon={userIcon} />}

          {/* Route polyline — sea route when available, straight line otherwise.
              Precise (booked) routes render green; approximate ones blue. */}
          {userPos && routePositions && routePositions.length > 1 ? (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: routeSource === "precise" ? "#16a34a" : "#0ea5e9",
                weight: 4,
                opacity: 0.95,
              }}
            />
          ) : (
            userPos && (
              <Polyline
                positions={[userPos, destPos]}
                pathOptions={{
                  color: "#0ea5e9",
                  weight: 3,
                  dashArray: "10, 8",
                  opacity: 0.9,
                }}
              />
            )
          )}
        </MapContainer>

        {/* Geolocation error banner */}
        {geoError && (
          <div className="absolute top-4 left-4 right-4 bg-amber-500/90 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-[1000] flex items-center gap-2">
            <Locate size={16} />
            {geoError}
          </div>
        )}
      </div>

      {/* Bottom info panel */}
      <div className="bg-card border-t px-4 py-3 shadow-up">
        <div className="flex items-center justify-between gap-3">
          {/* Navigation info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {destination.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {destination.lat.toFixed(4)}°N, {destination.lng.toFixed(4)}°E
            </p>
            {distance !== null && bearing !== null && (
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                  <Navigation size={14} />
                  {(() => {
                    const d = routeLengthNM ?? distance;
                    return d < 1 ? `${(d * 1852).toFixed(0)} m` : `${d.toFixed(1)} NM`;
                  })()}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Compass size={14} />
                  {bearing.toFixed(0)}° {compass}
                </span>
                {routeLoading ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" />
                    {t("nav.calculatingRoute", "Calculating route…")}
                  </span>
                ) : routeSource === "precise" ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <Route size={12} />
                    {t("nav.preciseRoute", "Precise sea route")}
                  </span>
                ) : (
                  routePositions && (
                    <span className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
                      <Route size={12} />
                      {t("nav.approxRoute", "Approx. sea route")}
                    </span>
                  )
                )}
              </div>
            )}
            {showUpsell && routeSource !== "precise" && (
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                {t("nav.preciseUpsell", "Book this mooring to unlock the precise captain route.")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={copyCoords}>
              <Copy size={14} className="mr-1" />
              {t("nav.copy", "Copy")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationMapModal;
