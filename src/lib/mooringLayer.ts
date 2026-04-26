import type { Profile } from '@/hooks/useProfile';
import { canBook } from './subscription';

export type MooringLayer = 'premium' | 'concierge' | 'explore';

export type BookingMode = 'instant' | 'concierge' | 'none';

export function getLayerBadge(layer: MooringLayer): { label: string; color: string; bgColor: string } {
  switch (layer) {
    case 'premium':
      return { label: 'Premium Partner', color: 'text-gold', bgColor: 'bg-gold/10' };
    case 'concierge':
      return { label: 'Concierge Booking', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    case 'explore':
      return { label: 'Navigate Only', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
  }
}

export function getBookingMode(layer: MooringLayer, profile: Profile | null | undefined): BookingMode {
  if (layer === 'explore') return 'none';
  if (!canBook(profile)) return 'none';
  if (layer === 'concierge') return 'concierge';
  return 'instant';
}

export function getLayerSortPriority(layer: MooringLayer): number {
  switch (layer) {
    case 'premium': return 0;
    case 'concierge': return 1;
    case 'explore': return 2;
  }
}

export function getLayerDisclaimer(layer: MooringLayer): string | null {
  switch (layer) {
    case 'concierge':
      return 'Concierge Booking listings are compiled from publicly available sources. Mooring Booking has no contractual relationship with these facilities. Payment is only captured upon marina confirmation. Full terms apply — see Master Terms of Service v3.0.';
    case 'explore':
      return 'Explore & Navigate listings are for informational and navigation reference purposes only. No booking or right of access is created by viewing any listing. Users are solely responsible for verifying navigational data through official charts before approaching any location. Always consult official nautical charts and contact the relevant harbour master.';
    default:
      return null;
  }
}
