import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

interface DashStats {
  totalMoorings: number;
  activeBookings: number;
  totalEarnings: number;
  pendingBookings: number;
}

interface PBooking {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
  commission_amount: number;
  booking_status: string;
  moorings?: { name: string };
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('user');
  const [stats, setStats] = useState<DashStats>({ totalMoorings: 0, activeBookings: 0, totalEarnings: 0, pendingBookings: 0 });
  const [recent, setRecent] = useState<PBooking[]>([]);
  const [myMoorings, setMyMoorings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setRole(p?.role || 'user');
    if (p?.role === 'provider') {
      const { data: myM, count } = await supabase.from('moorings').select('*', { count: 'exact' }).eq('owner_id', user.id);
      setMyMoorings(myM || []);

      const { data: bk } = await supabase.from('bookings').select('*, moorings(name)')
        .eq('provider_id', user.id).order('created_at', { ascending: false }).limit(10);
      const b = (bk || []) as PBooking[];
      setStats({
        totalMoorings: count || 0,
        activeBookings: b.filter(x => x.booking_status === 'confirmed').length,
        pendingBookings: b.filter(x => x.booking_status === 'pending').length,
        totalEarnings: b.filter(x => ['completed','confirmed'].includes(x.booking_status))
          .reduce((s, x) => s + (x.total_price - x.commission_amount), 0),
      });
      setRecent(b.slice(0, 5));
    }
  }, [user]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  if (loading) return <SafeAreaView style={s.c}><ActivityIndicator color={COLORS.primary} size="large" style={{ flex: 1 }} /></SafeAreaView>;

  if (role !== 'provider') {
    return (
      <SafeAreaView style={s.c}>
        <View style={s.empty}>
          <View style={s.eIcon}><Ionicons name="boat-outline" size={32} color={COLORS.primary} /></View>
          <Text style={s.eTitle}>Become a Provider</Text>
          <Text style={s.eSub}>List your mooring and start earning!</Text>
          <TouchableOpacity style={s.eCta} activeOpacity={0.85} onPress={() => router.push('/add-mooring')}>
            <Text style={s.eCtaT}>List Your Mooring</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const SC: Record<string,string> = { pending: COLORS.yellow, confirmed: COLORS.green, completed: COLORS.blue, cancelled: COLORS.red };
  const MS: Record<string,string> = { active: COLORS.green, pending: COLORS.yellow, maintenance: COLORS.red };

  return (
    <SafeAreaView style={s.c}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={COLORS.primary} />}>
        <View style={s.grid}>
          {[
            { l:'Moorings', v: stats.totalMoorings, i:'boat', c: COLORS.primary, bg: COLORS.primaryGlow },
            { l:'Active', v: stats.activeBookings, i:'checkmark-circle', c: COLORS.green, bg: COLORS.greenGlow },
            { l:'Pending', v: stats.pendingBookings, i:'time', c: COLORS.yellow, bg: COLORS.yellowGlow },
            { l:'Earnings', v: `€${stats.totalEarnings.toFixed(0)}`, i:'wallet', c: COLORS.cyan, bg: 'rgba(6,182,212,0.15)' },
          ].map(x => (
            <View key={x.l} style={s.stat}>
              <View style={[s.statI, { backgroundColor: x.bg }]}><Ionicons name={x.i as any} size={20} color={x.c} /></View>
              <Text style={s.statV}>{x.v}</Text>
              <Text style={s.statL}>{x.l}</Text>
            </View>
          ))}
        </View>

        <Text style={{ ...FONTS.h2, marginBottom: SPACING.md }}>Recent Bookings</Text>
        {recent.length === 0 ? (
          <View style={s.noData}><Text style={FONTS.body}>No bookings yet</Text></View>
        ) : recent.map(b => (
          <View key={b.id} style={s.bCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={FONTS.h3} numberOfLines={1}>{b.moorings?.name || 'Mooring'}</Text>
              <View style={[s.dot, { backgroundColor: SC[b.booking_status] || COLORS.textMuted }]} />
            </View>
            <Text style={{ ...FONTS.caption, marginTop: 4 }}>👤 {b.guest_name} · {b.check_in.slice(5)}</Text>
            <Text style={{ color: COLORS.cyan, fontWeight: '700', marginTop: 4 }}>€{(b.total_price - b.commission_amount).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={{ ...FONTS.h2, marginTop: SPACING.lg, marginBottom: SPACING.md }}>My Moorings</Text>
        {myMoorings.length === 0 ? (
          <View style={s.noData}><Text style={FONTS.body}>You haven't listed any moorings yet</Text></View>
        ) : myMoorings.map(m => (
          <View key={m.id} style={s.bCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[FONTS.h3, {flex:1}]} numberOfLines={1}>{m.name}</Text>
              <View style={[s.dot, { backgroundColor: MS[m.status] || COLORS.textMuted }]} />
            </View>
            <Text style={{ ...FONTS.caption, marginTop: 4 }}>📍 {m.location}, {m.country}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>€{m.price_per_night} / night</Text>
              <TouchableOpacity style={s.editBtn} onPress={() => router.push(`/edit-mooring/${m.id}` as any)} activeOpacity={0.8}>
                <Ionicons name="pencil" size={14} color={COLORS.bg} />
                <Text style={s.editBtnT}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Mooring Button */}
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/add-mooring')} activeOpacity={0.85}>
          <Ionicons name="add-circle" size={20} color={COLORS.bg} />
          <Text style={s.addBtnT}>Add New Mooring</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.md, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  stat: { width: '48%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.cardBorder, padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm, flexGrow: 1, flexBasis: '45%' },
  statI: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  statV: { ...FONTS.h2, marginBottom: 2 },
  statL: { ...FONTS.caption },
  bCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.cardBorder, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  noData: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.cardBorder, padding: SPACING.lg, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 120, paddingHorizontal: SPACING.lg },
  eIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryGlow, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  eTitle: { color: COLORS.text, fontWeight: '800', fontSize: 20 },
  eSub: { color: COLORS.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  eCta: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingVertical: 14, marginTop: SPACING.lg, ...SHADOWS.glow(COLORS.primary) },
  eCtaT: { color: COLORS.bg, fontWeight: '800', fontSize: 15 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: 14, marginTop: SPACING.lg, ...SHADOWS.glow(COLORS.primary) },
  addBtnT: { color: COLORS.bg, fontWeight: '800', fontSize: 15 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  editBtnT: { color: COLORS.bg, fontWeight: '700', fontSize: 12 },
});
