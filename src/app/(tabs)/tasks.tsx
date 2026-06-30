import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { SmartSuggestion } from "@/components/tasks/SmartSuggestion";
import { TaskInput } from "@/components/tasks/TaskInput";
import { TaskList } from "@/components/tasks/TaskList";
import { Text, View } from "react-native";

export default function TasksScreen() {
  return (
    <ScreenLayout scrollable>
      <DashboardHeader />

      <View className="flex-1 px-4 py-6">
        <View className="mb-6">
          <Text className="text-white font-bold text-3xl tracking-tight leading-tight mb-1">
            Daily Tasks
          </Text>
          <Text className="text-[#555] text-[13px]">
            Focused execution for today's intentions.
          </Text>
        </View>

        <TaskInput />
        <TaskList />
        <SmartSuggestion />
      </View>
    </ScreenLayout>
  );
}
