import { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLebenStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { deriveGoalStats } from '@/utils/goals.types';
import { Text } from '@/components/ui/Text';


export function GoalProgress() {
  const router = useRouter();
  const goals = useLebenStore((s) => s.goals);
  const toggleMilestone = useLebenStore((s) => s.toggleMilestone);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="min-h-[260px] p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-leben-text font-semibold text-[15px]">
          Goal Progress
        </Text>
        {!loading && goals.length > 0 && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/goals' as any)}>
            <Text className="text-leben-accent text-[11px] font-semibold">
              Go to Goals
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 gap-6 opacity-50">
          {[1, 2].map((i) => (
            <View key={i}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-4 h-4 rounded bg-leben-bg-secondary" />
                  <View className="w-24 h-3 rounded bg-leben-bg-secondary" />
                </View>
                <View className="w-8 h-2 rounded bg-leben-bg-secondary" />
              </View>
              <View className="h-[3px] rounded bg-leben-bg-secondary mb-3" />
              <View className="gap-2">
                <View className="h-2 rounded bg-leben-bg-secondary opacity-60 w-full" />
                <View className="h-2 rounded bg-leben-bg-secondary opacity-40 w-3/4" />
              </View>
            </View>
          ))}
        </View>
      ) : goals.length === 0 ? (
        <View className="flex-1 items-center justify-center py-4 gap-3">
          <Text className="text-leben-text-dim text-2xl">十</Text>
          <Text className="text-leben-text-dim text-[11px]">
            No goals added yet
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/goals' as any)}
            className="px-4 py-1.5 rounded-lg border border-leben-border active:opacity-70"
          >
            <Text className="text-leben-text-dim text-[11px]">Create a goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 gap-6">
          {goals.slice(0, 2).map((g) => {
            const safeGoal = { ...g, milestones: g.milestones ?? [] };
            const { progress } = deriveGoalStats(safeGoal);
            return (
              <View key={g.id}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2 max-w-[70%]">
                    <Text className="text-[14px]">{g.icon}</Text>
                    <Text className="text-leben-text font-medium text-[13px]" numberOfLines={1}>
                      {g.title}
                    </Text>
                  </View>
                  <Text className="text-leben-text-muted font-medium text-[11px]">
                    {progress}%
                  </Text>
                </View>
                
                <View className="h-[3px] rounded-full bg-leben-border overflow-hidden mb-3">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: 'var(--accent-blue)', // approximate linear-gradient fallback
                    }}
                  />
                </View>

                <View className="gap-1.5">
                  {safeGoal.milestones.slice(0, 3).map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => toggleMilestone(g.id, m.id)}
                      className="flex-row items-center gap-2"
                    >
                      <View 
                        className="w-[14px] h-[14px] rounded-full items-center justify-center"
                        style={{
                          backgroundColor: m.done ? 'rgba(124,106,240,0.2)' : 'transparent',
                          borderColor: m.done ? 'var(--accent-blue)' : 'var(--border-primary)',
                          borderWidth: 1,
                        }}
                      >
                        {m.done && <Text className="text-leben-accent text-[8px]">✓</Text>}
                      </View>
                      <Text 
                        className="flex-1 text-[11px]"
                        style={{ color: m.done ? 'var(--text-muted)' : 'var(--text-dim)' }}
                        numberOfLines={1}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {safeGoal.milestones.length > 3 && (
                    <TouchableOpacity onPress={() => router.push('/(tabs)/goals' as any)}>
                      <Text className="text-leben-text-dim text-[11px]">
                        +{g.milestones.length - 3} more
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          {goals.length > 2 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/goals' as any)} className="mt-2 items-center">
              <Text className="text-leben-text-dim text-[11px]">
                See all {goals.length} goals
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}
