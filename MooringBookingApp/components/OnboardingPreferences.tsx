import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { saveMyPreferences } from '../lib/aiPreferences';
import type { AnswerStyle, ExperienceLevel, AiCaptainPreferences } from '../lib/aiCaptainPayload';

interface Props {
  onDone: (prefs: AiCaptainPreferences) => void;
}

const STYLE_OPTIONS: { id: AnswerStyle; label: string; hint: string }[] = [
  { id: 'bullets', label: 'Bullet points', hint: 'Short & quick' },
  { id: 'balanced', label: 'Balanced', hint: 'Medium length' },
  { id: 'detailed', label: 'Detailed', hint: 'Long answers' },
];

const LEVEL_OPTIONS: { id: ExperienceLevel; label: string; hint: string }[] = [
  { id: 'beginner', label: 'Beginner', hint: 'New to sailing' },
  { id: 'intermediate', label: 'Intermediate', hint: 'Sail occasionally' },
  { id: 'advanced', label: 'Advanced', hint: 'Sail regularly' },
  { id: 'professional', label: 'Professional', hint: 'Certified captain' },
];

export default function OnboardingPreferences({ onDone }: Props) {
  const [style, setStyle] = useState<AnswerStyle | null>(null);
  const [level, setLevel] = useState<ExperienceLevel | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = style !== null && level !== null && !saving;

  const submit = async () => {
    if (!style || !level) return;
    setSaving(true);
    const prefs: AiCaptainPreferences = { answerStyle: style, experienceLevel: level };
    const ok = await saveMyPreferences(prefs);
    setSaving(false);
    if (ok) onDone(prefs);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Before your first message</Text>
      <Text style={styles.subtitle}>Set up AI Captain. Saved once, used forever.</Text>

      <Text style={styles.sectionLabel}>ANSWER STYLE</Text>
      <View style={styles.gridRow}>
        {STYLE_OPTIONS.map((opt) => {
          const active = style === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setStyle(opt.id)}
              style={[styles.optBox, styles.optBoxSmall, active && styles.optBoxActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.optLabel, active && styles.optLabelActive]}>{opt.label}</Text>
              <Text style={[styles.optHint, active && styles.optHintActive]}>{opt.hint}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>EXPERIENCE LEVEL</Text>
      <View style={styles.gridTwo}>
        {LEVEL_OPTIONS.map((opt) => {
          const active = level === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setLevel(opt.id)}
              style={[styles.optBox, styles.optBoxHalf, active && styles.optBoxActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.optLabel, active && styles.optLabelActive]}>{opt.label}</Text>
              <Text style={[styles.optHint, active && styles.optHintActive]}>{opt.hint}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={submit}
        disabled={!canSubmit}
        style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.bg} />
        ) : (
          <Text style={styles.submitText}>Start chat →</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  title: { ...FONTS.h2, color: COLORS.text, fontWeight: '700' },
  subtitle: { ...FONTS.caption, color: COLORS.textDim, marginTop: 4, marginBottom: SPACING.lg },
  sectionLabel: {
    ...FONTS.caption, color: COLORS.textMuted,
    fontWeight: '600', letterSpacing: 0.5,
    marginTop: SPACING.md, marginBottom: SPACING.sm,
  },
  gridRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  gridTwo: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  optBox: {
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md, padding: SPACING.sm + 2,
    backgroundColor: COLORS.card,
  },
  optBoxSmall: { flex: 1, minWidth: 90 },
  optBoxHalf: { width: '48%' },
  optBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGlow,
  },
  optLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  optLabelActive: { color: COLORS.primary },
  optHint: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  optHintActive: { color: COLORS.primary, opacity: 0.8 },
  submitBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: COLORS.bg, fontWeight: '700', fontSize: 14 },
});
