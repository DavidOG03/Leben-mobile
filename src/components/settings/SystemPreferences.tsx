import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { useColorScheme } from "nativewind";
import React from "react";
import { Alert, View } from "react-native";
import { Toggle } from "./Toggle";

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

export function SystemPreferences() {
  const notificationPrefs = useLebenStore((s) => s.notificationPrefs);
  const updateNotificationPrefs = useLebenStore(
    (s) => s.updateNotificationPrefs,
  );

  const { colorScheme, setColorScheme } = useColorScheme();

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

  return (
    <>
      <SectionLabel text="System Preferences" />
      <View className="rounded-xl p-5 mb-8 bg-leben-bg-card border border-leben-border">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="items-center justify-center rounded-lg w-[34px] h-[34px] bg-leben-bg-element border border-leben-border-subtle">
            <Text className="text-[16px]">🔔</Text>
          </View>
          <View>
            <Text className="font-geist-medium text-leben-text-2 text-[14px]">
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
                Push Notifications
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
                Morning Briefing
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
                Midday Nudge
              </Text>
              <Text className="text-[11px] text-leben-text-muted mt-0.5">
                12pm reminder to start tasks, habits & goals
              </Text>
            </View>
            <Toggle
              on={notificationPrefs.middayNudge}
              onChange={() =>
                updateNotificationPrefs({
                  middayNudge: !notificationPrefs.middayNudge,
                })
              }
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-leben-text-2 text-[14px]">
                Streak Savers
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
                Evening Wrap-up
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
              onChange={() =>
                setColorScheme(colorScheme === "dark" ? "light" : "dark")
              }
            />
          </View>
        </View>
      </View>
    </>
  );
}
