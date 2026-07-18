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
                className="w-full rounded-[3px] rounded-b-[2px]"
                style={{
                  height: `${(d.focusHours / 7) * 80}%`,
                  backgroundColor: '#1e1e3a',
                  minHeight: d.focusHours > 0 ? 3 : 0,
                }}
              />
              <View
                className="w-full rounded-[3px] rounded-b-[2px]"
                style={{
                  height: `${(d.tasks / maxTasks) * 60}%`,
                  backgroundColor: 'var(--accent-blue)', // Gradient is hard with just Views in React Native without expo-linear-gradient, using solid color.
                  minHeight: d.tasks > 0 ? 4 : 0,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                letterSpacing: 0.6,
              }}
            >
              {d.day}
            </Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center gap-4 mt-3">
        <View className="flex-row items-center gap-1.5">
          <View className="rounded-sm w-2.5 h-2.5 bg-leben-accent" />
          <Text style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tasks</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="rounded-sm w-2.5 h-2.5 bg-[#1e1e3a]" />
          <Text style={{ fontSize: 10, color: 'var(--text-muted)' }}>Focus Hours</Text>
        </View>
      </View>
    </View>
  );
}

export default function WeeklyActivityChart({ data, hasData }: WeeklyActivityChartProps) {
  return (
    <View
      className="rounded-2xl p-5 mb-5"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', borderWidth: 1 }}
    >
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="font-semibold text-white" style={{ fontSize: 14 }}>
            Weekly Activity
          </Text>
          <Text style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Tasks completed & focus hours
          </Text>
        </View>
        {hasData && (
          <View
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: 'rgba(74,207,125,0.1)',
              borderColor: 'rgba(74,207,125,0.2)',
              borderWidth: 1,
            }}
          >
            <Ionicons name="trending-up" size={10} color="#4caf7d" />
            <Text style={{ fontSize: 10, color: '#4caf7d', fontWeight: '500' }}>
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
