import React from 'react';
import { View, } from 'react-native';
import { AIInsight } from '@/utils/analytics.utils';
import EmptyState from './EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';


interface AIInsightsProps {
  insights: AIInsight[];
  hasData: boolean;
}

export default function AIInsights({ insights, hasData }: AIInsightsProps) {
  return (
    <View className="rounded-2xl p-5 mb-5 bg-leben-bg-card border border-leben-border">
      <View className="flex-row items-center gap-2 mb-4">
        <View
          className="items-center justify-center rounded-lg bg-leben-accent-dim border border-leben-accent/20"
          style={{ width: 26, height: 26 }}
        >
          <Ionicons name="sparkles" size={12} color="var(--accent-blue)" />
        </View>
        <Text className="font-semibold text-leben-text-2 text-[14px]">
          AI Insights
        </Text>
      </View>

      {hasData && insights.length > 0 ? (
        <View className="gap-3">
          {insights.map((insight, i) => (
            <View
              key={i}
              className="flex-row gap-2.5 rounded-xl p-3 bg-leben-bg-card border border-leben-border"
            >
              <Text className="text-[14px] mt-0.5">{insight.icon}</Text>
              <Text className="text-[11px] text-leben-text-muted leading-[16.5px] shrink">
                {insight.text}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon={<Ionicons name="sparkles-outline" size={24} color="#555" />}
          message="No insights yet"
          hint="Interact with tasks, habits, and goals to surface patterns"
        />
      )}
    </View>
  );
}
