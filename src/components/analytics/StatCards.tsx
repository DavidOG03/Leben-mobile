import { Text } from "@/components/ui/Text";
import { StatCard } from "@/utils/analytics.utils";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, View } from "react-native";

interface StatCardsProps {
  cards: StatCard[];
}

export default function StatCards({ cards }: StatCardsProps) {
  if (!cards || cards.length === 0) {
    return (
      <View className="flex-row gap-4 mb-6 opacity-50">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="rounded-2xl p-5 w-[160px] bg-leben-bg-card border border-leben-border"
          >
            <View className="w-16 h-3 rounded bg-white/5 mb-3" />
            <View className="w-20 h-8 rounded bg-white/5 mb-3" />
            <View className="w-12 h-3 rounded bg-white/5" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6"
      contentContainerStyle={{ gap: 16, paddingRight: 16 }}
    >
      {cards.map((s) => (
        <View
          key={s.label}
          className="rounded-2xl p-5 w-[160px] bg-leben-bg-card border border-leben-border"
        >
          <Text className="text-[11px] text-leben-text-muted mb-2">
            {s.label}
          </Text>
          <Text className="font-black text-leben-text-2 text-[28px] leading-[28px] -tracking-[0.5px]">
            {s.val}
          </Text>
          <View className="flex-row items-center gap-1 mt-2">
            {s.up !== null && (
              <Ionicons
                name={s.up ? "arrow-up" : "arrow-down"}
                size={10}
                color={s.up ? "#4caf7d" : "#e85555"}
              />
            )}
            <Text
              className={`text-[11px] ${
                s.up === true
                  ? "text-leben-success"
                  : s.up === false
                    ? "text-leben-error"
                    : "text-leben-text-muted"
              }`}
            >
              {s.sub}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
