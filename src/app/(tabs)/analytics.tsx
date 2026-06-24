import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { useLebenStore } from '@/store/useStore';
import { buildAnalyticsData } from '@/utils/analytics.utils';
import { ProductivityChart } from '@/components/analytics/ProductivityChart';
import { HabitConsistency } from '@/components/analytics/HabitConsistency';
import { Card } from '@/components/ui/Card';

export default function AnalyticsScreen() {
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);

  const analytics = useMemo(() => buildAnalyticsData(tasks, habits, goals), [tasks, habits, goals]);

  return (
    <ScreenLayout scrollable>
      <View className="flex-1 px-4 py-6">
        <View className="mb-6">
          <Text className="text-white font-bold text-3xl tracking-tight leading-tight mb-1">
            Analytics
          </Text>
          <Text className="text-[#555] text-[13px]">
            Data-driven insights on your performance.
          </Text>
        </View>

        {/* Stat Cards Row */}
        <View className="flex-row gap-4 mb-6">
          <Card className="flex-1 p-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
            <View className="w-8 h-8 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: 'rgba(124,106,240,0.1)' }}>
              <Text className="text-[14px]">🔥</Text>
            </View>
            <Text className="text-[#555] text-[10px] uppercase tracking-widest font-semibold mb-1">Focus</Text>
            <Text className="text-white font-bold text-2xl">{analytics.statCards[0]?.val || '0'}</Text>
          </Card>
          
          <Card className="flex-1 p-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
            <View className="w-8 h-8 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: 'rgba(74,207,125,0.1)' }}>
              <Text className="text-[14px]">✓</Text>
            </View>
            <Text className="text-[#555] text-[10px] uppercase tracking-widest font-semibold mb-1">Completed</Text>
            <Text className="text-white font-bold text-2xl">{analytics.statCards[1]?.val || '0'}</Text>
          </Card>
        </View>

        <ProductivityChart 
          data={analytics.weekActivity} 
          hasData={analytics.hasTaskData} 
        />

        <HabitConsistency 
          habits={analytics.topHabits} 
          hasData={analytics.hasHabitData} 
        />
      </View>
    </ScreenLayout>
  );
}
