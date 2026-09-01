import "@/global.css";
import {
  DarkTheme,
  Slot,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-gesture-handler";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import { useAuthSync } from "@/hooks/useAuthSync";
import { useLoadUserData } from "@/hooks/useLoadUserData";
import { useNotifications } from "@/hooks/useNotifications";
import { useLebenStore } from "@/store/useStore";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";

SplashScreen.preventAutoHideAsync();

// ── Dark theme that matches Leben colours ────────────────────────────────────
const LebenTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "var(--accent-blue)",
    background: "var(--bg-primary)",
    card: "var(--bg-card)",
    text: "var(--text-primary)",
    border: "var(--border-primary)",
  },
};

function AuthGuard() {
  const userId = useLebenStore((s) => s.userId);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === ("(auth)" as any);

    if (userId && inAuthGroup) {
      router.replace("/(tabs)" as any);
    }
  }, [userId, segments]);

  return null;
}

import NotificationDropdown from "@/components/shared/NotificationDropdown";
import NotificationManager from "@/components/shared/NotificationManager";
import OverlayPermissionModal from "@/components/shared/OverlayPermissionModal";
import OfflineSyncManager from "@/components/OfflineSyncManager";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    "Geist-Thin": require("../../assets/fonts/Geist-Thin.otf"),
    "Geist-UltraLight": require("../../assets/fonts/Geist-UltraLight.otf"),
    "Geist-Light": require("../../assets/fonts/Geist-Light.otf"),
    Geist: require("../../assets/fonts/Geist-Regular.otf"),
    "Geist-Medium": require("../../assets/fonts/Geist-Medium.otf"),
    "Geist-SemiBold": require("../../assets/fonts/Geist-SemiBold.otf"),
    "Geist-Bold": require("../../assets/fonts/Geist-Bold.otf"),
    "Geist-Black": require("../../assets/fonts/Geist-Black.otf"),
    "Geist-UltraBlack": require("../../assets/fonts/Geist-UltraBlack.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useAuthSync();
  useLoadUserData();
  useNotifications();

  useEffect(() => {
    import("@/lib/backgroundTasks").then(({ registerBackgroundFetchAsync }) => {
      registerBackgroundFetchAsync();
    });
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={LebenTheme}>
      <View
        className={`flex-1 bg-leben-bg ${colorScheme === "dark" ? "dark" : ""}`}
      >
        {/* @ts-ignore */}
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        <AuthGuard />
        <Slot />
        <NotificationManager />
        <NotificationDropdown />
        <OverlayPermissionModal />
        <OfflineSyncManager />
      </View>
    </ThemeProvider>
  );
}
