import { DangerZone } from "@/components/settings/DangerZone";
import { Profile } from "@/components/settings/Profile";
import { SystemPreferences } from "@/components/settings/SystemPreferences";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { Text } from "@/components/ui/Text";
import { supabase } from "@/lib/supabase/client";
import { useLebenStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { Alert, ScrollView, TouchableOpacity } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const userId = useLebenStore((s) => s.userId);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          // We navigate first to prevent the Tabs navigator from crashing
          // when the Zustand store clears the userId synchronously.
          router.replace("/(auth)/logout" as any);

          setTimeout(async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            }
          }, 50);
        },
      },
    ]);
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
    </ScreenLayout>
  );
}
