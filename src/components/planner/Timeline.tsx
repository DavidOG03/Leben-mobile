import { View, Text } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { TimelineItem } from './TimelineItem';

export function Timeline() {
  const schedule = useLebenStore((s) => s.schedule);

  return (
    <View className="relative pl-2">
      {/* Vertical line connector */}
      <View
        className="absolute left-8 top-6 bottom-6 w-[1px]"
        style={{
          backgroundColor: '#1a1a1a',
          zIndex: 0,
        }}
      />

      <View className="flex-col">
        {schedule.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-[#555] italic" style={{ fontSize: 14 }}>
              No tasks scheduled for today. Regenerate plan to start.
            </Text>
          </View>
        ) : (
          schedule.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              isCurrent={index === 1} // Mocking current item for now
            />
          ))
        )}
      </View>
    </View>
  );
}
