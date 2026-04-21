import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.date}>Last Updated: April 4, 2026</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using the Mooring Booking platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. Booking and Payments</Text>
        <Text style={styles.paragraph}>
          When you book a mooring through our platform, you agree to pay the listed price, including any applicable taxes and fees. All transactions are securely processed through Stripe. Non-refundable deposits may apply depending on the provider's policy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Provider Responsibilities</Text>
        <Text style={styles.paragraph}>
          Providers (boat owners or marina managers) must ensure that the listed moorings are available, safe, and accurately depicted. Any cancellation initiated by the provider must be communicated promptly to the user and platform administrators.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. Liability</Text>
        <Text style={styles.paragraph}>
          Mooring Booking acts as an intermediary. We are not liable for any damages to vessels, personal injury, or property loss during your stay at a listed mooring. Users and providers assume all risks associated with the usage of rented space.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  date: { fontSize: 14, color: COLORS.textDim, marginBottom: 24, fontWeight: '500' },
  section: { marginBottom: 24 },
  heading: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  paragraph: { fontSize: 16, color: COLORS.textMuted, lineHeight: 24 },
});
