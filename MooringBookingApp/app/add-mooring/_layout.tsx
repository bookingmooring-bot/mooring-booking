import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function AddMooringLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.bg },
    }} />
  );
}
