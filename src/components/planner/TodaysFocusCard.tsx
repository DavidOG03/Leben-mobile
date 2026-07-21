import { Text } from "@/components/ui/Text";
import { View } from "react-native";

interface FocusItem {
  title: string;
  reason: string;
}

interface TodaysFocusCardProps {
  focusItems: FocusItem[];
}

export function TodaysFocusCard({ focusItems }: TodaysFocusCardProps) {
  return (
    <View className="rounded-2xl p-6 flex-col gap-5 bg-leben-bg-card border border-leben-border">
      <Text className="text-leben-text font-semibold text-[14px]">
        Today's Focus
      </Text>

      <View className="flex-col gap-4">
        {focusItems.length === 0 ? (
          <Text className="text-leben-text-2 text-[12px]">
            No high-priority focus set.
          </Text>
        ) : (
          focusItems.map((item, i) => (
            <View key={i} className="flex-row gap-4 items-center">
              <View className="items-center justify-center font-bold w-8 h-8 rounded-lg bg-leben-bg-card border border-leben-border">
                <Text className="text-leben-text-2 text-[12px] font-bold">
                  0{i + 1}
                </Text>
              </View>
              <View className="flex-col gap-1 flex-1">
                <Text className="text-leben-text font-medium text-[13px]">
                  {item.title}
                </Text>
                <Text className="text-[9px] text-leben-text-2 tracking-[1px] uppercase">
                  {item.reason}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
