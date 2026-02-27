import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

interface CoordinatePickerMapProps {
    latitude: string;
    longitude: string;
    onCoordinatesChange: (lat: string, lng: string) => void;
}

// Custom anchor icon for selected position
const createPickerIcon = () =>
    new DivIcon({
        className: "coordinate-picker-marker",
        html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
      ">
        <div style="
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>
      </div>
    `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
    });

// Component that handles map clicks and fly-to
const ClickHandler = ({
    onMapClick,
}: {
    onMapClick: (lat: number, lng: number) => void;
}) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Fly to a position when coordinates change from inputs
const FlyToPosition = ({ position }: { position: [number, number] | null }) => {
    const map = useMap();
    const prevPos = useRef<[number, number] | null>(null);

    useEffect(() => {
        if (!position) return;
        const [lat, lng] = position;
        if (
            prevPos.current &&
            prevPos.current[0] === lat &&
            prevPos.current[1] === lng
        )
            return;
        map.flyTo([lat, lng], Math.max(map.getZoom(), 10), { duration: 1 });
        prevPos.current = [lat, lng];
    }, [position, map]);

    return null;
};

const CoordinatePickerMap = ({
    latitude,
    longitude,
    onCoordinatesChange,
}: CoordinatePickerMapProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    const hasValidCoords =
        !isNaN(parsedLat) &&
        !isNaN(parsedLng) &&
        parsedLat >= -90 &&
        parsedLat <= 90 &&
        parsedLng >= -180 &&
        parsedLng <= 180;

    const markerPosition: [number, number] | null = hasValidCoords
        ? [parsedLat, parsedLng]
        : null;

    const handleMapClick = (lat: number, lng: number) => {
        onCoordinatesChange(lat.toFixed(6), lng.toFixed(6));
    };

    if (!isClient) {
        return (
            <div className="w-full h-[300px] rounded-xl bg-muted flex items-center justify-center animate-pulse">
                <MapPin className="text-muted-foreground" size={32} />
            </div>
        );
    }

    return (
        <div className="relative w-full h-[300px] rounded-xl overflow-hidden border border-border shadow-sm">
            <MapContainer
                center={hasValidCoords ? [parsedLat, parsedLng] : [40.5, 18.0]}
                zoom={hasValidCoords ? 11 : 5}
                className="w-full h-full z-0"
                scrollWheelZoom={true}
            >
                {/* ESRI Ocean nautical basemap */}
                <TileLayer
                    attribution='Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer">Esri</a> — <a href="https://www.openseamap.org">OpenSeaMap</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={13}
                />
                {/* OpenSeaMap overlay — nautical symbols */}
                <TileLayer
                    url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                    opacity={1}
                />

                <ClickHandler onMapClick={handleMapClick} />
                <FlyToPosition position={markerPosition} />

                {markerPosition && (
                    <Marker position={markerPosition} icon={createPickerIcon()} />
                )}
            </MapContainer>

            {/* Instruction overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-background/90 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 pointer-events-none whitespace-nowrap">
                <MapPin size={12} className="text-red-500 flex-shrink-0" />
                Click anywhere on the map to set coordinates
            </div>
        </div>
    );
};

export default CoordinatePickerMap;
