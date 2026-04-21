import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function PricingScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ subscription_tier: 'premium' }).eq('id', user.id);
      if (error) throw error;
      
      Alert.alert('✅ Upgrade Successful!', 'You are now a PRO Host. Your moorings will have priority placement.', [
        { text: 'Awesome', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Upgrade to PRO', headerStyle: { backgroundColor: COLORS.bg }, headerShadowVisible: false, headerTintColor: COLORS.text }} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <Text style={styles.planTitle}>Basic Host</Text>
          <Text style={styles.planPrice}>$0<Text style={{ fontSize: 16 }}> / month</Text></Text>
          <View style={styles.featureLine}>
            <Ionicons name="checkmark" size={18} color={COLORS.textDim} />
            <Text style={styles.featureTextDisabled}>Standard search placement</Text>
          </View>
          <View style={styles.featureLine}>
            <Ionicons name="checkmark" size={18} color={COLORS.textDim} />
            <Text style={styles.featureTextDisabled}>15% platform fee</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardPro]}>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>MOST POPULAR</Text></View>
          <Text style={styles.planTitle}>PRO Host</Text>
          <Text style={styles.planPrice}>$12<Text style={{ fontSize: 16 }}> / month</Text></Text>
          
          <View style={styles.featureLine}>
            <Ionicons name="star" size={18} color={COLORS.primary} />
            <Text style={styles.featureText}>Priority placement in Map search</Text>
          </View>
          <View style={styles.featureLine}>
            <Ionicons name="trending-down" size={18} color={COLORS.primary} />
            <Text style={styles.featureText}>Reduced 5% platform fee</Text>
          </View>
          <View style={styles.featureLine}>
            <Ionicons name="analytics" size={18} color={COLORS.primary} />
            <Text style={styles.featureText}>Advanced Analytics in Dashboard</Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleUpgrade} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={COLORS.bg} /> : (
              <Text style={styles.btnText}>Upgrade to PRO</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: 60, gap: SPACING.lg },
  card: { padding: SPACING.xl, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardPro: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10', borderWidth: 2, ...SHADOWS.md },
  proBadge: { position: 'absolute', top: -12, right: 20, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  proBadgeText: { color: COLORS.bg, fontSize: 10, fontWeight: '800' },
  planTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  planPrice: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xl },
  featureLine: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  featureText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  featureTextDisabled: { fontSize: 15, color: COLORS.textDim },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.lg },
  btnText: { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
});
