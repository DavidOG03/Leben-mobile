import { View, Text } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { HabitItem } from './HabitItem';

export function HabitList() {
  const habits = useLebenStore((s) => s.habits);

  if (habits.length === 0) {
    return (
      <View className="items-center justify-center py-10 mt-4 rounded-xl border border-[#1e1e1e]" style={{ backgroundColor: '#131313' }}>
        <Text className="text-[#333] text-4xl mb-3">◎</Text>
        <Text className="text-[#666] font-medium text-[13px] mb-1">No habits yet</Text>
        <Text className="text-[#444] text-[12px] text-center">
          Tap the + button to create{'\n'}your first habit.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      {habits.map((habit) => (
        <HabitItem key={habit.id} habit={habit} />
      ))}
    </View>
  );
}
