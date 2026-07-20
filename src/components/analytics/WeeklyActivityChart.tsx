import React from 'react';
import { View, } from 'react-native';
import { DayActivity } from '@/utils/analytics.utils';
import EmptyState from './EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';


interface WeeklyActivityChartProps {
  data: DayActivity[];
  hasData: boolean;
}

function BarChart({ data }: { data: DayActivity[] }) {
  const maxTasks = Math.max(...data.map((d) => d.tasks), 1);

  return (
    <View>
      <View className="flex-row items-end gap-3 h-[120px]">
        {data.map((d, index) => (
          <View key={index} className="flex-1 items-center gap-1">
            <View className="w-full flex-col justify-end h-[100px] gap-0.5">
              <View
                className="w-full rounded-[3px] rounded-b-[2px] bg-leben-accent-dim"
                style={{
                  height: `${(d.focusHours / 7) * 80}%`,
                  minHeight: d.focusHours > 0 ? 3 : 0,
                }}
              />
              <View
                className="w-full rounded-[3px] rounded-b-[2px] bg-leben-accent"
                style={{
                  height: `${(d.tasks / maxTasks) * 60}%`,
                  minHeight: d.tasks > 0 ? 4 : 0,
                }}
              />
            </View>
            <Text className="text-[9px] text-leben-text-muted tracking-wide">
              {d.day}
            </Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center gap-4 mt-3">
        <View className="flex-row items-center gap-1.5">
          <View className="rounded-sm w-2.5 h-2.5 bg-leben-accent" />
          <Text className="text-[10px] text-leben-text-muted">Tasks</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="rounded-sm w-2.5 h-2.5 bg-leben-accent-dim" />
          <Text className="text-[10px] text-leben-text-muted">Focus Hours</Text>
        </View>
      </View>
    </View>
  );
}

export default function WeeklyActivityChart({ data, hasData }: WeeklyActivityChartProps) {
  return (
    <View className="rounded-2xl p-5 mb-5 bg-leben-bg-card border border-leben-border">
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="font-semibold text-leben-text-2 text-[14px]">
            Weekly Activity
          </Text>
          <Text className="text-[11px] text-leben-text-muted mt-0.5">
            Tasks completed & focus hours
          </Text>
        </View>
        {hasData && (
          <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-leben-success/10 border border-leben-success/20">
            <Ionicons name="trending-up" size={10} color="#4caf7d" />
            <Text className="text-[10px] text-leben-success font-medium">
              this week
            </Text>
          </View>
        )}
      </View>

      {hasData ? (
        <BarChart data={data} />
      ) : (
        <EmptyState
          icon={<Ionicons name="bar-chart-outline" size={24} color="#555" />}
          message="No activity yet"
          hint="Complete tasks this week to see your activity chart"
        />
      )}
    </View>
  );
}
