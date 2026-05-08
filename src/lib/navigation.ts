import { toast } from "sonner";

interface NavigationDestination {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Opens navigation to a destination using OpenSeaMap nautical charts
 */
export const openNavigation = (destination: NavigationDestination) => {
  const { lat, lng, label } = destination;

  toast.success('Opening nautical chart...', {
    description: `Navigating to ${label || 'your mooring'}`
  });

  const openSeaMapUrl = `https://map.openseamap.org/?zoom=14&lat=${lat}&lon=${lng}&layers=BFTFFFFFFFFTF`;
  window.open(openSeaMapUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Opens nautical navigation (for boats) using marine charts
 */
export const openNauticalNavigation = (destination: NavigationDestination) => {
  const { lat, lng, label } = destination;

  toast.success('Opening nautical chart...', {
    description: `Marine chart for ${label || 'your mooring'}`
  });

  const openSeaMapUrl = `https://map.openseamap.org/?zoom=14&lat=${lat}&lon=${lng}&layers=BFTFFFFFFFFTF`;
  window.open(openSeaMapUrl, '_blank', 'noopener,noreferrer');
};
