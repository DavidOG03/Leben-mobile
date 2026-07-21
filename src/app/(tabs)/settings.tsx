import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { Text } from "@/components/ui/Text";
import { supabase } from "@/lib/supabase/client";
import { useLebenStore } from "@/store/useStore";
import { useColorScheme } from "nativewind";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <TouchableOpacity
      onPress={onChange}
      activeOpacity={0.8}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 2,
        backgroundColor: on ? '#3b82f6' : '#71717a'
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#ffffff',
          transform: [{ translateX: on ? 20 : 0 }]
        }}
      />
    </TouchableOpacity>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text
      className="text-[10px] text-leben-text-dim uppercase mb-4 mt-8"
      style={{ letterSpacing: 1.6 }}
    >
      {text}
    </Text>
  );
}

export default function SettingsScreen() {
  const notificationPrefs = useLebenStore((s) => s.notificationPrefs);
  const updateNotificationPrefs = useLebenStore(
    (s) => s.updateNotificationPrefs,
  );

  const { colorScheme, setColorScheme } = useColorScheme();

  const userId = useLebenStore((s) => s.userId);
  const userFullName = useLebenStore((s: any) => s.userFullName);
  const userEmail = useLebenStore((s: any) => s.userEmail);
  const purgeAll = useLebenStore((s: any) => s.purgeAll);

  const handlePushToggle = () => {
    // In a full mobile implementation, this would request expo-notifications permissions
    if (notificationPrefs.push) {
      updateNotificationPrefs({ push: false });
    } else {
      Alert.alert(
        "Push Notifications",
        "This would request system notification permissions.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: () => updateNotificationPrefs({ push: true }),
          },
        ],
      );
    }
  };

  const handlePurge = () => {
    Alert.alert(
      "CRITICAL WARNING",
      "This will permanently delete all tasks, habits, goals, and books from the server. This action is irreversible.\n\nAre you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purge Core",
          style: "destructive",
          onPress: async () => {
            await purgeAll();
            Alert.alert("Workspace has been purged.");
          },
        },
      ],
    );
  };

  const displayName = userFullName || "Leben User";
  const displayEmail = userEmail || "---";

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout scrollable>
      <ScrollView className="flex-1 bg-leben-bg px-4 md:px-10 py-6 md:py-8">
        {/* Profile section */}
        <View className="flex-row items-start gap-6 mb-8">
          {/* Avatar */}
          <View className="relative">
            <View className="rounded-2xl overflow-hidden items-center justify-center w-[88px] h-[88px] bg-leben-bg-element border border-leben-border-subtle">
              {/* Web uses a gradient + SVG. We'll simulate it with a View and Emoji */}
              <View className="w-full h-full items-center justify-center bg-leben-bg-secondary">
                <Text className="text-[40px]">👤</Text>
              </View>
            </View>
            {/* <TouchableOpacity
              className="absolute bottom-1.5 right-1.5 items-center justify-center rounded-full"
              style={{
                width: 26,
                height: 26,
                backgroundColor: "#1e1e1e",
                borderColor: "#333",
                borderWidth: 1,
              }}
            >
               <Text style={{ fontSize: 12, color: "#888" }}>✏️</Text> 
            </TouchableOpacity> */}
          </View>

          {/* Name / badge */}
          <View className="justify-center mt-2">
            <Text
              className="font-black text-leben-text capitalize"
              style={{ fontSize: 26, letterSpacing: -0.5, marginBottom: 4 }}
            >
              {userId ? displayName : "Guest"}
            </Text>
            <Text className="text-[13px] text-leben-text-muted">
              {displayEmail}
            </Text>
          </View>
        </View>

        {/* Display name + Workspace ID */}
        <View className="flex-row flex-wrap gap-4 mb-4">
          {[
            { label: "DISPLAY NAME", val: displayName },
            {
              label: "WORKSPACE ID",
              val: userId ? `OS-${userId.substring(0, 8).toUpperCase()}` : "--",
            },
          ].map(({ label, val }) => (
            <View
              key={label}
              className="rounded-xl p-4 flex-1 min-w-[150px] bg-leben-bg-card border border-leben-border"
            >
              <Text
                className="text-[9px] text-leben-text-muted uppercase mb-1.5"
                style={{ letterSpacing: 1.4 }}
              >
                {label}
              </Text>
              <Text
                className="font-medium text-leben-text-2 capitalize"
                style={{ fontSize: 15 }}
              >
                {val}
              </Text>
            </View>
          ))}
        </View>

        {/* Notification Channels */}
        <SectionLabel text="System Preferences" />
        <View className="rounded-xl p-5 mb-8 bg-leben-bg-card border border-leben-border">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="items-center justify-center rounded-lg w-[34px] h-[34px] bg-leben-bg-element border border-leben-border-subtle">
              <Text className="text-[16px]">🔔</Text>
            </View>
            <View>
              <Text className="font-medium text-leben-text-2 text-[14px]">
                Notification Channels
              </Text>
              <Text className="text-[11px] text-leben-text-muted mt-0.5">
                Manage how Leben communicates vital updates
              </Text>
            </View>
          </View>

          <View className="flex-col gap-6 mt-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-leben-text-2 text-[14px]">
                  Desktop / Mobile Push
                </Text>
                <Text className="text-[11px] text-leben-text-muted mt-0.5">
                  Master switch for system notifications
                </Text>
              </View>
              <Toggle on={notificationPrefs.push} onChange={handlePushToggle} />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-leben-text-2 text-[14px]">
                  Morning Briefing (8 AM)
                </Text>
                <Text className="text-[11px] text-leben-text-muted mt-0.5">
                  Get a summary of your day ahead
                </Text>
              </View>
              <Toggle
                on={notificationPrefs.morningBriefing}
                onChange={() =>
                  updateNotificationPrefs({
                    morningBriefing: !notificationPrefs.morningBriefing,
                  })
                }
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-leben-text-2 text-[14px]">
                  Streak Savers (6 PM)
                </Text>
                <Text className="text-[11px] text-leben-text-muted mt-0.5">
                  Reminders if you haven't completed daily habits
                </Text>
              </View>
              <Toggle
                on={notificationPrefs.streakSavers}
                onChange={() =>
                  updateNotificationPrefs({
                    streakSavers: !notificationPrefs.streakSavers,
                  })
                }
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-leben-text-2 text-[14px]">
                  Evening Wrap-up (8 PM)
                </Text>
                <Text className="text-[11px] text-leben-text-muted mt-0.5">
                  Log your progress and plan tomorrow
                </Text>
              </View>
              <Toggle
                on={notificationPrefs.eveningWrapUp}
                onChange={() =>
                  updateNotificationPrefs({
                    eveningWrapUp: !notificationPrefs.eveningWrapUp,
                  })
                }
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-leben-text-2 text-[14px]">
                  Goal Updates
                </Text>
                <Text className="text-[11px] text-leben-text-muted mt-0.5">
                  Mid-point and deadline proximity alerts
                </Text>
              </View>
              <Toggle
                on={notificationPrefs.goalUpdates}
                onChange={() =>
                  updateNotificationPrefs({
                    goalUpdates: !notificationPrefs.goalUpdates,
                  })
                }
              />
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-leben-border">
              <Text className="text-leben-text-2 text-[14px]">Dark Mode</Text>
              <Toggle
                on={colorScheme === "dark"}
                onChange={() => setColorScheme(colorScheme === "dark" ? "light" : "dark")}
              />
            </View>
          </View>
        </View>

        {/* Danger zone */}
        <View className="rounded-xl p-5 mt-4 bg-leben-error-bg border border-leben-error/20">
          <View className="mb-4">
            <Text className="font-bold mb-1 text-[15px] text-leben-error">
              Workspace Termination
            </Text>
            <Text className="text-[12px] text-leben-text-muted leading-[18px]">
              Permanently delete all tasks, habits, goals, and books spanning
              your workspace. This action is irreversible.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePurge}
            className="items-center justify-center rounded-xl active:opacity-80 bg-leben-error py-3 px-5 self-start"
          >
            <Text className="text-white text-[13px] font-semibold">
              Purge Core
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="rounded-xl p-4 mt-4 items-center justify-center flex-row gap-2 active:opacity-80 bg-leben-bg-card border border-leben-border"
        >
          <Text className="text-leben-text-2 text-[14px] font-semibold">
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="flex-row items-center justify-between mt-8 pt-4 mb-10 border-t border-leben-border">
          <Text
            className="text-[10px] text-leben-text-dim"
            style={{ letterSpacing: 1 }}
          >
            Leben V1.0
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
