import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useLebenStore, Habit } from '@/store/useStore';
import { Card } from '@/components/ui/Card';

interface HabitItemProps {
  habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps) {
  const toggleHabit = useLebenStore((s) => s.toggleHabit);
  const deleteHabit = useLebenStore((s) => s.deleteHabit);

  const handleDelete = () => {
    Alert.alert('Delete Habit', `Are you sure you want to delete "${habit.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
    ]);
  };

  // Build the matrix for the last 14 days
  const today = new Date();
  const past14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <Card className="p-4 mb-4" style={{ backgroundColor: '#131313', borderColor: '#1e1e1e' }}>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3 flex-1">
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center border border-[#1e1e1e]"
            style={{ backgroundColor: '#181818' }}
          >
            <Text style={{ color: habit.color, fontSize: 20 }}>{habit.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-[14px] leading-tight mb-0.5">
              {habit.label}
            </Text>
            <Text className="text-[#666] text-[11px]">
              {habit.frequency === 'daily' ? 'Daily' : `${habit.targetDaysPerWeek}x / week`} • {habit.timeOfDay}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => toggleHabit(habit.id)}
          className="w-12 h-8 rounded-lg items-center justify-center border border-[#1e1e1e] active:opacity-80"
          style={{ backgroundColor: habit.checked ? habit.color : '#161616' }}
        >
          <Text style={{ color: habit.checked ? '#fff' : '#555', fontSize: 14 }}>
            {habit.checked ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-end border-t border-[#181818] pt-4">
        <View className="gap-1">
          <Text className="text-[#444] text-[9px] uppercase tracking-widest font-bold">
            Last 14 Days
          </Text>
          <View className="flex-row gap-1">
            {past14Days.map((dateStr, i) => {
              const isCompleted = habit.completedDates?.includes(dateStr);
              return (
                <View
                  key={i}
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: isCompleted ? habit.color : '#1a1a1a',
                    opacity: isCompleted ? 1 : 0.5,
                  }}
                />
              );
            })}
          </View>
        </View>

        <View className="items-end gap-1">
          <Text className="text-white font-bold text-lg leading-none">
            {habit.streak}<Text className="text-[#666] text-[11px] font-normal"> 🔥</Text>
          </Text>
        </View>
      </View>

      {/* Delete button inline for mobile */}
      <TouchableOpacity 
        onPress={handleDelete}
        className="absolute top-4 right-16 p-2"
      >
        <Text className="text-[#444] text-xs">🗑️</Text>
      </TouchableOpacity>
    </Card>
  );
}
