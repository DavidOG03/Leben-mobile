import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLebenStore, ScheduleBlock } from '@/store/useStore';
import { Card } from '@/components/ui/Card';

interface DayScheduleProps {
  schedule: ScheduleBlock[];
}

export function DaySchedule({ schedule }: DayScheduleProps) {
  const toggleScheduleBlock = useLebenStore((s) => s.toggleScheduleBlock);

  if (schedule.length === 0) {
    return (
      <View className="items-center justify-center py-16">
        <Text className="text-[#444] text-[13px] italic text-center px-4">
          No tasks scheduled for today. Generate a plan to get started.
        </Text>
      </View>
    );
  }

  return (
    <View className="pl-4 pr-1">
      {/* Vertical line connector */}
      <View 
        className="absolute left-6 top-6 bottom-6 w-px"
        style={{ backgroundColor: '#222' }}
      />

      {schedule.map((item, index) => {
        // Mock current item
        const isCurrent = index === 0 && item.status !== 'completed';
        const isDeepWork = item.tag.toLowerCase().includes('work');
        const isRecharge = item.tag.toLowerCase().includes('health') || item.tag.toLowerCase().includes('mind');

        return (
          <View key={index} className="flex-row gap-4 mb-6">
            {/* Time label and dot */}
            <View className="items-center w-10 pt-1">
              <Text className="text-[#444] font-bold text-[10px] mb-2">{item.time}</Text>
              <View 
                className="w-2.5 h-2.5 rounded-full relative z-10"
                style={{
                  backgroundColor: isCurrent ? '#7c6af0' : '#222',
                  borderColor: isCurrent ? '#000' : '#333',
                  borderWidth: isCurrent ? 2 : 1,
                }}
              />
            </View>

            {/* Card */}
            <Card 
              className="flex-1 p-4" 
              style={{
                backgroundColor: isCurrent ? '#181926' : '#111',
                borderColor: isCurrent ? 'rgba(124,106,240,0.2)' : '#1e1e1e',
              }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View 
                      className="px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: isDeepWork ? '#1e1e2e' : isRecharge ? '#1e2e22' : '#1a1a1a',
                        borderColor: isDeepWork ? '#2a2a4a' : isRecharge ? '#2a4a33' : '#222',
                      }}
                    >
                      <Text 
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: isDeepWork ? '#7c6af0' : isRecharge ? '#4caf70' : '#888' }}
                      >
                        {item.tag}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-white font-bold text-[15px] leading-tight">
                    {item.title}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleScheduleBlock(index)}
                  className="w-5 h-5 rounded border items-center justify-center mt-1"
                  style={{
                    backgroundColor: item.status === 'completed' ? '#7c6af0' : 'transparent',
                    borderColor: item.status === 'completed' ? '#7c6af0' : '#333',
                  }}
                >
                  {item.status === 'completed' && <View className="w-2 h-2 rounded-full bg-white" />}
                </TouchableOpacity>
              </View>

              <Text className="text-[#666] text-[12px] leading-relaxed mb-3">
                {item.description}
              </Text>

              <View className="flex-row gap-2 mt-auto">
                <View className="px-3 py-1 rounded-full border border-[#222] bg-[#1a1a1a]">
                  <Text className="text-[#555] text-[10px] font-medium">{item.tag}</Text>
                </View>
              </View>
            </Card>
          </View>
        );
      })}
    </View>
  );
}
