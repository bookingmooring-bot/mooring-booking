import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

interface BookingInfo {
  id: string;
  mooring_id: string;
  check_in: string;
  check_out: string;
  moorings?: { name: string; location: string; country: string };
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(star);
          }}
          activeOpacity={0.7}
          style={styles.starBtn}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={38}
            color={star <= value ? COLORS.gold : COLORS.cardBorder}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent!',
};

const QUICK_TAGS = [
  '🌊 Great location', '⚡ Clean facilities', '💧 Good water quality',
  '🔒 Safe & secure', '👤 Friendly host', '📶 Good WiFi',
  '⚓ Easy to dock', '🍽️ Restaurant nearby', '🚿 Clean showers',
];

export default function LeaveReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!bookingId) return;
    supabase
      .from('bookings')
      .select('id, mooring_id, check_in, check_out, moorings (name, location, country)')
      .eq('id', bookingId)
      .single()
      .then(({ data }) => {
        if (data) setBooking(data as unknown as BookingInfo);
        setLoading(false);
      });
  }, [bookingId]);

  const toggleTag = (tag: string) => {
    Haptics.selectionAsync();
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }
    if (!user || !booking) return;

    setSubmitting(true);
    try {
      const reviewText = [
        ...selectedTags,
        comment.trim(),
      ].filter(Boolean).join(' · ');

      const { error } = await supabase.from('reviews').insert({
        mooring_id: booking.mooring_id,
        booking_id: booking.id,
        user_id: user.id,
        rating,
        comment: reviewText || null,
      });

      if (error) throw error;

      // Update mooring average rating
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('mooring_id', booking.mooring_id);

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await supabase.from('moorings').update({
          rating: Math.round(avg * 10) / 10,
          review_count: allReviews.length,
        }).eq('id', booking.mooring_id);
      }

      Alert.alert('✅ Thank you!', 'Your review has been submitted.', [
        { text: 'Done', onPress: () => router.replace('/(tabs)/bookings') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
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
      <Stack.Screen options={{
        title: 'Leave a Review',
        headerStyle: { backgroundColor: COLORS.bg },
        headerShadowVisible: false,
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '800' },
      }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Mooring Info Header */}
        {booking && (
          <View style={styles.bookingCard}>
            <View style={styles.bookingIconWrap}>
              <Ionicons name="boat" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mooringName} numberOfLines={1}>
                {booking.moorings?.name || 'Mooring'}
              </Text>
              <Text style={styles.mooringLoc}>
                {booking.moorings?.location}, {booking.moorings?.country}
              </Text>
              <Text style={styles.dates}>
                {booking.check_in} – {booking.check_out}
              </Text>
            </View>
          </View>
        )}

        {/* Stars */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How was your stay?</Text>
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
          )}
        </View>

        {/* Quick Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What stood out? (optional)</Text>
          <View style={styles.tagsWrap}>
            {QUICK_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.85}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Add a comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience — help other sailors..."
            placeholderTextColor={COLORS.textDim}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (submitting || rating === 0) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <>
              <Ionicons name="star" size={18} color={COLORS.bg} />
              <Text style={styles.submitText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Reviews are public and help our community find the best moorings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.md, paddingBottom: 100 },

  bookingCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.md, marginBottom: SPACING.xl, ...SHADOWS.sm,
  },
  bookingIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
  },
  mooringName: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  mooringLoc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  dates: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },

  section: { marginBottom: SPACING.xl },
  sectionLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },

  starRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: SPACING.md },
  starBtn: { padding: 4 },
  ratingLabel: {
    textAlign: 'center', color: COLORS.gold,
    fontWeight: '800', fontSize: 18, letterSpacing: -0.3,
    marginTop: SPACING.xs,
  },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  tagActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  tagText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  tagTextActive: { color: COLORS.primary, fontWeight: '700' },

  commentInput: {
    backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md, padding: SPACING.md,
    color: COLORS.text, fontSize: 14, lineHeight: 20,
    minHeight: 120, textAlignVertical: 'top',
  },
  charCount: { color: COLORS.textDim, fontSize: 11, textAlign: 'right', marginTop: 4 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 16, marginBottom: SPACING.md,
    ...SHADOWS.glow(COLORS.primary),
  },
  submitText: { color: COLORS.bg, fontWeight: '800', fontSize: 16 },
  disclaimer: { color: COLORS.textDim, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
