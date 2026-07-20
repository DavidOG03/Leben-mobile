import { View, } from 'react-native';
import { SparkleIcon } from '@/constants/Icons';
import { Text } from '@/components/ui/Text';


interface AIInsightsCardProps {
  insights: string[];
  isLoading: boolean;
}

export function AIInsightsCard({ insights, isLoading }: AIInsightsCardProps) {
  if (isLoading) {
    return (
      <View className="rounded-2xl p-6 flex flex-col gap-4 bg-leben-bg-card border border-leben-border">
        <View className="flex-row items-center gap-2">
          <View className="p-1.5 rounded-lg bg-leben-bg-element border border-leben-border-subtle">
            <SparkleIcon color="var(--accent-blue)" size={16} />
          </View>
          <Text className="text-leben-text-2 font-semibold text-[14px]">
            AI Insights
          </Text>
        </View>
        <Text className="text-leben-text-muted text-[12px] leading-[19px]">
          Generating your personalized day plan...
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl p-6 flex-col gap-4 bg-leben-bg-card border border-leben-border">
      <View className="flex-row items-center gap-2">
        <View className="p-1.5 rounded-lg bg-leben-bg-element border border-leben-border-subtle">
          <Text className="text-leben-accent text-[16px]">✨</Text>
        </View>
        <Text className="text-leben-text-2 font-semibold text-[14px]">
          AI Insights
        </Text>
      </View>

      <Text className="text-leben-text-muted text-[12px] leading-[19px]">
        {insights[0] || "No insights generated yet."}
      </Text>

      <View className="mt-1 flex-col gap-3">
        {insights.slice(1).map((insight, i) => (
          <View key={i} className="flex-row items-start gap-3">
            <View className="mt-1 flex-shrink-0 items-center justify-center w-[14px] h-[14px] rounded-full border border-leben-accent">
              <View className="w-[6px] h-[6px] rounded-full bg-leben-accent" />
            </View>
            <Text className="text-leben-text-primary text-[11px] leading-[16px] flex-1">
              {insight}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
