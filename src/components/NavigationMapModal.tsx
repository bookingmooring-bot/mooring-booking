import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { DivIcon, Icon, LatLngBounds } from "leaflet";
import { X, Navigation, Compass, Copy, Locate, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { NavigationDestination } from "@/lib/navigation";
import { calculateBearing, calculateDistanceNM, bearingToCompass } from "@/lib/navigation";
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
    if (bounds) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
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
    return new LatLngBounds(userPos, destPos);
  }, [userPos, destPos]);

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
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b shadow-sm">
        <div className="flex items-center gap-2">
          <Navigation size={20} className="text-primary" />
          <h2 className="font-heading font-bold text-lg text-foreground truncate">
            {destination.label || t("nav.destination", "Destination")}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
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
            attribution='Tiles &copy; Esri &mdash; Esri, GEBCO, NOAA &mdash; OpenSeaMap contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={13}
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

          {/* Route polyline */}
          {userPos && (
            <Polyline
              positions={[userPos, destPos]}
              pathOptions={{
                color: "#0ea5e9",
                weight: 3,
                dashArray: "10, 8",
                opacity: 0.9,
              }}
            />
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
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                  <Navigation size={14} />
                  {distance < 1 ? `${(distance * 1852).toFixed(0)} m` : `${distance.toFixed(1)} NM`}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Compass size={14} />
                  {bearing.toFixed(0)}° {compass}
                </span>
              </div>
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
