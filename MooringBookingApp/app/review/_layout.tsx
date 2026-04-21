import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function ReviewLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: COLORS.bg },
      headerTintColor: COLORS.text,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: COLORS.bg },
    }} />
  );
}
