import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

// Office locations
const offices = [
  { city: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { city: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
];

const ContactMap = () => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import react-leaflet to catch any errors
    const loadMap = async () => {
      try {
        const [reactLeaflet, L] = await Promise.all([
          import('react-leaflet'),
          import('leaflet')
        ]);
        
        // Import CSS
        await import('leaflet/dist/leaflet.css');
        
        setMapComponents({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          Popup: reactLeaflet.Popup,
          L: L.default
        });
      } catch (error) {
        console.error('Failed to load map:', error);
        setHasError(true);
      }
    };
    
    loadMap();
  }, []);

  // Error fallback - show office cards
  if (hasError) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden bg-card p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {offices.map((office) => (
            <div 
              key={office.city}
              className="bg-muted rounded-xl p-6 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-secondary" size={32} />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                Intelligent Matrix
              </h3>
              <p className="text-muted-foreground">
                {office.city}, {office.country}
              </p>
              <a 
                href={`https://www.openstreetmap.org/?mlat=${office.lat}&mlon=${office.lng}#map=15/${office.lat}/${office.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-secondary hover:underline text-sm"
              >
                View on Map →
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Loading state
  if (!isClient || !MapComponents) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = MapComponents;

  const officeIcon = new L.DivIcon({
    className: 'custom-office-marker',
    html: `<div style="
      background: linear-gradient(135deg, #003366, #00A8E8);
      color: white;
      padding: 8px;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 16px;
    ">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-card">
      <MapContainer
        center={[49.1, 15.5]}
        zoom={5}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {offices.map((office) => (
          <Marker 
            key={office.city} 
            position={[office.lat, office.lng]}
            icon={officeIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold text-lg">Intelligent Matrix</h3>
                <p className="text-sm text-muted-foreground">
                  {office.city}, {office.country}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ContactMap;
