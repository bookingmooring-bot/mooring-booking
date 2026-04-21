import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions, Alert, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../constants/theme';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

function GlowOrb({ color, size, top, left }: { color: string; size: number; top: number; left: number }) {
  return (
    <View style={{
      position: 'absolute', top, left,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: 0.08,
    }} />
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || '' } },
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for verification link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'mooringbooking://auth/callback',
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, 'mooringbooking://auth/callback');
        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.slice(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            router.replace('/(tabs)');
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Google sign-in failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Glow Orbs */}
      <GlowOrb color={COLORS.primary} size={300} top={-80} left={-80} />
      <GlowOrb color={COLORS.cyan} size={200} top={100} left={width - 60} />
      <GlowOrb color={COLORS.purple} size={250} top={500} left={-120} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Area */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/logo.jpg')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.logoTitle}>Mooring Booking</Text>
            <Text style={styles.logoSubtitle}>Mediterranean's #1 Mooring Marketplace</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === 'signin' && styles.tabActive]}
              onPress={() => setMode('signin')}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => setMode('signup')}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Google OAuth */}
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth} activeOpacity={0.85}>
            <Ionicons name="logo-google" size={20} color={COLORS.text} />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form Fields */}
          {mode === 'signup' && (
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.textDim}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.85}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaBtn, loading && { opacity: 0.6 }]}
            onPress={handleEmailAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <Text style={styles.ctaBtnText}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingTop: 60, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle: {
    width: 120, height: 120, borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.glow(COLORS.primary),
  },
  logoImage: { width: '100%', height: '100%' },
  logoTitle: { ...FONTS.hero, color: COLORS.text },
  logoSubtitle: { ...FONTS.caption, color: COLORS.textMuted, marginTop: SPACING.xs },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: COLORS.bg, fontWeight: '800' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: COLORS.cardBorder, paddingVertical: 14, ...SHADOWS.sm,
  },
  googleText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { color: COLORS.textMuted, fontSize: 12, marginHorizontal: SPACING.md },
  fieldWrap: { marginBottom: SPACING.md },
  fieldLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm,
  },
  inputIcon: { fontSize: 14, marginRight: 8 },
  input: {
    flex: 1, paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: COLORS.text, fontSize: 15,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 16, marginTop: SPACING.lg,
    ...SHADOWS.glow(COLORS.primary),
  },
  ctaBtnText: { color: COLORS.bg, fontWeight: '800', fontSize: 16 },
  footer: {
    color: COLORS.textDim, fontSize: 11, textAlign: 'center',
    marginTop: SPACING.lg, lineHeight: 16,
  },
});
