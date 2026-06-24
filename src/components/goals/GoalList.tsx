import { View, Text } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { GoalItem } from './GoalItem';

export function GoalList() {
  const goals = useLebenStore((s) => s.goals);

  if (goals.length === 0) {
    return (
      <View className="items-center justify-center py-12 mt-4 rounded-xl border border-[#1e1e1e]" style={{ backgroundColor: '#131313' }}>
        <Text className="text-[#333] text-4xl mb-3">◎</Text>
        <Text className="text-[#666] font-medium text-[13px] mb-1">No active goals</Text>
        <Text className="text-[#444] text-[12px] text-center px-6">
          Set a new goal to start tracking your long-term progress.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4 pb-12">
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} />
      ))}
    </View>
  );
}
