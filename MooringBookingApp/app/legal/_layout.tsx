import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function LegalLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: COLORS.bg },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '700' },
      headerShadowVisible: false,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      )
    }}>
      <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
    </Stack>
  );
}
