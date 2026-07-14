import '@/global.css';
import { useEffect }       from 'react';
import { Slot, useRouter, useSegments, DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar }       from 'expo-status-bar';
import { View }            from 'react-native';

import { useAuthSync }      from '@/hooks/useAuthSync';
import { useLoadUserData }  from '@/hooks/useLoadUserData';
import { useNotifications } from '@/hooks/useNotifications';
import { useLebenStore }    from '@/store/useStore';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// ── Dark theme that matches Leben colours ────────────────────────────────────
const LebenTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary:    '#7c6af0',
    background: '#0a0a0a',
    card:       '#161616',
    text:       '#f0f0f0',
    border:     '#222222',
  },
};

function AuthGuard() {
  const userId   = useLebenStore((s) => s.userId);
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === ('(auth)' as any);

    if (!userId && !inAuthGroup) {
      router.replace('/(auth)/sign-in' as any);
    } else if (userId && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [userId, segments]);

  return null;
}

import NotificationManager from '@/components/shared/NotificationManager';
import NotificationDropdown from '@/components/shared/NotificationDropdown';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Geist': require('../../assets/fonts/Geist-Regular.otf'),
    'Geist-Medium': require('../../assets/fonts/Geist-Medium.otf'),
    'Geist-SemiBold': require('../../assets/fonts/Geist-SemiBold.otf'),
    'Geist-Bold': require('../../assets/fonts/Geist-Bold.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useAuthSync();
  useLoadUserData();
  useNotifications();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={LebenTheme}>
      <View className="flex-1 bg-leben-bg">
        {/* @ts-ignore */}
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        <AuthGuard />
        <Slot />
        <NotificationManager />
        <NotificationDropdown />
      </View>
    </ThemeProvider>
  );
}

