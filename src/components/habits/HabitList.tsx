import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { View } from "react-native";
import { HabitItem } from "./HabitItem";

export function HabitList() {
  const habits = useLebenStore((s) => s.habits);

  if (habits.length === 0) {
    return (
      <View className="rounded-2xl border border-leben-border bg-leben-bg-secondary overflow-hidden">
        {/* Empty state */}
        <View className="items-center justify-center py-8 gap-2 border-t border-leben-border">
          <Text className="text-[28px]">🌱</Text>
          <Text className="text-[13px] text-leben-text-muted font-geist-medium">
            No habits yet
          </Text>
          <Text className="text-[12px] text-leben-text-dim text-center leading-[20px]">
            Tap + Add Habit above{"\n"}to build your first ritual.
          </Text>
        </View>
      </View>
    );
  }

  // Two-column grid layout matching the web
  const rows: (typeof habits)[] = [];
  for (let i = 0; i < habits.length; i += 2) {
    rows.push(habits.slice(i, i + 2));
  }

  return (
    <View style={{ gap: 12 }}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: "row", gap: 12 }}>
          {row.map((habit) => (
            <View key={habit.id} style={{ flex: 1 }}>
              <HabitItem habit={habit} />
            </View>
          ))}
          {/* Fill empty cell if odd number of habits */}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  );
}
