import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, X, Loader2 } from "lucide-react";

interface CoordinatePickerMapProps {
    latitude: string;
    longitude: string;
    onCoordinatesChange: (lat: string, lng: string) => void;
}

// Custom pin icon — red teardrop
const createPickerIcon = () =>
    new DivIcon({
        className: "",
        html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:32px;height:32px;
          background:linear-gradient(135deg,#ef4444,#b91c1c);
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 3px 10px rgba(0,0,0,0.4);
        "></div>
        <div style="
          width:6px;height:6px;
          background:#b91c1c;
          border-radius:50%;
          margin-top:2px;
        "></div>
      </div>
    `,
        iconSize: [32, 44],
        iconAnchor: [16, 44],
        popupAnchor: [0, -44],
    });

// Handles map click
const ClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
    });
    return null;
};

// Fly to position when coordinates typed manually
const FlyToPosition = ({ position }: { position: [number, number] | null }) => {
    const map = useMap();
    const prev = useRef<string>("");

    useEffect(() => {
        if (!position) return;
        const key = `${position[0].toFixed(4)},${position[1].toFixed(4)}`;
        if (prev.current === key) return;
        prev.current = key;
        map.flyTo(position, Math.max(map.getZoom(), 13), { duration: 1 });
    }, [position, map]);

    return null;
};

// Nominatim reverse geocode — get place name from lat/lng
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        return data.display_name || "";
    } catch { return ""; }
};

// Nominatim forward geocode — search by name
const forwardGeocode = async (query: string): Promise<Array<{ display_name: string; lat: string; lon: string }>> => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
        );
        return await res.json();
    } catch { return []; }
};

const CoordinatePickerMap = ({ latitude, longitude, onCoordinatesChange }: CoordinatePickerMapProps) => {
    const [placeName, setPlaceName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng) &&
        parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180;

    const markerPosition: [number, number] | null = hasValidCoords ? [parsedLat, parsedLng] : null;

    // When user clicks on map
    const handleMapClick = useCallback(async (lat: number, lng: number) => {
        onCoordinatesChange(lat.toFixed(6), lng.toFixed(6));
        const name = await reverseGeocode(lat, lng);
        setPlaceName(name);
        setSearchQuery("");
        setShowResults(false);
    }, [onCoordinatesChange]);

    // Search input debounce
    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        setShowResults(false);
        clearTimeout(searchTimeout.current);
        if (!value.trim()) { setSearchResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            const results = await forwardGeocode(value);
            setSearchResults(results);
            setShowResults(true);
            setIsSearching(false);
        }, 400);
    };

    // Click on a search result
    const handleResultClick = (result: { display_name: string; lat: string; lon: string }) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        onCoordinatesChange(lat.toFixed(6), lng.toFixed(6));
        setPlaceName(result.display_name);
        setSearchQuery(result.display_name.split(",")[0]);
        setShowResults(false);
        setSearchResults([]);
    };

    return (
        <div className="space-y-2">
            {/* Search bar */}
            <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all">
                    <Search size={16} className="text-muted-foreground flex-shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                        placeholder="Search for a place, marina, port or address..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    {isSearching && <Loader2 size={15} className="animate-spin text-muted-foreground" />}
                    {searchQuery && !isSearching && (
                        <button type="button" onClick={() => { setSearchQuery(""); setSearchResults([]); setShowResults(false); }}>
                            <X size={14} className="text-muted-foreground hover:text-foreground" />
                        </button>
                    )}
                </div>

                {/* Dropdown results */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute z-[9999] top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                        {searchResults.map((r, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleResultClick(r)}
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-start gap-2 border-b border-border last:border-0"
                            >
                                <MapPin size={14} className="text-secondary mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2 text-foreground">{r.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-border shadow-sm">
                <MapContainer
                    center={hasValidCoords ? [parsedLat, parsedLng] : [43.5, 16.4]}
                    zoom={hasValidCoords ? 13 : 6}
                    className="w-full h-full z-0"
                    scrollWheelZoom={true}
                >
                    {/* OpenStreetMap — shows streets, place names, same look as Google Maps */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                    />

                    <ClickHandler onMapClick={handleMapClick} />
                    <FlyToPosition position={markerPosition} />

                    {markerPosition && (
                        <Marker position={markerPosition} icon={createPickerIcon()} />
                    )}
                </MapContainer>

                {/* Hint overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-background/90 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 pointer-events-none whitespace-nowrap">
                    <MapPin size={12} className="text-red-500 flex-shrink-0" />
                    Click on the map to pin your mooring location
                </div>
            </div>

            {/* Address display after pin */}
            {hasValidCoords && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/5 border border-secondary/20">
                    <MapPin size={14} className="text-secondary mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                        <span className="font-mono text-secondary font-semibold">
                            {parsedLat.toFixed(6)}°N, {parsedLng.toFixed(6)}°E
                        </span>
                        {placeName && (
                            <p className="text-muted-foreground mt-0.5 line-clamp-2">{placeName}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatePickerMap;
