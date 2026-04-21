import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, ActivityIndicator, Image,
  Dimensions, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

const FAVORITES_KEY = '@mooring_favorites';

const { width } = Dimensions.get('window');

interface MooringDetail {
  id: string; name: string; location: string; country: string;
  country_flag: string; price_per_night: number; discount_percent: number;
  rating: number; review_count: number; image_urls: string[];
  amenities: string[]; is_last_minute: boolean; is_now4today: boolean;
  wind_protection: string; description: string; lat: number; lng: number;
  owner_name: string; owner_phone: string; max_boat_length: number;
  max_draft: number; mooring_units: number; owner_id: string;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80';

const AMENITY_MAP: Record<string, { icon: string; label: string }> = {
  water: { icon: '💧', label: 'Water' }, electricity: { icon: '⚡', label: 'Power' },
  wifi: { icon: '📶', label: 'WiFi' }, toilet: { icon: '🚻', label: 'WC' },
  shower: { icon: '🚿', label: 'Shower' }, fuel: { icon: '⛽', label: 'Fuel' },
  restaurant: { icon: '🍽️', label: 'Food' }, type_bova: { icon: '🔴', label: 'Buoy' },
  type_dok: { icon: '🏗️', label: 'Dock' }, type_sidriste: { icon: '⚓', label: 'Anchorage' },
  type_vez_u_marini: { icon: '🏠', label: 'Marina Berth' },
};

const WIND_CFG: Record<string, { color: string; bg: string; label: string }> = {
  excellent: { color: COLORS.green, bg: COLORS.greenGlow, label: 'Excellent' },
  good: { color: COLORS.blue, bg: COLORS.blueGlow, label: 'Good' },
  moderate: { color: COLORS.yellow, bg: COLORS.yellowGlow, label: 'Moderate' },
  poor: { color: COLORS.red, bg: COLORS.redGlow, label: 'Poor' },
};

export default function MooringDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [mooring, setMooring] = useState<MooringDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);

  // Booking form
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [boatName, setBoatName] = useState('');
  const [boatLength, setBoatLength] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!id) return;
    supabase.from('moorings').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setMooring(data as MooringDetail);
        setLoading(false);
      });
    // Check favorite status
    AsyncStorage.getItem(FAVORITES_KEY).then(raw => {
      if (raw) setIsFav(!!JSON.parse(raw)[id]);
    });
  }, [id]);

  const handleFavToggle = useCallback(async () => {
    if (!mooring) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    const saved: Record<string, any> = raw ? JSON.parse(raw) : {};
    if (saved[mooring.id]) {
      delete saved[mooring.id];
      setIsFav(false);
    } else {
      saved[mooring.id] = { ...mooring, savedAt: Date.now() };
      setIsFav(true);
    }
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(saved));
  }, [mooring]);

  // Pre-fill user data
  useEffect(() => {
    if (!user) return;
    setGuestEmail(user.email || '');
    supabase.from('profiles').select('full_name, phone, boat_name, boat_length')
      .eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setGuestName(data.full_name || '');
          setGuestPhone(data.phone || '');
          setBoatName(data.boat_name || '');
          setBoatLength(data.boat_length?.toString() || '');
        }
      });
  }, [user]);

  const calcNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calcNights();
  const pricePerNight = Number(mooring?.price_per_night || 0);
  const totalPrice = nights * pricePerNight;
  const commissionRate = 0.15;
  const commission = totalPrice * commissionRate;

  const handleBook = async () => {
    if (!checkIn || !checkOut) return Alert.alert('Error', 'Please enter check-in and check-out dates (YYYY-MM-DD)');
    if (nights <= 0) return Alert.alert('Error', 'Check-out must be after check-in');
    if (!guestName) return Alert.alert('Error', 'Please enter guest name');
    if (!guestEmail) return Alert.alert('Error', 'Please enter guest email');
    if (!user) return Alert.alert('Error', 'Please log in to book');

    setBooking(true);
    try {
      // Direct insert into bookings table
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          mooring_id: mooring!.id,
          user_id: user.id,
          provider_id: mooring!.owner_id,
          check_in: formatDate(checkIn),
          check_out: formatDate(checkOut),
          boat_name: boatName || null,
          boat_length: boatLength ? parseFloat(boatLength) : null,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || null,
          nights,
          price_per_night: pricePerNight,
          total_price: totalPrice,
          commission_amount: commission,
          is_now4today: mooring!.is_now4today || false,
          payment_method: 'cash',
          payment_status: 'pending',
          booking_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw new Error(bookingError.message);

      Alert.alert(
        '✅ Booking Confirmed!',
        `Your booking at ${mooring!.name} is confirmed.\n\nTotal: €${totalPrice.toFixed(2)}\n${nights} night${nights > 1 ? 's' : ''}\nConfirmation: ${booking?.confirmation_code || booking?.id?.slice(0,8)}`,
        [{ text: 'View My Trips', onPress: () => router.replace('/(tabs)/bookings') }]
      );
    } catch (err: any) {
      console.error('Booking error:', err);
      Alert.alert('Booking Error', err.message || 'Something went wrong');
    }
    setBooking(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!mooring) {
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={FONTS.h2}>Mooring not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = mooring.image_urls?.filter(u => u?.startsWith('http'));
  const displayImages = images.length > 0 ? images : [FALLBACK_IMG];
  const wind = WIND_CFG[mooring.wind_protection] || WIND_CFG.good;
  const hasDiscount = mooring.discount_percent > 0;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image */}
        <View style={s.imageWrap}>
          <Image source={{ uri: displayImages[imgIdx] }} style={s.heroImage} resizeMode="cover" />
          <View style={s.imageGradient} />

          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Favorite button */}
          <TouchableOpacity style={s.favBtn} onPress={handleFavToggle} activeOpacity={0.85}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? COLORS.red : COLORS.text} />
          </TouchableOpacity>

          {/* Badges */}
          <View style={s.badgeRow}>
            {mooring.is_last_minute && (
              <View style={[s.badge, { backgroundColor: COLORS.gold }]}>
                <Ionicons name="flash" size={10} color="#000" />
                <Text style={[s.badgeT, { color: '#000' }]}>Last Minute</Text>
              </View>
            )}
            {mooring.is_now4today && (
              <View style={[s.badge, { backgroundColor: COLORS.green }]}>
                <Ionicons name="flame" size={10} color="#FFF" />
                <Text style={[s.badgeT, { color: '#FFF' }]}>Now4Today</Text>
              </View>
            )}
          </View>

          {/* Image dots */}
          {displayImages.length > 1 && (
            <View style={s.dotsRow}>
              {displayImages.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setImgIdx(i)} activeOpacity={0.85}>
                  <View style={[s.dot, i === imgIdx && s.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Main Info */}
        <View style={s.section}>
          <Text style={s.title}>{mooring.name}</Text>
          <View style={s.locRow}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={s.locText}>{mooring.location}, {mooring.country} {mooring.country_flag}</Text>
          </View>

          {/* Price */}
          <View style={s.priceRow}>
            <Text style={s.price}>€{pricePerNight}</Text>
            <Text style={s.priceUnit}>/night</Text>
            {hasDiscount && (
              <View style={[s.badge, { backgroundColor: COLORS.red, marginLeft: 8 }]}>
                <Text style={[s.badgeT, { color: '#FFF' }]}>-{mooring.discount_percent}%</Text>
              </View>
            )}
          </View>

          {/* Rating + Wind */}
          <View style={s.metaRow}>
            {Number(mooring.rating) > 0 && (
              <View style={s.metaChip}>
                <Ionicons name="star" size={14} color={COLORS.gold} />
                <Text style={s.metaVal}>{Number(mooring.rating).toFixed(1)}</Text>
                <Text style={s.metaSub}>({mooring.review_count})</Text>
              </View>
            )}
            <View style={[s.metaChip, { backgroundColor: wind.bg, borderColor: wind.color + '30' }]}>
              <Ionicons name="shield-checkmark" size={14} color={wind.color} />
              <Text style={[s.metaVal, { color: wind.color }]}>{wind.label}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {mooring.description && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📝 Description</Text>
            <Text style={s.descText}>{mooring.description}</Text>
          </View>
        )}

        {/* Specs */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📏 Specifications</Text>
          <View style={s.specGrid}>
            {[
              { icon: 'resize-outline', label: 'Max Length', val: mooring.max_boat_length ? `${mooring.max_boat_length}m` : '—' },
              { icon: 'water-outline', label: 'Max Draft', val: mooring.max_draft ? `${mooring.max_draft}m` : '—' },
              { icon: 'apps-outline', label: 'Berths', val: mooring.mooring_units?.toString() || '—' },
              { icon: 'shield-checkmark-outline', label: 'Wind Prot.', val: mooring.wind_protection || '—' },
            ].map(sp => (
              <View key={sp.label} style={s.specCard}>
                <Ionicons name={sp.icon as any} size={18} color={COLORS.primary} />
                <Text style={s.specVal}>{sp.val}</Text>
                <Text style={s.specLabel}>{sp.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Amenities */}
        {mooring.amenities?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🛠️ Amenities</Text>
            <View style={s.amenityGrid}>
              {mooring.amenities.map(a => {
                const info = AMENITY_MAP[a];
                return (
                  <View key={a} style={s.amenityItem}>
                    <Text style={{ fontSize: 18 }}>{info?.icon || '✓'}</Text>
                    <Text style={s.amenityLabel}>{info?.label || a}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Contact */}
        {mooring.owner_name && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>👤 Host</Text>
            <View style={s.hostCard}>
              <View style={s.hostAvatar}>
                <Text style={{ fontSize: 22 }}>{mooring.owner_name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={FONTS.h3}>{mooring.owner_name}</Text>
                {mooring.owner_phone && (
                  <Text style={FONTS.caption}>{mooring.owner_phone}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Booking Form */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.bookToggle}
            onPress={() => setShowForm(!showForm)}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={{ ...FONTS.h3, color: COLORS.primary }}>
                {showForm ? 'Hide Booking Form' : 'Book This Mooring'}
              </Text>
            </View>
            <Ionicons name={showForm ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.primary} />
          </TouchableOpacity>

          {showForm && (
            <View style={s.formWrap}>
              <Text style={s.formLabel}>📅 Check-in</Text>
              <TouchableOpacity style={s.formInput} onPress={() => setShowCheckIn(true)} activeOpacity={0.85}>
                <Text style={{ color: checkIn ? COLORS.text : COLORS.textDim, fontSize: 15 }}>
                  {checkIn ? formatDate(checkIn) : 'Select check-in date'}
                </Text>
              </TouchableOpacity>
              {showCheckIn && (
                <DateTimePicker
                  value={checkIn || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowCheckIn(Platform.OS === 'ios');
                    if (selectedDate) setCheckIn(selectedDate);
                  }}
                />
              )}

              <Text style={s.formLabel}>📅 Check-out</Text>
              <TouchableOpacity style={s.formInput} onPress={() => setShowCheckOut(true)} activeOpacity={0.85}>
                <Text style={{ color: checkOut ? COLORS.text : COLORS.textDim, fontSize: 15 }}>
                  {checkOut ? formatDate(checkOut) : 'Select check-out date'}
                </Text>
              </TouchableOpacity>
              {showCheckOut && (
                <DateTimePicker
                  value={checkOut || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={checkIn || new Date()}
                  onChange={(event, selectedDate) => {
                    setShowCheckOut(Platform.OS === 'ios');
                    if (selectedDate) setCheckOut(selectedDate);
                  }}
                />
              )}

              <Text style={s.formLabel}>⛵ Boat Name</Text>
              <TextInput style={s.formInput} value={boatName} onChangeText={setBoatName}
                placeholder="Sea Breeze" placeholderTextColor={COLORS.textDim} />

              <Text style={s.formLabel}>📏 Boat Length (m)</Text>
              <TextInput style={s.formInput} value={boatLength} onChangeText={setBoatLength}
                placeholder="12.5" placeholderTextColor={COLORS.textDim} keyboardType="decimal-pad" />

              <Text style={s.formLabel}>👤 Guest Name *</Text>
              <TextInput style={s.formInput} value={guestName} onChangeText={setGuestName}
                placeholder="John Doe" placeholderTextColor={COLORS.textDim} />

              <Text style={s.formLabel}>✉️ Email *</Text>
              <TextInput style={s.formInput} value={guestEmail} onChangeText={setGuestEmail}
                placeholder="you@email.com" placeholderTextColor={COLORS.textDim}
                keyboardType="email-address" autoCapitalize="none" />

              <Text style={s.formLabel}>📞 Phone</Text>
              <TextInput style={s.formInput} value={guestPhone} onChangeText={setGuestPhone}
                placeholder="+385 91 000 0000" placeholderTextColor={COLORS.textDim}
                keyboardType="phone-pad" />

              {/* Price Summary */}
              {nights > 0 && (
                <View style={s.priceSummary}>
                  <View style={s.priceLineRow}>
                    <Text style={s.priceLineLabel}>€{pricePerNight} × {nights} nights</Text>
                    <Text style={s.priceLineVal}>€{totalPrice.toFixed(2)}</Text>
                  </View>
                  <View style={[s.priceLineRow, s.priceTotalRow]}>
                    <Text style={s.priceTotalLabel}>Total</Text>
                    <Text style={s.priceTotalVal}>€{totalPrice.toFixed(2)}</Text>
                  </View>
                </View>
              )}

              {/* Book Button */}
              <TouchableOpacity
                style={[s.bookBtn, (booking || nights <= 0) && { opacity: 0.5 }]}
                onPress={handleBook}
                disabled={booking || nights <= 0}
                activeOpacity={0.85}
              >
                {booking ? (
                  <ActivityIndicator color={COLORS.bg} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.bg} />
                    <Text style={s.bookBtnText}>
                      {nights > 0 ? `Book Now — €${totalPrice.toFixed(2)}` : 'Select dates to book'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  imageWrap: { position: 'relative', height: 280 },
  heroImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(10,14,23,0.6)' },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 16, left: 16,
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(10,14,23,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  favBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 16, right: 60,
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(10,14,23,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  badgeRow: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 16, right: 16, flexDirection: 'row', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  badgeT: { fontSize: 10, fontWeight: '800' },
  dotsRow: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textDim },
  dotActive: { backgroundColor: COLORS.primary, width: 20 },
  section: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  title: { color: COLORS.text, fontWeight: '900', fontSize: 24, letterSpacing: -0.5 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  locText: { color: COLORS.textSecondary, fontSize: 15 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.sm },
  price: { color: COLORS.primary, fontWeight: '900', fontSize: 28 },
  priceUnit: { color: COLORS.textMuted, fontSize: 14, marginLeft: 4 },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.card, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  metaVal: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  metaSub: { color: COLORS.textMuted, fontSize: 11 },
  sectionTitle: { ...FONTS.h3, marginBottom: SPACING.sm },
  descText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  specCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm, flexGrow: 1, flexBasis: '45%',
  },
  specVal: { color: COLORS.text, fontWeight: '800', fontSize: 16, marginTop: 6 },
  specLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  amenityItem: { alignItems: 'center', width: 70, gap: 4 },
  amenityLabel: { color: COLORS.textSecondary, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  hostCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, ...SHADOWS.sm,
  },
  hostAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
  },
  bookToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary + '40',
    padding: SPACING.md, ...SHADOWS.sm,
  },
  formWrap: { marginTop: SPACING.md },
  formLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: SPACING.sm },
  formInput: {
    backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: COLORS.text, fontSize: 15,
  },
  priceSummary: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, marginTop: SPACING.md,
  },
  priceLineRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  priceLineLabel: { color: COLORS.textSecondary, fontSize: 14 },
  priceLineVal: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  priceTotalRow: { borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: 8, marginTop: 4, marginBottom: 0 },
  priceTotalLabel: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  priceTotalVal: { color: COLORS.primary, fontWeight: '900', fontSize: 20 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 16, marginTop: SPACING.md,
    ...SHADOWS.glow(COLORS.primary),
  },
  bookBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 16 },
});
