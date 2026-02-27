import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Mediterranean countries with moorings - using Twemoji codes for cross-platform compatibility
const mediterraneanCountries = [
  { name: "Croatia", lat: 43.5, lng: 16.4, moorings: 2500, flagCode: "1f1ed-1f1f7" },
  { name: "Greece", lat: 37.98, lng: 23.73, moorings: 2100, flagCode: "1f1ec-1f1f7" },
  { name: "Italy", lat: 41.9, lng: 12.5, moorings: 1800, flagCode: "1f1ee-1f1f9" },
  { name: "Spain", lat: 39.47, lng: -0.38, moorings: 1200, flagCode: "1f1ea-1f1f8" },
  { name: "France", lat: 43.3, lng: 5.37, moorings: 950, flagCode: "1f1eb-1f1f7" },
  { name: "Turkey", lat: 36.85, lng: 28.27, moorings: 800, flagCode: "1f1f9-1f1f7" },
  { name: "Albania", lat: 41.33, lng: 19.82, moorings: 350, flagCode: "1f1e6-1f1f1" },
  { name: "Malta", lat: 35.9, lng: 14.51, moorings: 280, flagCode: "1f1f2-1f1f9" },
  { name: "Slovenia", lat: 45.55, lng: 13.73, moorings: 180, flagCode: "1f1f8-1f1ee" },
  { name: "Montenegro", lat: 42.44, lng: 18.77, moorings: 320, flagCode: "1f1f2-1f1ea" },
  { name: "Cyprus", lat: 34.92, lng: 33.62, moorings: 420, flagCode: "1f1e8-1f1fe" },
];

const HomeMap = () => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  if (!isClient) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-card relative">
      <MapContainer
        center={[40, 15]}
        zoom={5}
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
        {mediterraneanCountries.map((country) => (
          <Marker
            key={country.name}
            position={[country.lat, country.lng]}
          >
            <Popup>
              <div className="text-center p-2">
                <img
                  src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${country.flagCode}.svg`}
                  alt={country.name}
                  className="w-8 h-8 mx-auto mb-1"
                />
                <h3 className="font-bold text-lg">{country.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {country.moorings.toLocaleString()} moorings
                </p>
                <a
                  href={`/explore?search=${country.name}`}
                  className="mt-2 inline-block px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90"
                >
                  Explore
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Country Labels */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center pointer-events-none z-[1000]">
        {mediterraneanCountries.slice(0, 6).map((country) => (
          <span
            key={country.name}
            className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-foreground shadow-sm flex items-center gap-1"
          >
            <img
              src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${country.flagCode}.svg`}
              alt={country.name}
              className="w-4 h-4 inline-block"
            />
            {country.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default HomeMap;