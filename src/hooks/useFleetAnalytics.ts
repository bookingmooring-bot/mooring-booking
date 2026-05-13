import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useVessels } from './useVesselProfile';

export interface FleetBooking {
  id: string;
  vessel_id: string;
  mooring_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  booking_status: string;
  guest_name: string;
  nights: number;
  moorings: { name: string; location: string } | null;
}

export interface VesselStats {
  vesselId: string;
  vesselName: string;
  totalBookings: number;
  totalSpend: number;
  totalNights: number;
}

export function useFleetBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fleet-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('id, vessel_id, mooring_id, check_in, check_out, total_price, booking_status, guest_name, nights, moorings(name, location)')
        .eq('user_id', user.id)
        .not('vessel_id', 'is', null)
        .order('check_in', { ascending: false });

      if (error) return [];
      return (data ?? []) as FleetBooking[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFleetAnalytics() {
  const { data: bookings } = useFleetBookings();
  const { data: vessels } = useVessels();

  const vesselMap = new Map((vessels ?? []).map((v) => [v.id, v.name ?? 'Unnamed']));

  const statsMap = new Map<string, VesselStats>();
  for (const b of bookings ?? []) {
    if (!b.vessel_id) continue;
    const existing = statsMap.get(b.vessel_id) ?? {
      vesselId: b.vessel_id,
      vesselName: vesselMap.get(b.vessel_id) ?? 'Unknown',
      totalBookings: 0,
      totalSpend: 0,
      totalNights: 0,
    };
    existing.totalBookings += 1;
    existing.totalSpend += Number(b.total_price) || 0;
    existing.totalNights += b.nights || 0;
    statsMap.set(b.vessel_id, existing);
  }

  const vesselStats = Array.from(statsMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  const totalBookings = vesselStats.reduce((s, v) => s + v.totalBookings, 0);
  const totalSpend = vesselStats.reduce((s, v) => s + v.totalSpend, 0);
  const totalNights = vesselStats.reduce((s, v) => s + v.totalNights, 0);

  return { vesselStats, totalBookings, totalSpend, totalNights, bookings: bookings ?? [] };
}
