import { DangerZone } from "@/components/settings/DangerZone";
import { Profile } from "@/components/settings/Profile";
import { SystemPreferences } from "@/components/settings/SystemPreferences";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { Text } from "@/components/ui/Text";
import { supabase } from "@/lib/supabase/client";
import { useLebenStore } from "@/store/useStore";
import { useAIStore } from "@/store/useAiStore";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View, ActivityIndicator, Modal } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function SettingsScreen() {
  const userId = useLebenStore((s) => s.userId);
  const clearChat = useAIStore((s) => s.clearChat);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    const offlineQueueLength = useLebenStore.getState().offlineQueue.length;
    
    if (offlineQueueLength > 0) {
      Alert.alert(
        "Unsynced Changes",
        "You have unsynced changes. Signing out will permanently delete them from this device. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out Anyway", style: "destructive", onPress: performSignOut },
        ]
      );
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: performSignOut },
      ]);
    }
  };

  const performSignOut = async () => {
    setIsSigningOut(true);
    
    // Clear AI chat so the next user can't see this user's history
    clearChat();

    // Navigate to logout (guest mode entry) before we destroy the auth state
    // to prevent navigation context errors when the store is cleared mid-render
    router.replace("/(auth)/logout" as any);

    try { await GoogleSignin.signOut(); } catch (_) {}

    await supabase.auth.signOut();
  };

  return (
    <ScreenLayout scrollable>
      <ScrollView className="flex-1 bg-leben-bg px-4 md:px-10 py-6 md:py-8">
        <Profile />
        {/* Sign Out / Sign In conditionally */}
        {userId ? (
          <TouchableOpacity
            onPress={handleSignOut}
            className="rounded-xl p-4 my-4 items-center justify-center flex-row gap-2 active:opacity-80 bg-leben-bg-card border border-leben-border"
          >
            <Text className="text-leben-text-2 text-[14px] font-geist-semibold">
              Sign Out
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in" as any)}
            className="rounded-xl p-4 mt-4 items-center justify-center flex-row gap-2 active:opacity-80 bg-leben-accent shadow-sm"
          >
            <Text className="text-white text-[14px] font-geist-semibold">
              Sign In / Sign Up
            </Text>
          </TouchableOpacity>
        )}

        <SystemPreferences />

        <DangerZone />
      </ScrollView>

      <Modal visible={isSigningOut} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60">
          <ActivityIndicator size="large" color="#7c6af0" />
          <Text className="text-white font-geist-medium mt-4">Signing out...</Text>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
