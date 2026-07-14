import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { Timeline } from '@/components/planner/Timeline';
import { AIInsightsCard } from '@/components/planner/AIInsightsCard';
import { TodaysFocusCard } from '@/components/planner/TodaysFocusCard';
import { EnergyDistribution } from '@/components/planner/EnergyDistribution';
import { EmptyPlannerState } from '@/components/planner/EmptyPlannerState';
import { RefreshIcon, PlusIcon, TrashIcon } from '@/constants/Icons';
import { generateDayPlan } from '@/lib/ai/aiPlanner';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '@/components/shared/ScreenLayout';

export default function PlannerScreen() {
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);
  const schedule = useLebenStore((s) => s.schedule);
  const setSchedule = useLebenStore((s) => s.setSchedule);
  const router = useRouter();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [mainFocus, setMainFocus] = useState<{ title: string; reason: string } | null>(null);

  const isAlive = tasks.length > 1;

  useEffect(() => {
    if (isAlive && schedule.length === 0 && !isRegenerating) {
      handleRegenerate(false);
    }
  }, [isAlive]);

  const handleRegenerate = async (forceRefresh = true) => {
    if (!isAlive) return;

    setIsRegenerating(true);
    setInsightsLoading(true);

    try {
      const { schedule: newSchedule, insights, mainFocus: newMainFocus } = await generateDayPlan(
        { tasks, habits, goals },
        undefined,
        forceRefresh
      );

      setSchedule(newSchedule);
      setAiInsights(insights);
      if (newMainFocus) setMainFocus(newMainFocus);
    } catch (err: any) {
      console.error('Planner AI failed:', err);
      Alert.alert('AI Error', err.message || 'Failed to generate plan.');
    } finally {
      setIsRegenerating(false);
      setInsightsLoading(false);
    }
  };

  if (!isAlive) {
    return (
      <ScreenLayout>
        <EmptyPlannerState taskCount={tasks.length} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <View className="flex-col gap-10 px-4 md:px-10 py-6 md:py-8 bg-leben-bg">
        
        {/* Page Header */}
        <View className="flex-col md:flex-row items-start justify-between gap-6">
          <View className="flex-col gap-3">
            <View className="flex-row items-center gap-3">
              <View
                className="px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: 'rgba(124, 106, 240, 0.1)',
                  borderColor: 'rgba(124, 106, 240, 0.2)',
                }}
              >
                <Text style={{ color: '#7c6af0', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>
                  AI GENERATED
                </Text>
              </View>
            </View>
            <Text
              className="text-white font-bold"
              style={{ fontSize: 32, letterSpacing: -0.5 }}
            >
              Your Day, Planned
            </Text>
            <Text className="text-[#666]" style={{ fontSize: 14, lineHeight: 22, maxWidth: 480 }}>
              Optimized for your current energy peaks and high-priority deliverables.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleRegenerate(true)}
            disabled={isRegenerating}
            className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl border"
            style={{
              backgroundColor: '#161616',
              borderColor: '#222',
              opacity: isRegenerating ? 0.5 : 1,
            }}
          >
            <RefreshIcon color="#eee" size={14} />
            <Text style={{ color: '#eee', fontSize: 13, fontWeight: 'bold' }}>
              {isRegenerating ? 'Regenerating...' : 'Regenerate Plan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-col gap-10">
          <View>
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-white font-bold" style={{ fontSize: 18 }}>
                Timeline
              </Text>
            </View>
            <Timeline />
          </View>

          <View className="flex-col gap-6">
            <AIInsightsCard insights={aiInsights} isLoading={insightsLoading} />
            <TodaysFocusCard focusItems={mainFocus ? [mainFocus] : []} />
            <EnergyDistribution />
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="flex-col gap-8 mb-12">
          <View className="flex-row items-center gap-4 flex-wrap">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tasks' as any)}
              className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl border flex-1 min-w-[140px]"
              style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}
            >
              <PlusIcon color="#666" size={16} />
              <Text style={{ color: '#666', fontSize: 13, fontWeight: 'bold' }}>Add Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSchedule([])}
              className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl border flex-1 min-w-[140px]"
              style={{ backgroundColor: '#111', borderColor: '#1e1e1e' }}
            >
              <TrashIcon color="#e85555" size={14} />
              <Text style={{ color: '#e85555', fontSize: 13, fontWeight: 'bold' }}>Clear Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
    </ScreenLayout>
  );
}
