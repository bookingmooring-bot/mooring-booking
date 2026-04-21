import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Anchor, Wind, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MooringLocation {
  id: string;
  name: string;
  location: string;
  country: string;
  countryFlag: string;
  lat: number;
  lng: number;
  price: number;
  rating: number;
  available: boolean;
  ownerPhone?: string;
  ownerName?: string;
}

// Mediterranean mooring locations - major port cities
export const mooringLocations: MooringLocation[] = [
  // Croatia
  { id: "1", name: "Split Marina Bay", location: "Split", country: "Croatia", countryFlag: "🇭🇷", lat: 43.5081, lng: 16.4402, price: 65, rating: 4.9, available: true, ownerPhone: "+385 91 234 5678", ownerName: "Alessandro Rossi" },
  { id: "2", name: "Dubrovnik Old Port", location: "Dubrovnik", country: "Croatia", countryFlag: "🇭🇷", lat: 42.6507, lng: 18.0944, price: 85, rating: 4.8, available: true, ownerPhone: "+385 99 876 5432", ownerName: "Ivan Perić" },
  { id: "3", name: "Zadar Yacht Haven", location: "Zadar", country: "Croatia", countryFlag: "🇭🇷", lat: 44.1194, lng: 15.2314, price: 55, rating: 4.7, available: true, ownerPhone: "+385 95 111 2233", ownerName: "Ana Kovač" },
  { id: "4", name: "Rijeka Harbor Point", location: "Rijeka", country: "Croatia", countryFlag: "🇭🇷", lat: 45.3271, lng: 14.4422, price: 50, rating: 4.5, available: true, ownerPhone: "+385 91 333 4455", ownerName: "Petar Matić" },

  // Greece
  { id: "5", name: "Piraeus Central Marina", location: "Athens", country: "Greece", countryFlag: "🇬🇷", lat: 37.9420, lng: 23.6470, price: 75, rating: 4.8, available: true, ownerPhone: "+30 210 123 4567", ownerName: "Nikos Papadopoulos" },
  { id: "6", name: "Santorini Caldera Mooring", location: "Santorini", country: "Greece", countryFlag: "🇬🇷", lat: 36.3932, lng: 25.4615, price: 120, rating: 4.9, available: true, ownerPhone: "+30 228 604 5678", ownerName: "Elena Georgiou" },
  { id: "7", name: "Mykonos Town Harbor", location: "Mykonos", country: "Greece", countryFlag: "🇬🇷", lat: 37.4467, lng: 25.3289, price: 110, rating: 4.7, available: true, ownerPhone: "+30 228 902 3456", ownerName: "Dimitris Alexiou" },
  { id: "8", name: "Rhodes Marina Premium", location: "Rhodes", country: "Greece", countryFlag: "🇬🇷", lat: 36.4510, lng: 28.2278, price: 80, rating: 4.6, available: true, ownerPhone: "+30 224 107 8901", ownerName: "Maria Konstantinou" },

  // Italy
  { id: "9", name: "Portofino Elite Berth", location: "Portofino", country: "Italy", countryFlag: "🇮🇹", lat: 44.3034, lng: 9.2089, price: 150, rating: 4.9, available: true, ownerPhone: "+39 0185 269 111", ownerName: "Giuseppe Rossi" },
  { id: "10", name: "Amalfi Coast Anchorage", location: "Amalfi", country: "Italy", countryFlag: "🇮🇹", lat: 40.6340, lng: 14.6027, price: 95, rating: 4.8, available: true, ownerPhone: "+39 089 871 234", ownerName: "Marco Esposito" },
  { id: "11", name: "Venice Lagoon Private", location: "Venice", country: "Italy", countryFlag: "🇮🇹", lat: 45.4408, lng: 12.3155, price: 130, rating: 4.7, available: true, ownerPhone: "+39 041 522 3344", ownerName: "Francesca Bianchi" },
  { id: "12", name: "Naples Bay Mooring", location: "Naples", country: "Italy", countryFlag: "🇮🇹", lat: 40.8518, lng: 14.2681, price: 70, rating: 4.5, available: true, ownerPhone: "+39 081 764 5566", ownerName: "Antonio Marino" },

  // Spain
  { id: "13", name: "Barcelona Port Olympic", location: "Barcelona", country: "Spain", countryFlag: "🇪🇸", lat: 41.3851, lng: 2.1734, price: 85, rating: 4.8, available: true, ownerPhone: "+34 93 221 3344", ownerName: "Carlos García" },
  { id: "14", name: "Ibiza Marina Premium", location: "Ibiza", country: "Spain", countryFlag: "🇪🇸", lat: 38.9067, lng: 1.4206, price: 140, rating: 4.9, available: true, ownerPhone: "+34 971 310 111", ownerName: "María López" },
  { id: "15", name: "Mallorca Palma Bay", location: "Palma de Mallorca", country: "Spain", countryFlag: "🇪🇸", lat: 39.5696, lng: 2.6502, price: 100, rating: 4.7, available: true, ownerPhone: "+34 971 282 233", ownerName: "Juan Martínez" },
  { id: "16", name: "Valencia Marina Real", location: "Valencia", country: "Spain", countryFlag: "🇪🇸", lat: 39.4699, lng: -0.3763, price: 65, rating: 4.6, available: true, ownerPhone: "+34 96 316 4455", ownerName: "Pablo Sánchez" },

  // France
  { id: "17", name: "Nice Côte d'Azur Port", location: "Nice", country: "France", countryFlag: "🇫🇷", lat: 43.6961, lng: 7.2719, price: 110, rating: 4.8, available: true, ownerPhone: "+33 4 93 55 1122", ownerName: "Pierre Dubois" },
  { id: "18", name: "Monaco Port Hercules", location: "Monaco", country: "Monaco", countryFlag: "🇲🇨", lat: 43.7384, lng: 7.4246, price: 250, rating: 5.0, available: true, ownerPhone: "+377 93 15 6677", ownerName: "Jean-Claude Martin" },
  { id: "19", name: "Saint-Tropez Marina", location: "Saint-Tropez", country: "France", countryFlag: "🇫🇷", lat: 43.2727, lng: 6.6407, price: 180, rating: 4.9, available: true, ownerPhone: "+33 4 94 97 3344", ownerName: "Laurent Moreau" },
  { id: "20", name: "Marseille Vieux-Port", location: "Marseille", country: "France", countryFlag: "🇫🇷", lat: 43.2965, lng: 5.3698, price: 75, rating: 4.6, available: true, ownerPhone: "+33 4 91 55 6688", ownerName: "Sophie Bernard" },

  // Turkey
  { id: "21", name: "Bodrum Marina Deluxe", location: "Bodrum", country: "Turkey", countryFlag: "🇹🇷", lat: 37.0344, lng: 27.4305, price: 60, rating: 4.7, available: true, ownerPhone: "+90 252 316 1122", ownerName: "Mehmet Yılmaz" },
  { id: "22", name: "Antalya Kaleiçi Port", location: "Antalya", country: "Turkey", countryFlag: "🇹🇷", lat: 36.8841, lng: 30.7056, price: 55, rating: 4.6, available: true, ownerPhone: "+90 242 244 3344", ownerName: "Ahmet Öztürk" },
  { id: "23", name: "Marmaris Netsel Marina", location: "Marmaris", country: "Turkey", countryFlag: "🇹🇷", lat: 36.8509, lng: 28.2741, price: 50, rating: 4.5, available: true, ownerPhone: "+90 252 412 5566", ownerName: "Ali Demir" },

  // Albania
  { id: "24", name: "Saranda Riviera Mooring", location: "Saranda", country: "Albania", countryFlag: "🇦🇱", lat: 39.8661, lng: 20.0050, price: 35, rating: 4.5, available: true, ownerPhone: "+355 85 223 344", ownerName: "Arben Hoxha" },
  { id: "25", name: "Durrës Port Haven", location: "Durrës", country: "Albania", countryFlag: "🇦🇱", lat: 41.3246, lng: 19.4565, price: 30, rating: 4.3, available: true, ownerPhone: "+355 52 234 455", ownerName: "Fatmir Shehu" },

  // Slovenia
  { id: "26", name: "Portorož Marina", location: "Portorož", country: "Slovenia", countryFlag: "🇸🇮", lat: 45.5131, lng: 13.5960, price: 70, rating: 4.6, available: true, ownerPhone: "+386 5 676 1122", ownerName: "Janez Novak" },
  { id: "27", name: "Piran Bay Anchorage", location: "Piran", country: "Slovenia", countryFlag: "🇸🇮", lat: 45.5283, lng: 13.5681, price: 65, rating: 4.7, available: true, ownerPhone: "+386 5 673 3344", ownerName: "Marko Krajnc" },

  // Malta
  { id: "28", name: "Valletta Grand Harbour", location: "Valletta", country: "Malta", countryFlag: "🇲🇹", lat: 35.8989, lng: 14.5146, price: 90, rating: 4.8, available: true, ownerPhone: "+356 2122 3344", ownerName: "Joseph Borg" },
  { id: "29", name: "Msida Marina Malta", location: "Msida", country: "Malta", countryFlag: "🇲🇹", lat: 35.8958, lng: 14.4883, price: 80, rating: 4.6, available: true, ownerPhone: "+356 2133 5566", ownerName: "Mario Camilleri" },

  // Montenegro
  { id: "30", name: "Kotor Bay Marina", location: "Kotor", country: "Montenegro", countryFlag: "🇲🇪", lat: 42.4247, lng: 18.7712, price: 75, rating: 4.8, available: true, ownerPhone: "+382 32 304 111", ownerName: "Nikola Petrović" },
  { id: "31", name: "Porto Montenegro", location: "Tivat", country: "Montenegro", countryFlag: "🇲🇪", lat: 42.4318, lng: 18.6960, price: 200, rating: 4.9, available: true, ownerPhone: "+382 32 660 777", ownerName: "Dragan Vučković" },
];

// Custom anchor marker
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

// Controller to fly to selected location
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
  const [selectedMooring, setSelectedMooring] = useState<MooringLocation | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (selectedLocation) {
      const found = mooringLocations.find(
        (m) =>
          m.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.country.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.name.toLowerCase().includes(selectedLocation.toLowerCase())
      );
      if (found) setSelectedMooring(found);
    }
  }, [selectedLocation]);

  const handleMarkerClick = (mooring: MooringLocation) => {
    setSelectedMooring(mooring);
    onSelectMooring?.(mooring);
  };

  const filteredMoorings = selectedLocation
    ? mooringLocations.filter(
      (m) =>
        m.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        m.country.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        m.name.toLowerCase().includes(selectedLocation.toLowerCase())
    )
    : mooringLocations;

  if (!isClient) {
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
        {/* ESRI Ocean basemap — batimetrija i nautički prikaz */}
        <TileLayer
          attribution='Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer">Esri</a> — Esri, GEBCO, NOAA — <a href="https://www.openseamap.org">OpenSeaMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={13}
        />
        {/* OpenSeaMap overlay — nautički simboli: plutače, sidra, opasnosti */}
        <TileLayer
          url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          opacity={1}
        />

        {/* Fly to selected mooring */}
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
                  <MapPin size={11} /> {mooring.location}, {mooring.country} {mooring.countryFlag}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">⭐ {mooring.rating}</span>
                  <span className="font-bold text-sm text-blue-600">€{mooring.price}/night</span>
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
                {selectedMooring.location}, {selectedMooring.country} {selectedMooring.countryFlag}
              </p>
            </div>
            <button onClick={() => setSelectedMooring(null)} className="p-1 hover:bg-muted rounded">
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-3 text-sm">
            <span className="text-yellow-500 font-medium">⭐ {selectedMooring.rating}</span>
            <span className="text-green-600 font-semibold">€{selectedMooring.price}/night</span>
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
