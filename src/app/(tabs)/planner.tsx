import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '@/components/shared/ScreenLayout';
import { useLebenStore } from '@/store/useStore';
import { DaySchedule } from '@/components/planner/DaySchedule';
import { getAIDayPlan } from '@/lib/ai/client';

export default function PlannerScreen() {
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);
  const dayPlan = useLebenStore((s) => s.dayPlan);
  const setDayPlan = useLebenStore((s) => s.setDayPlan);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  
  const isAlive = tasks.length > 1;

  // Auto-generate on first load if schedule is empty
  useEffect(() => {
    if (isAlive && (!dayPlan || dayPlan.schedule.length === 0) && !isRegenerating) {
      handleRegenerate(false);
    }
  }, [isAlive, dayPlan?.schedule?.length]);

  const handleRegenerate = async (forceRefresh = true) => {
    if (!isAlive) return;

    setIsRegenerating(true);

    try {
      const result = await getAIDayPlan({ forceRefresh });
      
      setDayPlan({
        mainFocus: result.mainFocus || '',
        schedule: result.schedule,
        insights: result.insights,
        generatedAt: new Date().toISOString()
      });
      setAiInsights(result.insights.map((i) => i.text));
    } catch (err: any) {
      console.error('Planner AI failed:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const schedule = dayPlan?.schedule || [];

  return (
    <ScreenLayout scrollable>
      <View className="flex-1 px-4 py-6">
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="px-2 py-0.5 rounded bg-[rgba(124,106,240,0.1)] border border-[rgba(124,106,240,0.2)]">
              <Text className="text-[#7c6af0] font-bold text-[9px] tracking-widest">
                AI GENERATED
              </Text>
            </View>
          </View>
          
          <Text className="text-white font-bold text-3xl tracking-tight leading-tight mb-2">
            Your Day, Planned
          </Text>
          <Text className="text-[#666] text-[13px] leading-relaxed mb-6">
            Optimized for your current energy peaks and high-priority deliverables.
          </Text>

          <TouchableOpacity
            onPress={() => handleRegenerate(true)}
            disabled={isRegenerating || !isAlive}
            className="flex-row items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[#222]"
            style={{ backgroundColor: '#161616', opacity: (isRegenerating || !isAlive) ? 0.7 : 1 }}
          >
            {isRegenerating ? (
              <ActivityIndicator size="small" color="#eee" />
            ) : (
              <Text className="text-white">↻</Text>
            )}
            <Text className="text-[#eee] font-bold text-[13px]">
              {isRegenerating ? 'Generating...' : 'Regenerate Plan'}
            </Text>
          </TouchableOpacity>
        </View>

        {(dayPlan?.insights?.length || 0) > 0 && (
          <View className="mb-8 p-4 rounded-xl border border-[#1e1e1e] bg-[#111]">
            <Text className="text-white font-bold mb-2">AI Insights</Text>
            {dayPlan!.insights.map((insight, idx) => (
              <View key={idx} className="flex-row items-start gap-2 mb-2">
                <Text className="text-[#7c6af0] mt-1">•</Text>
                <Text className="text-[#aaa] text-[13px] leading-relaxed flex-1">
                  {insight.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white font-bold text-[18px]">Timeline</Text>
        </View>

        <DaySchedule schedule={schedule} />
      </View>
    </ScreenLayout>
  );
}
