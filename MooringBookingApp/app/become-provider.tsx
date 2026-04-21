import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function BecomeProviderScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBecomeProvider = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ role: 'provider' }).eq('id', user.id);
      if (error) throw error;
      
      Alert.alert('✅ Congratulations!', 'You are now a Mooring Provider. You have gained access to the Dashboard to list your docks.', [
        { text: 'Go to Dashboard', onPress: () => router.replace('/(tabs)/dashboard') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Become a Provider', headerStyle: { backgroundColor: COLORS.bg }, headerShadowVisible: false, headerTintColor: COLORS.text }} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="home" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>List Your Mooring</Text>
        <Text style={styles.subtitle}>
          Turn your empty dock, buoy, or marina space into extra income. Join hundreds of hosts who manage reservations seamlessly using Mooring Booking.
        </Text>

        <View style={styles.features}>
          <View style={styles.featureLine}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
            <Text style={styles.featureText}>Set your own prices and availability</Text>
          </View>
          <View style={styles.featureLine}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
            <Text style={styles.featureText}>Approve or reject guests instantly</Text>
          </View>
          <View style={styles.featureLine}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
            <Text style={styles.featureText}>Direct payouts via Stripe Connect</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleBecomeProvider} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color={COLORS.bg} /> : (
            <Text style={styles.btnText}>Convert to Provider Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center' },
  iconContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xxl },
  features: { width: '100%', gap: SPACING.md },
  featureLine: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featureText: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  footer: { padding: SPACING.xl, paddingBottom: 40, borderTopWidth: 1, borderTopColor: COLORS.cardBorder, backgroundColor: COLORS.card },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.lg, alignItems: 'center', ...SHADOWS.md },
  btnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
});
