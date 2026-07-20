import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { ScheduleBlock, useLebenStore } from "@/store/useStore";
import { TouchableOpacity, View } from "react-native";

interface DayScheduleProps {
  schedule: ScheduleBlock[];
}

export function DaySchedule({ schedule }: DayScheduleProps) {
  const toggleScheduleBlock = useLebenStore((s) => s.toggleScheduleBlock);

  if (schedule.length === 0) {
    return (
      <View className="items-center justify-center py-16">
        <Text className="text-leben-text-dim text-[13px] italic text-center px-4">
          No tasks scheduled for today. Generate a plan to get started.
        </Text>
      </View>
    );
  }

  return (
    <View className="pl-4 pr-1">
      {/* Vertical line connector */}
      <View className="absolute left-6 top-6 bottom-6 w-px bg-leben-border" />

      {schedule.map((item, index) => {
        // Mock current item
        const isCurrent = index === 0 && item.status !== "completed";
        const isDeepWork = item.tag.toLowerCase().includes("work");
        const isRecharge =
          item.tag.toLowerCase().includes("health") ||
          item.tag.toLowerCase().includes("mind");

        return (
          <View key={index} className="flex-row gap-4 mb-6">
            {/* Time label and dot */}
            <View className="items-center w-10 pt-1">
              <Text className="text-leben-text-dim font-bold text-[10px] mb-2">
                {item.time}
              </Text>
              <View
                className={`w-2.5 h-2.5 rounded-full relative z-10 border ${isCurrent ? "bg-leben-accent border-black border-2" : "bg-leben-border border-leben-border"}`}
              />
            </View>

            {/* Card */}
            <Card
              className={`flex-1 p-4 border ${isCurrent ? "bg-leben-accent-dim border-leben-accent/20" : "bg-leben-bg-card border-leben-border"}`}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View
                      className={`px-2 py-0.5 rounded border ${isDeepWork ? "bg-leben-accent/10 border-leben-accent/20" : isRecharge ? "bg-leben-success/10 border-leben-success/20" : "bg-leben-bg-secondary border-leben-border"}`}
                    >
                      <Text
                        className={`text-[9px] font-bold uppercase tracking-wider ${isDeepWork ? "text-leben-accent" : isRecharge ? "text-[#4caf70]" : "text-leben-text-muted"}`}
                      >
                        {item.tag}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-leben-text-2 font-bold text-[15px] leading-tight">
                    {item.title}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleScheduleBlock(index)}
                  className={`w-5 h-5 rounded border items-center justify-center mt-1 ${item.status === "completed" ? "bg-leben-accent border-leben-accent" : "bg-transparent border-leben-border"}`}
                >
                  {item.status === "completed" && (
                    <View className="w-2 h-2 rounded-full bg-white" />
                  )}
                </TouchableOpacity>
              </View>

              <Text className="text-leben-text-dim text-[12px] leading-relaxed mb-3">
                {item.description}
              </Text>

              <View className="flex-row gap-2 mt-auto">
                <View className="px-3 py-1 rounded-full border border-leben-border bg-leben-bg-secondary">
                  <Text className="text-leben-text-muted text-[10px] font-medium">
                    {item.tag}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        );
      })}
    </View>
  );
}
