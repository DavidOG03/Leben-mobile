import React from 'react';
import { View, } from 'react-native';
import EmptyState from './EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';


interface HabitBreakdownProps {
  habits: any[];
  hasData: boolean;
}

export default function HabitBreakdown({ habits, hasData }: HabitBreakdownProps) {
  return (
    <View className="rounded-2xl p-5 bg-leben-bg-card border border-leben-border">
      <Text className="font-semibold text-leben-text-2 mb-4 text-[14px]">
        Habit Consistency
      </Text>

      {hasData && habits.length > 0 ? (
        <View className="gap-3">
          {habits.map((h, i) => {
            const pct = Math.round(h.consistency * 100);
            return (
              <View key={i}>
                <View className="flex-row justify-between mb-1.5">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[12px]">{h.icon}</Text>
                    <Text className="text-[12px] text-leben-text-2">{h.label}</Text>
                  </View>
                  <Text className="text-[11px] text-leben-text-dim">{pct}%</Text>
                </View>
                <View className="rounded-full overflow-hidden h-[3px] bg-leben-bg-secondary">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: h.color || 'var(--accent-blue)',
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={<Ionicons name="refresh" size={24} color="#555" />}
          message="No habits yet"
          hint="Track your habits daily to build consistency"
        />
      )}
    </View>
  );
}
