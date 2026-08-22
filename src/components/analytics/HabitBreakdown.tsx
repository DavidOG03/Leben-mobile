import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import EmptyState from "./EmptyState";

interface HabitBreakdownProps {
  habits: any[];
  hasData: boolean;
}

export default function HabitBreakdown({
  habits,
  hasData,
}: HabitBreakdownProps) {
  return (
    <View className="rounded-2xl p-5 bg-leben-bg-card border border-leben-border-subtle">
      <Text className="font-geist-semibold text-leben-text-2 mb-4 text-[14px]">
        Habit Consistency
      </Text>

      {hasData && habits.length > 0 ? (
        <View className="gap-3">
          {habits.map((h, i) => {
            const pct = Math.round(h.consistency * 100);
            return (
              <View key={i}>
                <View className="flex-row justify-between mb-1.5">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[12px]">{h.icon}</Text>
                    <Text className="text-[12px] text-leben-text-2">
                      {h.label}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-leben-text-dim">
                    {pct}%
                  </Text>
                </View>
                <View className="rounded-full overflow-hidden h-[3px] bg-leben-bg-secondary">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: h.color || "#3b82f6",
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={<Ionicons name="refresh" size={24} color="#555" />}
          message="No habits yet"
          hint="Start a habit and check it off each day — your streak will build up here"
        />
      )}
    </View>
  );
}
