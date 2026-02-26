import { toast } from "sonner";

interface NavigationDestination {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Opens navigation to a destination using Navionics nautical charts
 */
export const openNavigation = (destination: NavigationDestination) => {
  const { lat, lng, label } = destination;

  toast.success('Opening navigation...', {
    description: `Navigating to ${label || 'your mooring'}`
  });

  // Navionics Web App — nautical charts for marine navigation
  const navionicsUrl = `https://webapp.navionics.com/?lang=en#boating@14&lat=${lat}&lng=${lng}`;
  window.open(navionicsUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Opens nautical navigation (for boats) using marine charts
 */
export const openNauticalNavigation = (destination: NavigationDestination) => {
  const { lat, lng, label } = destination;

  toast.success('Opening nautical chart...', {
    description: `Marine chart for ${label || 'your mooring'}`
  });

  // OpenSeaMap has nautical charts overlaid on OSM
  const openSeaMapUrl = `https://map.openseamap.org/?zoom=14&lat=${lat}&lon=${lng}&layers=BFTFFFTFFTF0FFFFFFFFFF`;
  window.open(openSeaMapUrl, '_blank', 'noopener,noreferrer');
};
