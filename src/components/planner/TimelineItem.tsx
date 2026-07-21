import { Text } from "@/components/ui/Text";
import { BellIcon } from "@/constants/Icons";
import { ScheduleItem, useLebenStore } from "@/store/useStore";
import { TouchableOpacity, View } from "react-native";

// import ReminderPicker from '../shared/ReminderPicker'; // You can add your modal/picker equivalent here

interface TimelineItemProps {
  item: ScheduleItem;
  isCurrent?: boolean;
}

export function TimelineItem({ item, isCurrent }: TimelineItemProps) {
  const toggleScheduleItem = useLebenStore((s) => s.toggleScheduleItem);
  const updateScheduleItem = useLebenStore((s) => s.updateScheduleItem);

  const isDeepWork = item.tag.toLowerCase().includes("work");
  const isRecharge =
    item.tag.toLowerCase().includes("health") ||
    item.tag.toLowerCase().includes("mind");

  return (
    <View className="flex-row gap-4 mb-8">
      {/* Time label and dot */}
      <View className="flex-col items-center w-12 pt-1 pb-4 ">
        <Text
          className="text-leben-text-muted font-bold bg-leben-bg"
          style={{ fontSize: 11 }}
        >
          {item.start}
        </Text>
        <View
          className={`mt-3 relative z-10 items-center justify-center w-2 h-2 rounded-full border ${isCurrent ? "bg-leben-accent border-black shadow-sm" : "bg-leben-border border-leben-border"}`}
        >
          {item.reminderAt && (
            <View className="absolute top-4">
              <BellIcon color="#7c6af0" size={10} />
            </View>
          )}
        </View>
      </View>

      {/* Card */}
      <View
        className={`flex-1 rounded-2xl p-5 border ${isCurrent ? "bg-leben-accent-dim border-leben-accent" : "bg-leben-bg-card border-leben-text-dim"}`}
      >
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-col gap-1 flex-1 pr-2">
            <View className="flex-row items-center gap-2">
              <View
                className={`px-2 py-0.5 rounded border ${isDeepWork ? "bg-leben-accent/10 border-leben-accent/20" : isRecharge ? "bg-leben-success/10 border-leben-success/20" : "bg-leben-bg-secondary border-leben-border"}`}
              >
                <Text
                  className={`font-bold uppercase tracking-widest text-[9px] ${isDeepWork ? "text-leben-accent" : isRecharge ? "text-[#4caf70]" : "text-leben-text-muted"}`}
                >
                  {item.tag}
                </Text>
              </View>
              {item.reminderAt && (
                <View className="flex-row items-center gap-1">
                  <BellIcon color="currentColor" size={9} />
                  <Text className="text-leben-accent text-[9px] font-bold">
                    Reminder set
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="text-leben-text-2
               font-bold mt-1"
              style={{ fontSize: 18 }}
            >
              {item.title}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => toggleScheduleItem(item.id)}
              className={`items-center justify-center rounded w-5 h-5 border ${item.status === "completed" ? "bg-leben-accent border-leben-accent" : "bg-transparent border-leben-text-dim"}`}
            >
              {item.status === "completed" && (
                <View className="w-2 h-2 rounded-full bg-white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-[#777] leading-relaxed" style={{ fontSize: 13 }}>
          {item.description}
        </Text>

        <View className="flex-row gap-2 mt-5">
          <View className="px-3 py-1 rounded-full bg-leben-bg-secondary border border-leben-border">
            <Text
              className="text-leben-text-dim font-medium"
              style={{ fontSize: 10 }}
            >
              {item.tag}
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-leben-bg-secondary border border-leben-border">
            <Text
              className="text-leben-text-dim font-medium"
              style={{ fontSize: 10 }}
            >
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
