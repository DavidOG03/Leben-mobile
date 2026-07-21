import { View, } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { GoalItem } from './GoalItem';
import { Text } from '@/components/ui/Text';


export function GoalList() {
  const goals = useLebenStore((s) => s.goals);

  if (goals.length === 0) {
    return (
      <View className="items-center justify-center py-12 mt-4 rounded-xl border border-leben-border bg-leben-bg-card">
        <Text className="text-leben-text-dim text-4xl mb-3">◎</Text>
        <Text className="text-leben-text-dim font-medium text-[13px] mb-1">No active goals</Text>
        <Text className="text-leben-text-dim text-[12px] text-center px-6">
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
