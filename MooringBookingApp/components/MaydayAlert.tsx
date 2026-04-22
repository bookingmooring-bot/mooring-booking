import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { MaydayPayload } from '../lib/aiCaptainPayload';

interface Props {
  mayday: MaydayPayload;
}

export default function MaydayAlert({ mayday }: Props) {
  const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  const openUrl = (url: string) => Linking.openURL(url);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🆘 MAYDAY — {mayday.country}</Text>
      </View>

      <TouchableOpacity style={styles.primaryRow} onPress={() => call(mayday.mrccPhone)} activeOpacity={0.75}>
        <Ionicons name="call" size={18} color={COLORS.red} />
        <Text style={styles.primaryPhone}>{mayday.mrccPhone}</Text>
      </TouchableOpacity>

      {mayday.mrccAltPhone ? (
        <TouchableOpacity style={styles.secondaryRow} onPress={() => call(mayday.mrccAltPhone!)} activeOpacity={0.75}>
          <Ionicons name="call-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.secondaryPhone}>{mayday.mrccAltPhone}</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.row}>
        <Ionicons name="radio" size={14} color={COLORS.textSecondary} />
        <Text style={styles.vhf}>VHF Ch.{mayday.vhfChannel}</Text>
      </View>

      {mayday.coastGuard ? (
        <TouchableOpacity
          onPress={() => mayday.coastGuardUrl && openUrl(mayday.coastGuardUrl)}
          disabled={!mayday.coastGuardUrl}
          activeOpacity={0.7}
        >
          <Text style={styles.coastGuard}>
            {mayday.coastGuard}
            {mayday.coastGuardUrl ? ' ↗' : ''}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.red,
    backgroundColor: COLORS.redGlow,
    gap: 6,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { color: COLORS.red, fontWeight: '800', fontSize: 13 },
  primaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryPhone: { color: COLORS.red, fontWeight: '800', fontSize: 16 },
  secondaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secondaryPhone: { color: COLORS.textMuted, fontSize: 11 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vhf: { color: COLORS.textSecondary, fontSize: 13 },
  coastGuard: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
});
