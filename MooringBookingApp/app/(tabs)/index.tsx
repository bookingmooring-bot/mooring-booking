import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  RefreshControl, Image, Dimensions, Platform,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const FAVORITES_KEY = '@mooring_favorites';

async function toggleFavorite(item: Mooring): Promise<boolean> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  const saved: Record<string, any> = raw ? JSON.parse(raw) : {};
  const isSaved = !!saved[item.id];
  if (isSaved) {
    delete saved[item.id];
  } else {
    saved[item.id] = { ...item, savedAt: Date.now() };
  }
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(saved));
  return !isSaved;
}

async function isFavorite(id: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return false;
  return !!JSON.parse(raw)[id];
}

const { width } = Dimensions.get('window');

interface Mooring {
  id: string;
  name: string;
  location: string;
  country: string;
  country_flag: string;
  price_per_night: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  image_urls: string[];
  amenities: string[];
  is_last_minute: boolean;
  is_now4today: boolean;
  wind_protection: string;
  description: string;
  lat: number;
  lng: number;
  owner_name: string;
  max_boat_length: number;
  max_draft: number;
  mooring_units: number;
}

// Fallback images for moorings without valid URLs
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&q=75',
  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=75',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=75',
  'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=600&q=75',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=75',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=75',
];

const AMENITY_MAP: Record<string, { icon: string; label: string }> = {
  water: { icon: '💧', label: 'Water' },
  electricity: { icon: '⚡', label: 'Power' },
  wifi: { icon: '📶', label: 'WiFi' },
  toilet: { icon: '🚻', label: 'WC' },
  shower: { icon: '🚿', label: 'Shower' },
  fuel: { icon: '⛽', label: 'Fuel' },
  restaurant: { icon: '🍽️', label: 'Food' },
  type_bova: { icon: '🔴', label: 'Buoy' },
  type_dok: { icon: '🏗️', label: 'Dock' },
  type_sidriste: { icon: '⚓', label: 'Anchorage' },
  type_vez_u_marini: { icon: '🏠', label: 'Marina' },
};

const WIND_COLORS: Record<string, { color: string; bg: string }> = {
  excellent: { color: COLORS.green, bg: COLORS.greenGlow },
  good: { color: COLORS.blue, bg: COLORS.blueGlow },
  moderate: { color: COLORS.yellow, bg: COLORS.yellowGlow },
  poor: { color: COLORS.red, bg: COLORS.redGlow },
};

function getImageUrl(item: Mooring, index: number): string {
  const url = item.image_urls?.[0];
  if (url && url.startsWith('http')) return url;
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  const r = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= r) stars.push(<Ionicons key={i} name="star" size={12} color={COLORS.gold} />);
    else if (i - 0.5 <= r) stars.push(<Ionicons key={i} name="star-half" size={12} color={COLORS.gold} />);
    else stars.push(<Ionicons key={i} name="star-outline" size={12} color={COLORS.textDim} />);
  }
  return <View style={{ flexDirection: 'row', gap: 1 }}>{stars}</View>;
}

function MooringCard({ item, index }: { item: Mooring; index: number }) {
  const imgUrl = getImageUrl(item, index);
  const wind = WIND_COLORS[item.wind_protection] || WIND_COLORS.moderate;
  const hasDiscount = item.discount_percent > 0;
  const originalPrice = hasDiscount ? Math.round(item.price_per_night / (1 - item.discount_percent / 100)) : null;
  const [fav, setFav] = useState(false);

  useEffect(() => {
    isFavorite(item.id).then(setFav);
  }, [item.id]);

  const handleFavToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nowSaved = await toggleFavorite(item);
    setFav(nowSaved);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/mooring/${item.id}`)}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imgUrl }} style={styles.cardImage} resizeMode="cover" />

        {/* Gradient overlay at bottom */}
        <View style={styles.imageGradient} />

        {/* Top badges */}
        <View style={styles.topBadgeRow}>
          {item.is_last_minute && (
            <View style={[styles.topBadge, { backgroundColor: COLORS.gold }]}>
              <Ionicons name="flash" size={10} color="#000" />
              <Text style={[styles.topBadgeText, { color: '#000' }]}>Last Minute</Text>
            </View>
          )}
          {item.is_now4today && (
            <View style={[styles.topBadge, { backgroundColor: COLORS.green }]}>
              <Ionicons name="flame" size={10} color="#FFF" />
              <Text style={[styles.topBadgeText, { color: '#FFF' }]}>Now4Today</Text>
            </View>
          )}
          {hasDiscount && (
            <View style={[styles.topBadge, { backgroundColor: COLORS.red }]}>
              <Text style={[styles.topBadgeText, { color: '#FFF' }]}>-{item.discount_percent}%</Text>
            </View>
          )}
        </View>

        {/* Favorite heart button */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={handleFavToggle}
          activeOpacity={0.85}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? COLORS.red : COLORS.text} />
        </TouchableOpacity>

        {/* Wind protection badge */}
        <View style={[styles.windBadge, { backgroundColor: wind.bg, borderColor: wind.color + '40' }]}>
          <Ionicons name="shield-checkmark" size={10} color={wind.color} />
          <Text style={[styles.windText, { color: wind.color }]}>{item.wind_protection}</Text>
        </View>

        {/* Price overlay */}
        <View style={styles.priceOverlay}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.priceMain}>€{item.price_per_night}</Text>
            <Text style={styles.priceUnit}>/night</Text>
          </View>
          {originalPrice && (
            <Text style={styles.priceOriginal}>€{originalPrice}</Text>
          )}
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.cardContent}>
        {/* Title & Location */}
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location" size={13} color={COLORS.primary} />
          <Text style={styles.locText} numberOfLines={1}>
            {item.location}, {item.country} {item.country_flag}
          </Text>
        </View>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          {Number(item.rating) > 0 ? (
            <>
              <StarRating rating={Number(item.rating)} />
              <Text style={styles.ratingNum}>{Number(item.rating).toFixed(1)}</Text>
              <Text style={styles.reviewNum}>({item.review_count} reviews)</Text>
            </>
          ) : (
            <View style={[styles.amenityPill, { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary + '30' }]}>
              <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '700' }}>✨ New</Text>
            </View>
          )}
          {item.owner_name && (
            <View style={styles.ownerChip}>
              <Ionicons name="person-circle-outline" size={11} color={COLORS.textMuted} />
              <Text style={styles.ownerText} numberOfLines={1}>{item.owner_name}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {item.description ? (
          <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {/* Boat specs row */}
        {(Number(item.max_boat_length) > 0 || Number(item.mooring_units) > 0) && (
          <View style={styles.specsRow}>
            {Number(item.max_boat_length) > 0 && (
              <View style={styles.specItem}>
                <Ionicons name="resize-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.specText}>Max {item.max_boat_length}m</Text>
              </View>
            )}
            {Number(item.max_draft) > 0 && (
              <View style={styles.specItem}>
                <Ionicons name="water-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.specText}>Draft {item.max_draft}m</Text>
              </View>
            )}
            {Number(item.mooring_units) > 0 && (
              <View style={styles.specItem}>
                <Ionicons name="apps-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.specText}>{item.mooring_units} berths</Text>
              </View>
            )}
          </View>
        )}

        {/* Amenities */}
        {item.amenities && item.amenities.length > 0 && (
          <View style={styles.amenityRow}>
            {item.amenities.slice(0, 6).map(a => {
              const info = AMENITY_MAP[a];
              return (
                <View key={a} style={styles.amenityPill}>
                  <Text style={styles.amenityIcon}>{info?.icon || '✓'}</Text>
                  <Text style={styles.amenityLabel}>{info?.label || a}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Country Quick Filter ──
const COUNTRIES = [
  { flag: '🌍', label: 'All' },
  { flag: '🇭🇷', label: 'Croatia' },
  { flag: '🇬🇷', label: 'Greece' },
  { flag: '🇮🇹', label: 'Italy' },
  { flag: '🇪🇸', label: 'Spain' },
  { flag: '🇫🇷', label: 'France' },
  { flag: '🇲🇪', label: 'Montenegro' },
  { flag: '🇹🇷', label: 'Turkey' },
  { flag: '🇸🇮', label: 'Slovenia' },
];

export default function ExploreScreen() {
  const [moorings, setMoorings] = useState<Mooring[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const fetchMoorings = useCallback(async (query?: string, country?: string) => {
    try {
      let qb = supabase
        .from('moorings')
        .select('*')
        .eq('status', 'active')
        .order('rating', { ascending: false });

      if (country && country !== 'All') {
        qb = qb.ilike('country', country);
      }
      if (query && query.trim().length > 0) {
        qb = qb.or(`name.ilike.%${query}%,location.ilike.%${query}%,country.ilike.%${query}%`);
      }

      const { data, error } = await qb.limit(50);
      if (error) throw error;
      setMoorings((data as Mooring[]) || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchMoorings().finally(() => setLoading(false));
  }, [fetchMoorings]);

  const handleSearch = () => {
    setLoading(true);
    fetchMoorings(searchQuery, selectedCountry).finally(() => setLoading(false));
  };

  const handleCountryFilter = (country: string) => {
    setSelectedCountry(country);
    setLoading(true);
    fetchMoorings(searchQuery, country).finally(() => setLoading(false));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMoorings(searchQuery, selectedCountry);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search moorings, cities, countries..."
            placeholderTextColor={COLORS.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchMoorings('', selectedCountry); }} activeOpacity={0.85}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Country filters */}
        <FlatList
          data={COUNTRIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c.label}
          contentContainerStyle={styles.countryRow}
          renderItem={({ item: c }) => (
            <TouchableOpacity
              style={[styles.countryPill, selectedCountry === c.label && styles.countryPillActive]}
              onPress={() => handleCountryFilter(c.label)}
              activeOpacity={0.85}
            >
              <Text style={styles.countryFlag}>{c.flag}</Text>
              <Text style={[styles.countryLabel, selectedCountry === c.label && styles.countryLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          <Text style={{ color: COLORS.text, fontWeight: '800' }}>{moorings.length}</Text>
          {' '}moorings {selectedCountry !== 'All' ? `in ${selectedCountry}` : 'available'}
        </Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={{ ...FONTS.caption, marginTop: SPACING.sm }}>Loading moorings...</Text>
        </View>
      ) : viewMode === 'list' ? (
        <FlatList
          data={moorings}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => <MooringCard item={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="boat-outline" size={36} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No moorings found</Text>
              <Text style={styles.emptySub}>Try a different search or country</Text>
              <TouchableOpacity style={styles.emptyCta} onPress={() => { setSearchQuery(''); setSelectedCountry('All'); fetchMoorings(); }} activeOpacity={0.85}>
                <Text style={styles.emptyCtaText}>Show All Moorings</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: moorings[0]?.lat || 44.0,
              longitude: moorings[0]?.lng || 15.0,
              latitudeDelta: 5.0,
              longitudeDelta: 5.0,
            }}
          >
            {moorings.map((item, index) => {
              if (!item.lat || !item.lng) return null;
              
              const hasDiscount = item.discount_percent > 0;
              const displayPrice = item.price_per_night;

              return (
                <Marker
                  key={item.id}
                  coordinate={{ latitude: item.lat, longitude: item.lng }}
                >
                  <View style={styles.markerContainer}>
                    <Text style={styles.markerText}>€{displayPrice}</Text>
                  </View>
                  <Callout onPress={() => router.push(`/mooring/${item.id}`)} tooltip>
                    <View style={styles.calloutCard}>
                      <Image source={{ uri: getImageUrl(item, index) }} style={styles.calloutImage} />
                      <Text style={styles.calloutTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.calloutPrice}>€{item.price_per_night}/night</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        </View>
      )}

      {/* View Toggle Button */}
      {!loading && moorings.length > 0 && (
        <TouchableOpacity
          style={styles.floatingToggleButton}
          activeOpacity={0.85}
          onPress={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
        >
          <Ionicons name={viewMode === 'list' ? 'map-outline' : 'list-outline'} size={20} color="#FFF" />
          <Text style={styles.floatingToggleButtonText}>
            {viewMode === 'list' ? 'Map' : 'List'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchSection: { paddingTop: SPACING.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginHorizontal: SPACING.md, paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 14 },
  countryRow: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  countryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.card, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  countryPillActive: { backgroundColor: COLORS.primaryGlowStrong, borderColor: COLORS.primary },
  countryFlag: { fontSize: 14 },
  countryLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  countryLabelActive: { color: COLORS.primary, fontWeight: '700' },
  statsRow: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xs },
  statsText: { ...FONTS.caption },
  list: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  // ── Card ──
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md, overflow: 'hidden', ...SHADOWS.md,
  },
  imageContainer: { position: 'relative', height: 200 },
  cardImage: { width: '100%', height: '100%' },
  imageGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
    backgroundColor: 'rgba(10,14,23,0.5)',
  },
  topBadgeRow: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    flexDirection: 'row', gap: 6,
  },
  topBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  topBadgeText: { fontSize: 10, fontWeight: '800' },
  heartBtn: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(10,14,23,0.7)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  windBadge: {
    position: 'absolute', top: SPACING.sm + 40, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1,
  },
  windText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  priceOverlay: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    backgroundColor: 'rgba(10,14,23,0.9)', borderRadius: RADIUS.md,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  priceMain: { color: COLORS.primary, fontWeight: '900', fontSize: 20 },
  priceUnit: { color: COLORS.textMuted, fontSize: 11, marginLeft: 2 },
  priceOriginal: { color: COLORS.textDim, fontSize: 11, textDecorationLine: 'line-through' },
  // ── Card Content ──
  cardContent: { padding: SPACING.md },
  cardName: { color: COLORS.text, fontWeight: '800', fontSize: 17, marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  locText: { color: COLORS.textSecondary, fontSize: 13, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ratingNum: { color: COLORS.gold, fontWeight: '800', fontSize: 13 },
  reviewNum: { color: COLORS.textMuted, fontSize: 11 },
  ownerChip: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  ownerText: { color: COLORS.textDim, fontSize: 10, maxWidth: 80 },
  descText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 8 },
  specsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: 8 },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  amenityIcon: { fontSize: 10 },
  amenityLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },
  // ── Empty ──
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  emptyTitle: { color: COLORS.text, fontWeight: '800', fontSize: 18 },
  emptySub: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  emptyCta: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 10,
    marginTop: SPACING.md, ...SHADOWS.glow(COLORS.primary),
  },
  emptyCtaText: { color: COLORS.bg, fontWeight: '800', fontSize: 14 },
  // ── Maps ──
  markerContainer: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  markerText: { color: COLORS.text, fontWeight: 'bold', fontSize: 13 },
  calloutCard: {
    width: 140,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    padding: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  calloutImage: { width: '100%', height: 80, borderRadius: RADIUS.sm, marginBottom: 4 },
  calloutTitle: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  calloutPrice: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  floatingToggleButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2330',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...SHADOWS.lg,
    gap: 6,
  },
  floatingToggleButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
