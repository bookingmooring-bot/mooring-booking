import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface Props {
  qualityId: string;
}

export default function FeedbackButtons({ qualityId }: Props) {
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [sending, setSending] = useState(false);

  const send = async (value: 1 | -1) => {
    if (sending || rating !== null) return;
    setSending(true);
    setRating(value);
    const { error } = await supabase.rpc('rate_ai_response', { p_quality_id: qualityId, p_rating: value });
    setSending(false);
    if (error) setRating(null);
  };

  if (rating !== null) {
    return <Text style={styles.thanks}>Hvala na povratnoj informaciji!</Text>;
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => send(1)} disabled={sending} style={styles.btn} activeOpacity={0.7}>
        <Ionicons name="thumbs-up-outline" size={14} color={COLORS.green} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => send(-1)} disabled={sending} style={styles.btn} activeOpacity={0.7}>
        <Ionicons name="thumbs-down-outline" size={14} color={COLORS.red} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.sm, marginTop: 6 },
  btn: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bgSecondary,
  },
  thanks: { color: COLORS.textMuted, fontSize: 10, marginTop: 6 },
});
