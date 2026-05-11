import type { Profile } from '@/hooks/useProfile';
import { canBook } from './subscription';

export type MooringLayer = 'premium' | 'concierge' | 'explore';

export type BookingMode = 'instant' | 'concierge' | 'none';

export function getLayerBadge(layer: MooringLayer): { label: string; color: string; bgColor: string } {
  switch (layer) {
    case 'premium':
      return { label: 'Premium Partner', color: 'text-gold', bgColor: 'bg-gold/10' };
    case 'concierge':
      return { label: "Captain's Concierge", color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    case 'explore':
      return { label: 'Open Chart', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
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

export function getLayerDisclaimer(layer: MooringLayer): string {
  switch (layer) {
    case 'premium':
      return 'Premium Partner facilities operate under their own terms and conditions. Mooring Booking acts solely as a booking intermediary and is not a party to the berthing contract between the user and the facility. Availability, pricing and on-site services are set exclusively by the partner. Mooring Booking does not guarantee the physical condition of any berth, dock or mooring and accepts no liability for loss, damage or injury arising from the use of any facility. Please review the partner\'s own policies before arrival.';
    case 'concierge':
      return 'Captain\'s Concierge listings are compiled from publicly available sources. Mooring Booking has no contractual or commercial relationship with these facilities and acts only as a communication intermediary forwarding your request. Your payment method is pre-authorised but not charged until the facility confirms availability. If the facility declines or does not respond, the hold is released in full. Mooring Booking does not guarantee acceptance, pricing accuracy, berth availability or service quality at any Concierge listing. The final berthing agreement is between you and the facility. Full terms apply — see Master Terms of Service.';
    case 'explore':
      return 'Open Chart listings are for informational and navigational reference only. These locations are sourced from public nautical databases and community data — Mooring Booking has no information about ownership, management or availability and cannot facilitate bookings or reservations. No right of access, mooring or berthing is created by viewing any listing. Users are solely responsible for verifying all navigational data, depth, weather and legal access rights through official charts and local harbour authorities before approaching any location. Mooring Booking accepts no liability for the accuracy of the data or for any loss, damage or injury that may result from its use.';
  }
}
