import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';

interface HabitStat {
  label: string;
  icon: string;
  color: string;
  streak: number;
  consistency: number;
}

interface HabitConsistencyProps {
  habits: HabitStat[];
  hasData: boolean;
}

export function HabitConsistency({ habits, hasData }: HabitConsistencyProps) {
  if (!hasData || habits.length === 0) {
    return (
      <Card className="p-5 mb-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
        <Text className="font-semibold text-white text-[14px] mb-1">Habit Consistency</Text>
        <Text className="text-[#555] text-[11px] mb-4">Top habits this week</Text>
        <View className="items-center justify-center py-6">
          <Text className="text-[#333] text-[13px] italic">Not enough habit data</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card className="p-5 mb-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
      <View className="mb-5">
        <Text className="font-semibold text-white text-[14px]">Habit Consistency</Text>
        <Text className="text-[#555] text-[11px] mt-0.5">Top habits this week</Text>
      </View>

      <View className="gap-4">
        {habits.map((habit, idx) => (
          <View key={idx}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Text>{habit.icon}</Text>
                <Text className="text-[#ccc] text-[13px]">{habit.label}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text className="text-white font-bold text-[13px]">{habit.streak} <Text className="text-[#666] font-normal text-[10px]">🔥</Text></Text>
                <Text className="text-[#888] font-semibold text-[11px]">{Math.round(habit.consistency * 100)}%</Text>
              </View>
            </View>
            <View className="h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${habit.consistency * 100}%`, 
                  backgroundColor: habit.color 
                }} 
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
