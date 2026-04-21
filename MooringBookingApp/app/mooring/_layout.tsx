import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function MooringLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: COLORS.bg },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '800' },
      contentStyle: { backgroundColor: COLORS.bg },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
