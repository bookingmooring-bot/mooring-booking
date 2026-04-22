import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import type { WeatherData } from '../lib/aiCaptainPayload';

interface Props {
  weather: WeatherData;
}

const beaufortColor = (bft: number): string => {
  if (bft <= 3) return COLORS.green;
  if (bft <= 5) return COLORS.yellow;
  if (bft <= 7) return COLORS.orange;
  return COLORS.red;
};

export default function WeatherCard({ weather }: Props) {
  if (!weather?.ok) return null;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.tile}>
          <Ionicons name="navigate" size={14} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.value}>{weather.windKnots.toFixed(1)} kn</Text>
            <Text style={styles.sub}>
              gust {weather.gustKnots.toFixed(1)} ·{' '}
              <Text style={{ color: beaufortColor(weather.beaufort) }}>Bft {weather.beaufort}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.tile}>
          <Ionicons name="thermometer" size={14} color={COLORS.red} />
          <View style={{ flex: 1 }}>
            <Text style={styles.value}>{weather.tempC.toFixed(1)}°C</Text>
            <Text style={styles.sub}>dew {weather.dewpointC.toFixed(1)}°</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.tile}>
          <Ionicons name="speedometer" size={14} color={COLORS.purple} />
          <View style={{ flex: 1 }}>
            <Text style={styles.value}>{weather.pressurehPa} hPa</Text>
            <Text style={styles.sub}>sea-level</Text>
          </View>
        </View>

        <View style={styles.tile}>
          <Ionicons name="water" size={14} color={COLORS.cyan} />
          <View style={{ flex: 1 }}>
            <Text style={styles.value}>{weather.waveM.toFixed(1)} m</Text>
            <Text style={styles.sub}>swell {weather.swellM.toFixed(1)} m</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.bgSecondary,
    gap: 6,
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
  tile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  sub: { color: COLORS.textMuted, fontSize: 10 },
});
