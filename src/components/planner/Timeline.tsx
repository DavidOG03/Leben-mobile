import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { View } from "react-native";
import { TimelineItem } from "./TimelineItem";

export function Timeline() {
  const schedule = useLebenStore((s) => s.schedule);

  return (
    <View className="relative pl-2">
      {/* Vertical line connector */}
      <View className="absolute left-8 top-6 bottom-6 w-[1px] z-0 bg-leben-border-subtle" />

      <View className="flex-col">
        {schedule.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text
              className="text-leben-text-muted italic"
              style={{ fontSize: 14 }}
            >
              No tasks scheduled for today. Regenerate plan to start.
            </Text>
          </View>
        ) : (
          schedule.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              isCurrent={index === 1} // Mocking current item for now
            />
          ))
        )}
      </View>
    </View>
  );
}
