import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Anchor, Wind, Waves, AlertTriangle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  { id: "1", name: "Split Marina Bay", location: "Split", country: "Croatia", countryFlag: "🇭🇷", lat: 43.5081, lng: 16.4402, price: 65, rating: 4.9, available: true, ownerPhone: "+385 91 234 5678", ownerName: "Marko Horvat" },
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

interface MooringMapProps {
  onSelectMooring?: (mooring: MooringLocation) => void;
  selectedLocation?: string;
  showNavigation?: boolean;
  bookingConfirmed?: boolean;
}

const MooringMap = ({ onSelectMooring, selectedLocation, showNavigation = false, bookingConfirmed = false }: MooringMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMooring, setSelectedMooring] = useState<MooringLocation | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showOwnerContact, setShowOwnerContact] = useState(false);

  useEffect(() => {
    // Get user's position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Adriatic if geolocation fails
          setUserPosition({ lat: 43.5, lng: 16.0 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const mooring = mooringLocations.find(
        (m) => m.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
               m.country.toLowerCase().includes(selectedLocation.toLowerCase())
      );
      if (mooring) {
        setSelectedMooring(mooring);
      }
    }
  }, [selectedLocation]);

  const handleMooringClick = (mooring: MooringLocation) => {
    setSelectedMooring(mooring);
    onSelectMooring?.(mooring);
  };

  const startNavigation = () => {
    if (selectedMooring && userPosition) {
      setIsNavigating(true);
      // Simulate navigation - in production this would use real navigation APIs
    }
  };

  const filteredMoorings = selectedLocation
    ? mooringLocations.filter(
        (m) =>
          m.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.country.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          m.name.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    : mooringLocations;

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden bg-secondary/10">
      {/* Map Background - Simulated with CSS */}
      <div 
        ref={mapRef}
        className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-secondary/5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23e0f4ff'/%3E%3Cpath d='M20 30c10-5 20 5 30 0s20-10 30 0' stroke='%2300a8e8' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Water pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-secondary/40 animate-wave" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-secondary/30 animate-wave" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-secondary/20 animate-wave" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Map Markers */}
      <div className="absolute inset-0 p-4">
        <div className="relative w-full h-full">
          {filteredMoorings.slice(0, 15).map((mooring, index) => {
            // Calculate position based on lat/lng (simplified for demo)
            const left = ((mooring.lng + 10) / 50) * 100;
            const top = ((50 - mooring.lat) / 20) * 100;
            
            return (
              <button
                key={mooring.id}
                onClick={() => handleMooringClick(mooring)}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group",
                  "transition-all duration-300 hover:scale-125"
                )}
                style={{ 
                  left: `${Math.min(90, Math.max(10, left))}%`, 
                  top: `${Math.min(85, Math.max(15, top))}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  selectedMooring?.id === mooring.id && "animate-pulse"
                )}>
                  {/* Pin */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                    mooring.available ? "bg-success" : "bg-destructive",
                    selectedMooring?.id === mooring.id && "ring-4 ring-gold"
                  )}>
                    <Anchor size={16} className="text-white" />
                  </div>
                  
                  {/* Price label */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card px-2 py-0.5 rounded text-xs font-bold shadow whitespace-nowrap">
                    €{mooring.price}
                  </div>
                  
                  {/* Country flag */}
                  <span className="absolute -bottom-4 text-lg">{mooring.countryFlag}</span>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-card rounded-lg shadow-lg p-2 whitespace-nowrap">
                      <p className="font-semibold text-sm text-foreground">{mooring.name}</p>
                      <p className="text-xs text-muted-foreground">{mooring.location}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* User position marker */}
          {userPosition && (
            <div 
              className="absolute z-20 animate-pulse"
              style={{ 
                left: `${Math.min(90, Math.max(10, ((userPosition.lng + 10) / 50) * 100))}%`, 
                top: `${Math.min(85, Math.max(15, ((50 - userPosition.lat) / 20) * 100))}%`
              }}
            >
              <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <Navigation size={12} className="text-white" />
              </div>
            </div>
          )}

          {/* Navigation line */}
          {isNavigating && selectedMooring && userPosition && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1={`${((userPosition.lng + 10) / 50) * 100}%`}
                y1={`${((50 - userPosition.lat) / 20) * 100}%`}
                x2={`${((selectedMooring.lng + 10) / 50) * 100}%`}
                y2={`${((50 - selectedMooring.lat) / 20) * 100}%`}
                stroke="hsl(var(--secondary))"
                strokeWidth="3"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 bg-card rounded-lg shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors">
          +
        </button>
        <button className="w-10 h-10 bg-card rounded-lg shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors">
          −
        </button>
        <button 
          className="w-10 h-10 bg-secondary rounded-lg shadow-lg flex items-center justify-center text-white hover:bg-secondary/90 transition-colors"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              });
            }
          }}
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Weather Alert */}
      <div className="absolute top-4 left-4 bg-warning/90 text-warning-foreground px-3 py-2 rounded-lg flex items-center gap-2 text-sm shadow-lg">
        <Wind size={16} />
        <span>Strong winds in Adriatic: 25-30 kn NW</span>
      </div>

      {/* Selected Mooring Panel */}
      {selectedMooring && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card rounded-xl shadow-hover p-4 animate-fade-in">
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
            <span className="flex items-center gap-1 text-gold">
              ⭐ {selectedMooring.rating}
            </span>
            <span className="text-success font-semibold">
              €{selectedMooring.price}/night
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              selectedMooring.available ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
            )}>
              {selectedMooring.available ? "Available" : "Booked"}
            </span>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            📍 {selectedMooring.lat.toFixed(4)}°N, {selectedMooring.lng.toFixed(4)}°E
          </div>

          {/* Owner Contact - Only shown after booking */}
          {bookingConfirmed && (
            <div className="bg-success/10 rounded-lg p-3 mb-3">
              <p className="text-xs text-success font-medium mb-1">Owner Contact (Booking Confirmed)</p>
              <p className="text-sm text-foreground font-medium">{selectedMooring.ownerName}</p>
              <a href={`tel:${selectedMooring.ownerPhone}`} className="text-sm text-secondary flex items-center gap-1">
                <Phone size={14} />
                {selectedMooring.ownerPhone}
              </a>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-ocean font-semibold"
              onClick={() => onSelectMooring?.(selectedMooring)}
            >
              Book Now
            </Button>
            {bookingConfirmed && (
              <Button 
                variant="outline"
                className="flex items-center gap-1"
                onClick={startNavigation}
              >
                <Navigation size={16} />
                Navigate
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 md:bottom-auto md:top-16 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs hidden md:block">
        <p className="font-semibold text-foreground mb-2">Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-white" />
            <span className="text-muted-foreground">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MooringMap;
