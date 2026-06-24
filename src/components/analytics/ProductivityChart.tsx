import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';

interface DayActivity {
  day: string;
  tasks: number;
  focusHours: number;
}

interface ProductivityChartProps {
  data: DayActivity[];
  hasData: boolean;
}

export function ProductivityChart({ data, hasData }: ProductivityChartProps) {
  if (!hasData || data.length === 0) {
    return (
      <Card className="p-5 mb-4 items-center justify-center py-10" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
        <Text className="text-4xl mb-3">📊</Text>
        <Text className="text-white font-semibold text-[14px] mb-1">No activity yet</Text>
        <Text className="text-[#666] text-[12px] text-center">
          Complete tasks this week to see your activity chart
        </Text>
      </Card>
    );
  }

  const maxTasks = Math.max(...data.map((d) => d.tasks), 1);

  return (
    <Card className="p-5 mb-4" style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}>
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-white font-semibold text-[14px]">Weekly Activity</Text>
          <Text className="text-[#555] text-[11px] mt-0.5">Tasks completed & focus hours</Text>
        </View>
        <View 
          className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[rgba(74,207,125,0.2)]"
          style={{ backgroundColor: 'rgba(74,207,125,0.1)' }}
        >
          <Text className="text-[#4caf7d] text-[10px] font-medium">this week</Text>
        </View>
      </View>

      <View className="flex-row items-end gap-2 h-32">
        {data.map((d) => (
          <View key={d.day} className="flex-1 items-center gap-1">
            <View className="w-full h-24 justify-end gap-0.5">
              <View 
                className="w-full rounded-t-sm"
                style={{ 
                  height: `${(d.focusHours / 7) * 80}%`, 
                  backgroundColor: '#1e1e3a',
                  minHeight: d.focusHours > 0 ? 3 : 0 
                }} 
              />
              <View 
                className="w-full rounded-t-sm"
                style={{ 
                  height: `${(d.tasks / maxTasks) * 60}%`, 
                  backgroundColor: '#7c6af0',
                  minHeight: d.tasks > 0 ? 4 : 0 
                }} 
              />
            </View>
            <Text className="text-[#555] text-[9px] tracking-widest">{d.day}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center gap-4 mt-4">
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#7c6af0' }} />
          <Text className="text-[#555] text-[10px]">Tasks</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#1e1e3a' }} />
          <Text className="text-[#555] text-[10px]">Focus Hours</Text>
        </View>
      </View>
    </Card>
  );
}
