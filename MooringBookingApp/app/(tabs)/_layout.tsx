import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../lib/authContext';
import { ActivityIndicator, View, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from '../../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TabLayout() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/auth');
    }
  }, [session, isLoading]);

  useEffect(() => {
    if (session?.user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          supabase.from('profiles').update({ expo_push_token: token }).eq('id', session.user.id).then();
        }
      });
    }
  }, [session]);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      try {
        const projectId = 'mooring-booking'; // EAS project slug
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (_e) {
        // Push token unavailable — silently skip (simulator or missing config)
      }
    }
    return token;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }
  if (!session) return null;

  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.cardBorder,
        borderTopWidth: 1,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        paddingTop: 8,
        ...SHADOWS.md,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textDim,
      headerStyle: { backgroundColor: COLORS.bg, ...SHADOWS.sm },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: -0.3 },
      headerShadowVisible: false,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
      tabBarIconStyle: { marginTop: 2 },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Explore',
        headerTitle: '⚓ Mooring Booking',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} />
        ),
      }} />
      <Tabs.Screen name="favorites" options={{
        title: 'Saved',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'heart' : 'heart-outline'} size={22} color={color} />
        ),
      }} />
      <Tabs.Screen name="ai-captain" options={{
        title: 'AI Captain',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
        ),
      }} />
      <Tabs.Screen name="bookings" options={{
        title: 'My Trips',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={22} color={color} />
        ),
      }} />
      {/* Hidden from tab bar — still routable */}
      <Tabs.Screen name="notifications" options={{
        title: 'Alerts',
        href: null,
      }} />
      <Tabs.Screen name="dashboard" options={{
        title: 'Dashboard',
        href: null,
      }} />
    </Tabs>
  );
}
