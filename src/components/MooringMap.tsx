import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Anchor, Wind, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { DivIcon } from "leaflet";
import { supabase } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";

interface MooringLocation {
  id: string;
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  price: number;
  rating: number;
  available: boolean;
  ownerPhone?: string;
  ownerName?: string;
}

const createMooringIcon = (price: number, available: boolean, selected: boolean) =>
  new DivIcon({
    className: "mooring-marker",
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          background: ${selected ? '#f59e0b' : available ? '#0ea5e9' : '#ef4444'};
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          white-space: nowrap;
          margin-bottom: 2px;
        ">⚓ €${price}</div>
        <div style="
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${selected ? '#f59e0b' : available ? '#0ea5e9' : '#ef4444'};
        "></div>
      </div>
    `,
    iconSize: [70, 36],
    iconAnchor: [35, 36],
  });

const MapFlyTo = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 10, { duration: 1.2 });
  }, [center, map]);
  return null;
};

interface MooringMapProps {
  onSelectMooring?: (mooring: MooringLocation) => void;
  selectedLocation?: string;
  showNavigation?: boolean;
  bookingConfirmed?: boolean;
}

const MooringMap = ({ onSelectMooring, selectedLocation, bookingConfirmed = false }: MooringMapProps) => {
  const { t } = useTranslation();
  const [selectedMooring, setSelectedMooring] = useState<MooringLocation | null>(null);
  const [moorings, setMoorings] = useState<MooringLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoorings = async () => {
      try {
        const { data, error } = await supabase
          .from("moorings")
          .select("id, name, location, country, lat, lng, price_per_night, rating, status, owner_name, owner_phone")
          .not("lat", "is", null)
          .not("lng", "is", null);

        if (error) throw error;
        setMoorings(
          (data || []).map((m) => ({
            id: m.id,
            name: m.name,
            location: m.location,
            country: m.country,
            lat: m.lat,
            lng: m.lng,
            price: m.price_per_night ?? 0,
            rating: m.rating ?? 0,
            available: m.status === "active",
            ownerName: m.owner_name,
            ownerPhone: m.owner_phone,
          }))
        );
      } catch (err) {
        console.error("Error fetching moorings for map:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoorings();
  }, []);

  useEffect(() => {
    if (selectedLocation && moorings.length > 0) {
      const found = moorings.find(
        (m) =>
          m.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.country.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.name.toLowerCase().includes(selectedLocation.toLowerCase())
      );
      if (found) setSelectedMooring(found);
    }
  }, [selectedLocation, moorings]);

  const handleMarkerClick = (mooring: MooringLocation) => {
    setSelectedMooring(mooring);
    onSelectMooring?.(mooring);
  };

  const filteredMoorings = selectedLocation
    ? moorings.filter(
        (m) =>
          m.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.country.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.name.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    : moorings;

  if (loading) {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden bg-[#1a3a5c] animate-pulse flex items-center justify-center">
        <Anchor size={40} className="text-white/30" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={[40.5, 18.0]}
        zoom={5}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
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

        <MapFlyTo center={selectedMooring ? [selectedMooring.lat, selectedMooring.lng] : null} />

        {filteredMoorings.map((mooring) => (
          <Marker
            key={mooring.id}
            position={[mooring.lat, mooring.lng]}
            icon={createMooringIcon(mooring.price, mooring.available, selectedMooring?.id === mooring.id)}
            eventHandlers={{ click: () => handleMarkerClick(mooring) }}
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                <h3 className="font-bold text-sm mb-1">{mooring.name}</h3>
                <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                  <MapPin size={11} /> {mooring.location}, {mooring.country}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">⭐ {mooring.rating}</span>
                  <span className="font-bold text-sm text-blue-600">{t('popular.fromPrice')} €{mooring.price}{t('popular.perNight')}</span>
                </div>
                {bookingConfirmed && mooring.ownerName && (
                  <div className="bg-green-50 rounded p-2 mb-2 text-xs">
                    <p className="font-medium text-green-700">{mooring.ownerName}</p>
                    <a href={`tel:${mooring.ownerPhone}`} className="text-green-600 flex items-center gap-1">
                      <Phone size={11} /> {mooring.ownerPhone}
                    </a>
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-900 to-cyan-500 text-white text-xs"
                  onClick={() => onSelectMooring?.(mooring)}
                >
                  Book Now
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Weather alert overlay */}
      <div className="absolute top-4 left-4 bg-amber-500/90 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm shadow-lg z-[1000]">
        <Wind size={16} />
        <span>Strong winds in Adriatic: 25-30 kn NW</span>
      </div>

      {/* Selected mooring info panel */}
      {selectedMooring && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card rounded-xl shadow-hover p-4 z-[1000]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-heading font-bold text-foreground">{selectedMooring.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin size={14} />
                {selectedMooring.location}, {selectedMooring.country}
              </p>
            </div>
            <button onClick={() => setSelectedMooring(null)} className="p-1 hover:bg-muted rounded">
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm">
            <span className="text-yellow-500 font-medium">⭐ {selectedMooring.rating}</span>
            <span className="text-green-600 font-semibold">{t('popular.fromPrice')} €{selectedMooring.price}{t('popular.perNight')}</span>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              selectedMooring.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {selectedMooring.available ? "Available" : "Booked"}
            </span>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            📍 {selectedMooring.lat.toFixed(4)}°N, {selectedMooring.lng.toFixed(4)}°E
          </div>

          {bookingConfirmed && (
            <div className="bg-green-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-green-600 font-medium mb-1">Owner Contact (Booking Confirmed)</p>
              <p className="text-sm font-medium">{selectedMooring.ownerName}</p>
              <a href={`tel:${selectedMooring.ownerPhone}`} className="text-sm text-green-600 flex items-center gap-1">
                <Phone size={14} /> {selectedMooring.ownerPhone}
              </a>
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-blue-900 to-cyan-500 text-white font-semibold"
            onClick={() => onSelectMooring?.(selectedMooring)}
          >
            Book Now
          </Button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 md:bottom-auto md:top-16 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs hidden md:block z-[1000]">
        <p className="font-semibold text-foreground mb-2">Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-muted-foreground">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MooringMap;
