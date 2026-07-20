import React from 'react';
import { View, } from 'react-native';
import { deriveGoalStats, Goal } from '@/utils/goals.types';
import EmptyState from './EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';


interface GoalBreakdownProps {
  goals: Goal[];
  hasData: boolean;
}

export default function GoalBreakdown({ goals, hasData }: GoalBreakdownProps) {
  return (
    <View className="rounded-2xl p-5 bg-leben-bg-card border border-leben-border">
      <Text className="font-semibold text-leben-text-2 mb-4 text-[14px]">
        Goal Progress
      </Text>

      {hasData && goals.length > 0 ? (
        <View className="gap-3">
          {goals.map((g) => {
            const stats = deriveGoalStats(g);
            return (
              <View key={g.id}>
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-[12px] text-leben-text-2">{g.title || g.name}</Text>
                  <Text className="text-[11px] text-leben-text-dim">{stats.progress}%</Text>
                </View>
                <View className="rounded-full overflow-hidden h-[3px] bg-leben-bg-secondary">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${stats.progress}%`,
                      backgroundColor: stats.statusColor,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={<Ionicons name="flag-outline" size={24} color="#555" />}
          message="No goals set"
          hint="Create goals and update your progress to track them here"
        />
      )}
    </View>
  );
}
