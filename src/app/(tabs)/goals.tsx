import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AddGoalSheet } from "@/components/goals/AddGoalSheet";
import { GoalList } from "@/components/goals/GoalList";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { Text } from "@/components/ui/Text";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function GoalsScreen() {
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <ScreenLayout scrollable>
      <DashboardHeader />
      <View className="flex-1 px-4 py-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-leben-text font-bold text-3xl tracking-tight leading-tight mb-1">
              Goals
            </Text>
            <Text className="text-leben-text-muted text-[13px]">
              Visualize and execute your long-term ambitions.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddSheet(true)}
            className="flex flex-row items-center justify-center gap-2 rounded-full bg-leben-accent active:opacity-80 px-4 py-2"
          >
            <Text className="text-white text-sm leading-none font-light">
              + Add Goal
            </Text>
          </TouchableOpacity>
        </View>

        <GoalList />
      </View>

      <AddGoalSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
      />
    </ScreenLayout>
  );
}
