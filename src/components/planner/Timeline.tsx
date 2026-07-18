import { View, } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { TimelineItem } from './TimelineItem';
import { Text } from '@/components/ui/Text';


export function Timeline() {
  const schedule = useLebenStore((s) => s.schedule);

  return (
    <View className="relative pl-2">
      {/* Vertical line connector */}
      <View
        className="absolute left-8 top-6 bottom-6 w-[1px]"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          zIndex: 0,
        }}
      />

      <View className="flex-col">
        {schedule.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Text className="text-leben-text-muted italic" style={{ fontSize: 14 }}>
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
