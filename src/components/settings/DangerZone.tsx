import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import React from "react";
import { Alert, TouchableOpacity, View } from "react-native";

export function DangerZone() {
  const purgeAll = useLebenStore((s: any) => s.purgeAll);

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

  return (
    <View className="rounded-xl p-5 mt-4 bg-leben-error-bg border border-leben-error/20">
      <View className="mb-4">
        <Text className="font-geist-bold mb-1 text-[15px] text-leben-error">
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
        <Text className="text-white text-[13px] font-geist-semibold">
          Purge Core
        </Text>
      </TouchableOpacity>
    </View>
  );
}
