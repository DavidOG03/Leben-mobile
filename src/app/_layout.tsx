import '@/global.css';
import { useEffect }       from 'react';
import { Slot, useRouter, useSegments, DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar }       from 'expo-status-bar';
import { View }            from 'react-native';

import { useAuthSync }      from '@/hooks/useAuthSync';
import { useLoadUserData }  from '@/hooks/useLoadUserData';
import { useNotifications } from '@/hooks/useNotifications';
import { useLebenStore }    from '@/store/useStore';

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

export default function RootLayout() {
  useAuthSync();
  useLoadUserData();
  useNotifications();

  return (
    <ThemeProvider value={LebenTheme}>
      <View className="flex-1 bg-leben-bg">
        {/* @ts-ignore */}
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        <AuthGuard />
        <Slot />
      </View>
    </ThemeProvider>
  );
}

