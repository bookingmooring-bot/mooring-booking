import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Mooring {
  id: string;
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  price_per_night: number;
}

const HomeMap = () => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [moorings, setMoorings] = useState<Mooring[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetchMoorings();
  }, []);

  const fetchMoorings = async () => {
    try {
      const { data, error } = await supabase
        .from('moorings')
        .select('id, name, location, country, lat, lng, price_per_night')
        .eq('status', 'active')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;
      setMoorings(data || []);
    } catch (err) {
      console.error('Error fetching moorings for map:', err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  if (hasError) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground">Map temporarily unavailable</p>
          <a href="/explore" className="text-primary underline mt-2 inline-block">
            Browse all moorings →
          </a>
        </div>
      </div>
    );
  }

  if (!isClient || loading) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  const medCountries = new Set([
    'Italy', 'Greece', 'Spain', 'France', 'Croatia', 'Turkey',
    'Montenegro', 'Albania', 'Slovenia', 'Malta', 'Cyprus',
    'Portugal', 'Morocco', 'Tunisia',
  ]);
  const countryCounts = new Map<string, number>();
  moorings.forEach(m => {
    if (medCountries.has(m.country))
      countryCounts.set(m.country, (countryCounts.get(m.country) || 0) + 1);
  });
  const countries = Array.from(countryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-card relative">
      <MapContainer
        center={[43, 16]}
        zoom={6}
        className="h-full w-full z-0"
        scrollWheelZoom={false}
        ref={mapRef}
      >
        {/* ESRI Ocean basemap — batimetrija i nautički prikaz */}
        <TileLayer
          attribution='Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer">Esri</a> &mdash; Esri, GEBCO, NOAA, National Geographic, DeLorme, HERE, Geonames.org &mdash; <a href="https://www.openseamap.org">OpenSeaMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={13}
        />
        {/* OpenSeaMap overlay — nautički simboli: plutače, sidra, opasnosti */}
        <TileLayer
          url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          opacity={1}
        />
        {moorings.map((mooring) => (
          <Marker
            key={mooring.id}
            position={[mooring.lat, mooring.lng]}
          >
            <Popup>
              <div className="text-center p-2 min-w-[160px]">
                <h3 className="font-bold text-base">{mooring.name}</h3>
                <p className="text-sm text-muted-foreground">{mooring.location}</p>
                {mooring.price_per_night && (
                  <p className="text-sm font-semibold mt-1">
                    €{mooring.price_per_night} / noć
                  </p>
                )}
                <a
                  href={`/explore?id=${mooring.id}`}
                  className="mt-2 inline-block px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90"
                >
                  Pregledaj
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Country labels at the bottom */}
      {countries.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center pointer-events-none z-[1000]">
          {countries.map((country) => (
            <span
              key={country}
              className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-foreground shadow-sm"
            >
              {country}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeMap;