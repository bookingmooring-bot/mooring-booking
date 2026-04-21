import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

export interface NotifItem {
  id: string;
  type: 'booking_confirmed' | 'booking_pending' | 'booking_cancelled' | 'new_review' | 'host_message' | 'promo';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  booking_confirmed: { icon: 'checkmark-circle',  color: COLORS.green,   bg: COLORS.greenGlow },
  booking_pending:   { icon: 'time',              color: COLORS.yellow,  bg: COLORS.yellowGlow },
  booking_cancelled: { icon: 'close-circle',      color: COLORS.red,     bg: COLORS.redGlow },
  new_review:        { icon: 'star',              color: COLORS.gold,    bg: 'rgba(251,191,36,0.15)' },
  host_message:      { icon: 'chatbubble',        color: COLORS.primary, bg: COLORS.primaryGlow },
  promo:             { icon: 'gift',              color: COLORS.purple,  bg: COLORS.purpleGlow },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24)return `${hours}h ago`;
  return `${days}d ago`;
}

function NotifCard({ item, onRead }: { item: NotifItem; onRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.promo;
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      activeOpacity={0.85}
      onPress={() => onRead(item.id)}
    >
      {!item.read && <View style={styles.unreadDot} />}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{timeAgo(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
}

/** Map a booking status change into a notification item shape */
function bookingToNotif(booking: any, isProvider: boolean): NotifItem {
  const status = booking.booking_status;
  const mooringName = booking.moorings?.name || 'your mooring';
  const typeMap: Record<string, NotifItem['type']> = {
    confirmed: 'booking_confirmed',
    pending:   'booking_pending',
    cancelled: 'booking_cancelled',
  };
  const type = typeMap[status] || 'promo';
  const titleMap: Record<string, string> = {
    confirmed: isProvider ? `New Booking at ${mooringName}` : `Booking Confirmed at ${mooringName}`,
    pending:   isProvider ? `Booking Request at ${mooringName}` : `Booking Pending at ${mooringName}`,
    cancelled: isProvider ? `Booking Cancelled at ${mooringName}` : `Booking Cancelled: ${mooringName}`,
  };
  const bodyMap: Record<string, string> = {
    confirmed: isProvider
      ? `${booking.guest_name} arrives ${booking.check_in}. Total: €${booking.total_price}`
      : `Your stay at ${mooringName} is confirmed. Check-in: ${booking.check_in}`,
    pending: isProvider
      ? `${booking.guest_name} requested dates ${booking.check_in} – ${booking.check_out}`
      : `Your request for ${mooringName} is under review.`,
    cancelled: `Booking #${booking.confirmation_code || ''} has been cancelled.`,
  };
  return {
    id: booking.id,
    type,
    title: titleMap[status] || `Booking Update: ${mooringName}`,
    body:  bodyMap[status]  || `Status changed to ${status}`,
    timestamp: new Date(booking.updated_at || booking.created_at).getTime(),
    read: false,
    data: { bookingId: booking.id },
  };
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isProvider = profile?.role === 'provider';

    let bookings: any[] = [];

    if (isProvider) {
      const { data } = await supabase
        .from('bookings')
        .select('id, booking_status, check_in, check_out, guest_name, total_price, confirmation_code, created_at, updated_at, moorings(name, owner_id)')
        .order('updated_at', { ascending: false })
        .limit(30);

      // Filter client-side to provider's moorings (RLS handles security)
      bookings = (data || []).filter((b: any) => {
        const mooring = Array.isArray(b.moorings) ? b.moorings[0] : b.moorings;
        return mooring?.owner_id === user.id;
      });
    } else {
      const { data } = await supabase
        .from('bookings')
        .select('id, booking_status, check_in, check_out, guest_name, total_price, confirmation_code, created_at, updated_at, moorings(name)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(30);
      bookings = data || [];
    }

    const items: NotifItem[] = bookings.map(b => bookingToNotif(b, isProvider));
    setNotifs(items);
  }, [user]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Mark read is local-only (no dedicated read-status table yet)
  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

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
        data={notifs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotifCard item={item} onRead={markRead} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListHeaderComponent={
          notifs.length > 0 ? (
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <Text style={styles.unreadLabel}>{unreadCount} unread</Text>
                )}
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllRead} activeOpacity={0.85} style={styles.actionBtn}>
                  <Text style={styles.actionText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>Booking updates, messages, and offers will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { padding: SPACING.md, paddingBottom: 100 },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: { ...FONTS.h2 },
  unreadLabel: { color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  actionBtn: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.cardBorder, paddingHorizontal: SPACING.sm, paddingVertical: 6,
  },
  actionText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },

  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, marginBottom: SPACING.sm,
    ...SHADOWS.sm, position: 'relative',
  },
  cardUnread: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primaryGlow,
  },
  unreadDot: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  textWrap: { flex: 1 },
  notifTitle: { color: COLORS.text, fontWeight: '700', fontSize: 14, marginBottom: 3 },
  notifBody: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  notifTime: { color: COLORS.textDim, fontSize: 11, fontWeight: '500', marginTop: 4 },

  empty: { alignItems: 'center', paddingTop: 100 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: { color: COLORS.text, fontWeight: '800', fontSize: 20, marginBottom: 8 },
  emptySub: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: SPACING.xl },
});
