import { View, Text } from 'react-native';
import { SparkleIcon } from '@/constants/Icons';

interface AIInsightsCardProps {
  insights: string[];
  isLoading: boolean;
}

export function AIInsightsCard({ insights, isLoading }: AIInsightsCardProps) {
  if (isLoading) {
    return (
      <View
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          backgroundColor: '#151515',
          borderColor: '#252525',
          borderWidth: 1,
        }}
      >
        <View className="flex-row items-center gap-2">
          <View
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <SparkleIcon color="#7c6af0" size={16} />
          </View>
          <Text className="text-white font-semibold" style={{ fontSize: 14 }}>
            AI Insights
          </Text>
        </View>
        <Text
          className="text-[#888]"
          style={{ fontSize: 12, lineHeight: 19 }}
        >
          Generating your personalized day plan...
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl p-6 flex-col gap-4"
      style={{
        backgroundColor: '#151515',
        borderColor: '#252525',
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center gap-2">
        <View
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <Text style={{ color: '#7c6af0', fontSize: 16 }}>✨</Text>
        </View>
        <Text className="text-white font-semibold" style={{ fontSize: 14 }}>
          AI Insights
        </Text>
      </View>

      <Text className="text-[#888]" style={{ fontSize: 12, lineHeight: 19 }}>
        {insights[0] || "No insights generated yet."}
      </Text>

      <View className="mt-1 flex-col gap-3">
        {insights.slice(1).map((insight, i) => (
          <View key={i} className="flex-row items-start gap-3">
            <View
              className="mt-1 flex-shrink-0 items-center justify-center"
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                borderColor: '#7c6af0',
                borderWidth: 1,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#7c6af0',
                }}
              />
            </View>
            <Text
              style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, lineHeight: 16, flex: 1 }}
            >
              {insight}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
