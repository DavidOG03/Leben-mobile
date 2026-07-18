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
    <View
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', borderWidth: 1 }}
    >
      <Text className="font-semibold text-white mb-4" style={{ fontSize: 14 }}>
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
                    <Text style={{ fontSize: 12 }}>{h.icon}</Text>
                    <Text style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.label}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: 'var(--text-dim)' }}>{pct}%</Text>
                </View>
                <View
                  className="rounded-full overflow-hidden"
                  style={{ height: 3, backgroundColor: 'var(--bg-secondary)' }}
                >
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
