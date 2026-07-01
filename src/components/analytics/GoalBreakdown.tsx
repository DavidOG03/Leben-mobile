import React from 'react';
import { View, Text } from 'react-native';
import { deriveGoalStats, Goal } from '@/utils/goals.types';
import EmptyState from './EmptyState';
import { Ionicons } from '@expo/vector-icons';

interface GoalBreakdownProps {
  goals: Goal[];
  hasData: boolean;
}

export default function GoalBreakdown({ goals, hasData }: GoalBreakdownProps) {
  return (
    <View
      className="rounded-2xl p-5"
      style={{ backgroundColor: '#111', borderColor: '#1e1e1e', borderWidth: 1 }}
    >
      <Text className="font-semibold text-white mb-4" style={{ fontSize: 14 }}>
        Goal Progress
      </Text>

      {hasData && goals.length > 0 ? (
        <View className="gap-3">
          {goals.map((g) => {
            const stats = deriveGoalStats(g);
            return (
              <View key={g.id}>
                <View className="flex-row justify-between mb-1.5">
                  <Text style={{ fontSize: 12, color: '#ccc' }}>{g.title || g.name}</Text>
                  <Text style={{ fontSize: 11, color: '#666' }}>{stats.progress}%</Text>
                </View>
                <View
                  className="rounded-full overflow-hidden"
                  style={{ height: 3, backgroundColor: '#1a1a1a' }}
                >
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
