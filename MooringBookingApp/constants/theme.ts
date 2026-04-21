import { Platform } from 'react-native';

// ── Color Palette — Ocean-Blue Brand ──
export const COLORS = {
  // Backgrounds — rich midnight base
  bg: '#0A0E17',
  bgSecondary: '#0F1520',
  card: '#141B2D',
  cardBorder: '#1E293B',
  cardElevated: '#192033',

  // Primary — ocean blue brand accent
  primary: '#0EA5E9',
  primaryDim: '#0284C7',
  primaryGlow: 'rgba(14, 165, 233, 0.15)',
  primaryGlowStrong: 'rgba(14, 165, 233, 0.25)',

  // Secondary accent — teal
  secondary: '#06B6D4',
  secondaryDim: '#0891B2',

  // Gold — premium / last-minute
  gold: '#FBBF24',
  goldGlow: 'rgba(251, 191, 36, 0.15)',

  // Text hierarchy
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textDim: '#475569',

  // Semantic
  green: '#22C55E',
  greenGlow: 'rgba(34, 197, 94, 0.15)',
  yellow: '#FBBF24',
  yellowGlow: 'rgba(251, 191, 36, 0.15)',
  red: '#EF4444',
  redGlow: 'rgba(239, 68, 68, 0.15)',
  blue: '#3B82F6',
  blueGlow: 'rgba(59, 130, 246, 0.15)',
  purple: '#A855F7',
  purpleGlow: 'rgba(168, 85, 247, 0.15)',
  orange: '#F97316',
  orangeGlow: 'rgba(249, 115, 22, 0.15)',
  cyan: '#06B6D4',
  white: '#FFFFFF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const FONTS = {
  hero:    { fontSize: 28, fontWeight: '900' as const, letterSpacing: -0.5, color: COLORS.text },
  h1:      { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.3, color: COLORS.text },
  h2:      { fontSize: 20, fontWeight: '700' as const, color: COLORS.text },
  h3:      { fontSize: 16, fontWeight: '700' as const, color: COLORS.text },
  body:    { fontSize: 14, fontWeight: '400' as const, color: COLORS.textSecondary, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, color: COLORS.textMuted },
  tiny:    { fontSize: 10, fontWeight: '600' as const, color: COLORS.textMuted },
};

export const SHADOWS = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16 },
    android: { elevation: 8 },
    default: {},
  }),
  glow: (color: string) => Platform.select({
    ios: { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12 },
    android: { elevation: 6 },
    default: {},
  }),
};
