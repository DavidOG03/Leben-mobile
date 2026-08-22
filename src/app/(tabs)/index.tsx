import { AIMorningBrief } from "@/components/dashboard/AIMorningBrief";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EfficiencyScore } from "@/components/dashboard/EfficiencyScore";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { HabitStreaks } from "@/components/dashboard/HabitStreaks";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { View } from "react-native";

export default function DashboardScreen() {
  return (
    <ScreenLayout scrollable>
      <DashboardHeader />

      <View className="flex flex-col flex-1 px-4 py-5 gap-5">
        {/* Top Section */}
        <AIMorningBrief />
        <EfficiencyScore />

        {/* Bottom Section */}
        <TodaysFocus />
        <HabitStreaks />
        <GoalProgress />
      </View>
    </ScreenLayout>
  );
}
