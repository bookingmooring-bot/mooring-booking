import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLORS } from '../constants/theme';
import { AuthProvider } from '../lib/authContext';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '800' as const, color: COLORS.text },
          contentStyle: { backgroundColor: COLORS.bg },
          headerShadowVisible: false,
        }}>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="mooring" options={{ headerShown: false }} />
          <Stack.Screen name="add-mooring" options={{ headerShown: false }} />
          <Stack.Screen name="booking" options={{ headerShown: false }} />
          <Stack.Screen name="review" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
