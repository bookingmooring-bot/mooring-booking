import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.date}>Last Updated: April 4, 2026</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information that you manually provide when creating an account, such as your full name, email address, physical address, and boat qualifications. If you are a provider, we also collect geolocation data and information related to your dock, marina, or buoy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. How We Use Your Data</Text>
        <Text style={styles.paragraph}>
          We use your data to facilitate bookings, manage accounts, provide customer support, and communicate essential transactional notifications (including push notifications). Your payment information is handled directly through Stripe and is never processed on our local databases.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Sharing Your Data</Text>
        <Text style={styles.paragraph}>
          We share necessary identification details (such as your name and boat dimensions) with Providers when you request a booking to allow them to assess and manage space. We do not sell or rent your personal data to third parties.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. User Rights (GDPR)</Text>
        <Text style={styles.paragraph}>
          You have the right to request access, rectification, or erasure of your personal data stored within our system. To initiate an account deletion or request a data export, please write to us at support@mooringbooking.com or use the delete function inside your settings.
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
