import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { Intent, SourceCitation } from '../lib/aiCaptainPayload';

interface Props {
  intent?: Intent;
  confidence?: number;
  sources?: SourceCitation[];
}

const INTENT_EMOJI: Record<Intent, string> = {
  SEARCH_MOORING: '⚓',
  DIAGNOSE_ENGINE: '🛠️',
  CHECK_WEATHER: '🌬️',
  EMERGENCY: '🆘',
  BOOKING_HELP: '📝',
  NAVIGATION_ROUTE: '🧭',
  GENERAL_CHAT: '💬',
};

const INTENT_LABEL: Record<Intent, string> = {
  SEARCH_MOORING: 'Mooring search',
  DIAGNOSE_ENGINE: 'Engine diagnostic',
  CHECK_WEATHER: 'Weather',
  EMERGENCY: 'Emergency',
  BOOKING_HELP: 'Booking help',
  NAVIGATION_ROUTE: 'Navigation',
  GENERAL_CHAT: 'Chat',
};

const SOURCE_EMOJI: Record<SourceCitation['type'], string> = {
  rpc: '🗄️',
  kb: '📚',
  windy: '🌦️',
  system: '⚙️',
};

export default function MessageMeta({ intent, confidence, sources }: Props) {
  const [open, setOpen] = useState(false);

  const showIntent = intent && intent !== 'GENERAL_CHAT';
  const showWarning = typeof confidence === 'number' && confidence < 0.5;
  const showSources = Array.isArray(sources) && sources.length > 0;

  if (!showIntent && !showWarning && !showSources) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showIntent && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {INTENT_EMOJI[intent!]} {INTENT_LABEL[intent!]}
            </Text>
          </View>
        )}
        {showWarning && (
          <View style={[styles.chip, styles.warningChip]}>
            <Text style={[styles.chipText, styles.warningText]}>⚠️ Verify with pilot book</Text>
          </View>
        )}
        {showSources && (
          <TouchableOpacity style={styles.chip} onPress={() => setOpen((v) => !v)} activeOpacity={0.7}>
            <Text style={styles.chipText}>
              {open ? '▼' : '▶'} Sources · {sources!.length}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {showSources && open && (
        <View style={styles.sourcesList}>
          {sources!.map((s, i) => (
            <View key={i} style={styles.sourceItem}>
              <Text style={styles.sourceEmoji}>{SOURCE_EMOJI[s.type]}</Text>
              <View style={{ flex: 1 }}>
                {s.url ? (
                  <TouchableOpacity onPress={() => Linking.openURL(s.url!)}>
                    <Text style={styles.sourceLink}>{s.title} ↗</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.sourceTitle}>{s.title}</Text>
                )}
                {s.detail ? <Text style={styles.sourceDetail}>{s.detail}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.bgSecondary,
  },
  chipText: { color: COLORS.textMuted, fontSize: 10 },
  warningChip: { borderColor: COLORS.orange, backgroundColor: COLORS.orangeGlow },
  warningText: { color: COLORS.orange },
  sourcesList: {
    marginTop: 6,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.bgSecondary,
    gap: 4,
  },
  sourceItem: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  sourceEmoji: { fontSize: 11 },
  sourceTitle: { color: COLORS.text, fontSize: 11, fontWeight: '600' },
  sourceLink: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  sourceDetail: { color: COLORS.textMuted, fontSize: 10 },
});
