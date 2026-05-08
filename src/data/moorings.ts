import type { MooringLayer } from '@/lib/mooringLayer';

export interface Mooring {
  id: string;
  name: string;
  location: string;
  country: string;
  countryFlag: string;
  rating: number;
  reviewCount: number;
  price: number;
  discountPercent?: number;
  isLastMinute?: boolean;
  isNow4Today?: boolean;
  isPremiumListing?: boolean;
  isMarketingTools?: boolean;
  isMooringInsurance?: boolean;
  windProtection: 'excellent' | 'good' | 'moderate' | 'poor';
  amenities: string[];
  image: string;
  distance?: string;
  lat: number;
  lng: number;
  ownerName: string;
  ownerPhone: string;
  description?: string;
  winterStorage?: boolean;
  winterStorageType?: 'wet' | 'dry' | 'both';
  winterPriceMonthly?: number;
  stripeAccountId?: string;
  activeServices?: string[];
  status?: string;
  ownerId?: string;
  mooringLayer?: MooringLayer;
  sourceUrl?: string;
  dataSource?: 'manual' | 'osm' | 'google_maps' | 'registry';
  contactEmail?: string;
  contactPhone?: string;
}
