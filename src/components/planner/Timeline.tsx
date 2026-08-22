import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { TimelineItem } from "./TimelineItem";

// Helper to convert "HH:MM" (e.g., "09:00") to total minutes from midnight
function timeToMinutes(timeStr: string) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function Timeline() {
  const schedule = useLebenStore((s) => s.schedule);
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    // Check time every minute to update the active item
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="relative pl-2">
      {/* Vertical line connector */}
      <View className="absolute left-8 top-6 bottom-6 w-[1px] z-0 bg-leben-border-subtle" />

      <View className="flex-col">
        {schedule.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text
              className="text-leben-text-muted italic text-center"
              style={{ fontSize: 14 }}
            >
              Nothing planned yet. Add a couple of tasks and hit Regenerate — we'll build your day from there.
            </Text>
          </View>
        ) : (
          schedule.map((item, index) => {
            const startMins = timeToMinutes(item.start);
            // If there's no end time, assume the block lasts until the start of the next one, or 1 hour
            const nextItem = schedule[index + 1];
            const endMins = item.end
              ? timeToMinutes(item.end)
              : nextItem
                ? timeToMinutes(nextItem.start)
                : startMins + 60;

            const isCurrent =
              currentMinutes >= startMins && currentMinutes < endMins;

            return (
              <TimelineItem key={item.id} item={item} isCurrent={isCurrent} />
            );
          })
        )}
      </View>
    </View>
  );
}
