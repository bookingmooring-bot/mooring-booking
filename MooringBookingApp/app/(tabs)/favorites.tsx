import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const FAVORITES_KEY = '@mooring_favorites';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&q=75',
  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=75',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75',
];

export interface FavoriteItem {
  id: string;
  name: string;
  location: string;
  country: string;
  country_flag: string;
  price_per_night: number;
  rating: number;
  image_urls: string[];
  wind_protection: string;
  savedAt: number;
}

const WIND_COLORS: Record<string, { color: string; bg: string }> = {
  excellent: { color: COLORS.green, bg: COLORS.greenGlow },
  good:      { color: COLORS.blue,  bg: COLORS.blueGlow },
  moderate:  { color: COLORS.yellow,bg: COLORS.yellowGlow },
  poor:      { color: COLORS.red,   bg: COLORS.redGlow },
};

function getImage(item: FavoriteItem, idx: number) {
  const url = item.image_urls?.[0];
  if (url && url.startsWith('http')) return url;
  return FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
}

function FavoriteCard({ item, index, onRemove }: {
  item: FavoriteItem; index: number; onRemove: (id: string) => void;
}) {
  const wind = WIND_COLORS[item.wind_protection] || WIND_COLORS.moderate;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/mooring/${item.id}`)}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: getImage(item, index) }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.imageOverlay} />

        {/* Wind badge */}
        <View style={[styles.windBadge, { backgroundColor: wind.bg, borderColor: wind.color + '40' }]}>
          <Ionicons name="shield-checkmark" size={10} color={wind.color} />
          <Text style={[styles.windText, { color: wind.color }]}>{item.wind_protection}</Text>
        </View>

        {/* Remove heart */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => onRemove(item.id)}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart" size={18} color={COLORS.red} />
        </TouchableOpacity>

        {/* Price */}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>€{item.price_per_night}</Text>
          <Text style={styles.priceUnit}>/night</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location" size={13} color={COLORS.primary} />
          <Text style={styles.locText} numberOfLines={1}>
            {item.location}, {item.country} {item.country_flag}
          </Text>
        </View>
        {Number(item.rating) > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={COLORS.gold} />
            <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading]     = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (!raw) { setFavorites([]); setLoading(false); return; }

      const savedIds: Record<string, FavoriteItem> = JSON.parse(raw);
      const ids = Object.keys(savedIds);
      if (ids.length === 0) { setFavorites([]); setLoading(false); return; }

      // Re-fetch fresh data from DB to keep prices / availability up to date
      const { data } = await supabase.from('moorings').select('*').in('id', ids);
      const freshItems: FavoriteItem[] = (data || []).map((m: any) => ({
        ...m,
        savedAt: savedIds[m.id]?.savedAt || Date.now(),
      }));
      freshItems.sort((a, b) => b.savedAt - a.savedAt);
      setFavorites(freshItems);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadFavorites();
  }, [loadFavorites]));

  const handleRemove = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      delete saved[id];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(saved));
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch {}
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Remove all saved moorings?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(FAVORITES_KEY);
          setFavorites([]);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <View style={styles.loadSkeletonTop} />
          {[1, 2, 3].map(i => <View key={i} style={styles.loadSkeletonCard} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <FavoriteCard item={item} index={index} onRemove={handleRemove} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          favorites.length > 0 ? (
            <View style={styles.headerRow}>
              <Text style={styles.countText}>
                <Text style={{ color: COLORS.text, fontWeight: '800' }}>{favorites.length}</Text>
                {' '}saved {favorites.length === 1 ? 'mooring' : 'moorings'}
              </Text>
              <TouchableOpacity onPress={handleClearAll} activeOpacity={0.85}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="heart-outline" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved moorings yet</Text>
            <Text style={styles.emptySub}>
              Tap the ♡ on any mooring to save it here
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.85}
            >
              <Ionicons name="compass-outline" size={16} color={COLORS.bg} />
              <Text style={styles.emptyCtaText}>Explore Moorings</Text>
            </TouchableOpacity>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  countText: { ...FONTS.caption },
  clearText: { color: COLORS.red, fontSize: 13, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md, overflow: 'hidden', ...SHADOWS.md,
  },
  imageWrap: { position: 'relative', height: 180 },
  cardImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
    backgroundColor: 'rgba(10,14,23,0.5)',
  },
  windBadge: {
    position: 'absolute', top: SPACING.sm, left: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1,
  },
  windText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
  heartBtn: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(10,14,23,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  priceTag: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: 'rgba(10,14,23,0.9)', borderRadius: RADIUS.md,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  priceText: { color: COLORS.primary, fontWeight: '900', fontSize: 18 },
  priceUnit: { color: COLORS.textMuted, fontSize: 11, marginLeft: 2 },

  // Card content
  cardContent: { padding: SPACING.md, paddingTop: SPACING.sm + 4 },
  cardName: { color: COLORS.text, fontWeight: '800', fontSize: 16, marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  locText: { color: COLORS.textSecondary, fontSize: 13, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: { color: COLORS.text, fontWeight: '800', fontSize: 20, marginBottom: 8 },
  emptySub: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: SPACING.lg },
  emptyCta: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
    marginTop: SPACING.lg, ...SHADOWS.glow(COLORS.primary),
  },
  emptyCtaText: { color: COLORS.bg, fontWeight: '800', fontSize: 14 },

  // Loading skeleton
  loadingWrap: { padding: SPACING.md },
  loadSkeletonTop: {
    height: 20, width: 160, backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm, marginBottom: SPACING.md,
  },
  loadSkeletonCard: {
    height: 240, backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.md,
  },
});
