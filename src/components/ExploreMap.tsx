import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import { Mooring } from "@/data/moorings";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Navigation, Anchor, Phone } from "lucide-react";
import BookingModal from "./BookingModal";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
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

interface ExploreMapProps {
  moorings: Mooring[];
}

// Custom marker component
const createCustomIcon = (price: number, isSelected: boolean) => {
  return new DivIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${isSelected ? 'hsl(45, 100%, 50%)' : 'hsl(197, 100%, 45%)'};
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        white-space: nowrap;
        border: 2px solid white;
      ">
        €${price}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });
};

// Map center controller
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const ExploreMap = ({ moorings }: ExploreMapProps) => {
  const [selectedMooring, setSelectedMooring] = useState<Mooring | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Center on Mediterranean
  const defaultCenter: [number, number] = [40.5, 18.0];
  const defaultZoom = 5;

  const handleMarkerClick = (mooring: Mooring) => {
    setSelectedMooring(mooring);
  };

  const handleBookNow = () => {
    if (selectedMooring) {
      setIsBookingOpen(true);
    }
  };

  return (
    <>
      <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {moorings.map((mooring) => (
            <Marker
              key={mooring.id}
              position={[mooring.lat, mooring.lng]}
              icon={createCustomIcon(mooring.price, selectedMooring?.id === mooring.id)}
              eventHandlers={{
                click: () => handleMarkerClick(mooring),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <img 
                    src={mooring.image} 
                    alt={mooring.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-bold text-sm">{mooring.name}</h3>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                    <MapPin size={12} />
                    {mooring.location}, {mooring.country} {mooring.countryFlag}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1 text-xs">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      {mooring.rating} ({mooring.reviewCount})
                    </span>
                    <span className="font-bold text-sm text-blue-600">
                      €{mooring.discountPercent 
                        ? Math.round(mooring.price * (1 - mooring.discountPercent / 100)) 
                        : mooring.price}/night
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-blue-900 to-cyan-500 text-white"
                    onClick={handleBookNow}
                  >
                    Book Now
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 text-xs shadow-lg z-[1000]">
          <p className="font-semibold text-foreground mb-2">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold" />
              <span className="text-muted-foreground">Selected</span>
            </div>
          </div>
        </div>

        {/* Weather Alert */}
        <div className="absolute top-4 left-4 bg-warning/90 text-warning-foreground px-3 py-2 rounded-lg flex items-center gap-2 text-sm shadow-lg z-[1000]">
          <Anchor size={16} />
          <span>Real-time weather data available</span>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedMooring && (
        <BookingModal
          mooring={{
            id: selectedMooring.id,
            name: selectedMooring.name,
            location: selectedMooring.location,
            country: selectedMooring.country,
            price: selectedMooring.price,
            discountPercent: selectedMooring.discountPercent,
            image: selectedMooring.image,
            lat: selectedMooring.lat,
            lng: selectedMooring.lng,
            ownerName: selectedMooring.ownerName,
            ownerPhone: selectedMooring.ownerPhone,
          }}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </>
  );
};

export default ExploreMap;