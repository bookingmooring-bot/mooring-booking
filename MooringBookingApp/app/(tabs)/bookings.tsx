import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  RefreshControl, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

interface Booking {
  id: string;
  mooring_id: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  boat_name: string | null;
  boat_length: number | null;
  total_price: number;
  booking_status: string;
  confirmation_code: string;
  created_at: string;
  moorings?: {
    name: string;
    location: string;
    country: string;
    image_urls?: string[];
  };
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=500&q=80';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: COLORS.yellow, bg: COLORS.yellowGlow, label: 'Pending' },
  confirmed: { color: COLORS.green,  bg: COLORS.greenGlow,  label: 'Confirmed' },
  completed: { color: COLORS.blue,   bg: COLORS.blueGlow,   label: 'Completed' },
  cancelled: { color: COLORS.red,    bg: COLORS.redGlow,    label: 'Cancelled' },
};

function BookingCard({ item }: { item: Booking }) {
  const status = STATUS_CONFIG[item.booking_status] || STATUS_CONFIG.pending;
  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}.${m}.${y}`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/booking/${item.id}` as any)}
      activeOpacity={0.85}
    >
      {/* Accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: status.color }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          {/* Thumbnail */}
          <Image 
            source={{ uri: item.moorings?.image_urls?.[0] || FALLBACK_IMG }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={{ flex: 1, paddingRight: 6 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.moorings?.name || 'Unknown Mooring'}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.moorings?.location}, {item.moorings?.country}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.color + '40' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.detailText}>
              {formatDate(item.check_in)} – {formatDate(item.check_out)}
            </Text>
          </View>
          {item.boat_name && (
            <View style={styles.detailItem}>
              <Ionicons name="boat-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.boat_name} ({item.boat_length}m)</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.confirmCode}>#{item.confirmation_code}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.totalPrice}>€{Number(item.total_price).toFixed(2)}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </View>
        </View>

        {/* Leave Review CTA — only for completed bookings */}
        {item.booking_status === 'completed' && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={(e) => { e.stopPropagation(); router.push(`/review/${item.id}` as any); }}
            activeOpacity={0.85}
          >
            <Ionicons name="star-outline" size={15} color={COLORS.gold} />
            <Text style={styles.reviewBtnText}>Leave a Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, moorings (name, location, country, image_urls)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data as Booking[]) || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings().finally(() => setLoading(false));
  }, [fetchBookings]);

  // Auto-refresh when returning from booking detail screen
  useFocusEffect(
    useCallback(() => {
      if (!loading) fetchBookings();
    }, [fetchBookings, loading])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>Explore moorings and book your first trip!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { padding: SPACING.md, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md, overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg,
  },
  cardBody: { padding: SPACING.md, paddingTop: SPACING.md + 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  cardTitle: { ...FONTS.h3, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { ...FONTS.caption, fontSize: 12 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  detailRow: { marginTop: SPACING.sm, gap: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { ...FONTS.body, fontSize: 13 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
  },
  confirmCode: { ...FONTS.tiny, letterSpacing: 0.5 },
  totalPrice: { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: { color: COLORS.text, fontWeight: '800', fontSize: 18 },
  emptySubtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },
  thumbnail: {
    width: 50, height: 50,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.cardBorder,
  },
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: SPACING.sm, paddingVertical: 10,
    backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.gold + '40',
  },
  reviewBtnText: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
});
