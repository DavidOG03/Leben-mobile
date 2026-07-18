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
    <View
      className="rounded-2xl p-5 mb-5"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', borderWidth: 1 }}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <View
          className="items-center justify-center rounded-lg"
          style={{
            width: 26,
            height: 26,
            backgroundColor: 'rgba(124,106,240,0.15)',
            borderColor: 'rgba(124,106,240,0.2)',
            borderWidth: 1,
          }}
        >
          <Ionicons name="sparkles" size={12} color="#7c6af0" />
        </View>
        <Text className="font-semibold text-white" style={{ fontSize: 14 }}>
          AI Insights
        </Text>
      </View>

      {hasData && insights.length > 0 ? (
        <View className="gap-3">
          {insights.map((insight, i) => (
            <View
              key={i}
              className="flex-row gap-2.5 rounded-xl p-3"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-primary)',
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 14, marginTop: 1 }}>{insight.icon}</Text>
              <Text style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 16.5, flexShrink: 1 }}>
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
