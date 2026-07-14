import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter }     from 'expo-router';
import { useLebenStore } from '@/store/useStore';
import { getAIBrief }    from '@/lib/ai/client';
import { Card }          from '@/components/ui/Card';
import { Badge }         from '@/components/ui/Badge';
import { LC }            from '@/constants/theme';
import type { AIBriefResponse } from '@/lib/ai/client';

export function AIMorningBrief() {
  const router = useRouter();
  const { tasks, habits, goals, userId } = useLebenStore();

  const [brief, setBrief]       = useState<AIBriefResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [unavailable, setUnavail] = useState(false);

  const hasData = tasks.length > 0 || habits.length > 0 || goals.length > 0;

  const handleGenerate = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      router.push('/(auth)/sign-in' as any);
      return;
    }
    setLoading(true);
    setError(null);
    setUnavail(false);

    try {
      const result = await getAIBrief({ forceRefresh });
      setBrief(result);
    } catch (err: any) {
      console.error('Morning brief failed:', err);
      if (err?.message?.includes('busy') || err?.message?.includes('demand')) {
        setUnavail(true);
      } else {
        setError(err?.message ?? "Couldn't generate brief. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  // Initial load logic matching web
  const isFirstRun = useRef(true);
  const prevTasksCount = useRef(tasks.length);

  useEffect(() => {
    if (!hasData || !userId) {
      setBrief(null);
      return;
    }
    if (isFirstRun.current) {
      isFirstRun.current = false;
      prevTasksCount.current = tasks.length;
      handleGenerate();
    } else if (tasks.length !== prevTasksCount.current) {
      prevTasksCount.current = tasks.length;
      const timeoutId = setTimeout(() => handleGenerate(), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [hasData, userId, tasks.length, handleGenerate]);

  return (
    <Card className="min-h-[260px] justify-between p-5" style={{ backgroundColor: '#111' }}>
      <View>
        {/* Header */}
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="text-leben-accent text-lg">✦</Text>
          <Text className="text-leben-accent text-[11px] uppercase tracking-widest font-semibold">
            AI MORNING BRIEF
          </Text>
        </View>

        {/* Headline */}
        <Text className="text-leben-text text-2xl font-bold tracking-tight mb-4 leading-tight">
          {hasData ? (
            brief ? brief.summary : 'Ready to plan your day?'
          ) : (
            <Text>Welcome to <Text className="text-leben-accent">Leben.</Text></Text>
          )}
        </Text>

        {/* Content */}
        {hasData ? (
          <View className="gap-3">
            {loading && (
              <View className="gap-2 opacity-50">
                <View className="h-3 bg-leben-bg-secondary rounded-full w-3/4" />
                <View className="h-3 bg-leben-bg-secondary rounded-full w-1/2" />
              </View>
            )}

            {error && !loading && !unavailable && (
              <Text className="text-leben-error text-[13px]">{error}</Text>
            )}

            {unavailable && !loading && (
              <View className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] p-3 rounded-xl">
                <Text className="text-[#f59e0b] text-[13px] leading-snug">
                  ⏳ The AI is experiencing high demand right now. This is temporary — try again in a moment.
                </Text>
              </View>
            )}

            {brief && !loading && (
              <View className="flex-row flex-wrap gap-2">
                {brief.insights.slice(0, 2).map((insight, i) => (
                  <Badge key={i} label={insight} variant="primary" numberOfLines={0} />
                ))}
              </View>
            )}

            {!brief && !loading && !error && (
              <Text className="text-[#555] text-[13px] leading-relaxed">
                Your AI morning brief will appear here. Hit the button below to generate it.
              </Text>
            )}
          </View>
        ) : (
          <Text className="text-[#555] text-[13px] leading-relaxed">
            Your AI morning brief will appear here once you've added tasks, habits, and goals. Start by creating your first task.
          </Text>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-3 mt-6">
        {hasData ? (
          <>
            {!brief && (error || unavailable) && (
              <TouchableOpacity
                onPress={() => handleGenerate(true)}
                disabled={loading}
                className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl bg-leben-accent active:opacity-80"
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Text className="text-white font-semibold text-[14px]">Retry Brief</Text>
                    <Text className="text-white">✦</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {brief && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/planner' as any)}
                className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl bg-leben-accent active:opacity-80"
              >
                <Text className="text-white font-semibold text-[14px]">Plan My Day</Text>
                <Text className="text-white">›</Text>
              </TouchableOpacity>
            )}

            {brief && !loading && (
              <TouchableOpacity
                onPress={() => handleGenerate(true)}
                className="px-4 py-3 rounded-xl border border-leben-border active:opacity-70"
              >
                <Text className="text-[#555] font-medium text-[13px]">Regenerate</Text>
              </TouchableOpacity>
            )}

            {!brief && !loading && !error && !unavailable && (
              <TouchableOpacity
                onPress={() => handleGenerate()}
                disabled={loading}
                className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl bg-leben-accent active:opacity-80"
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Text className="text-white font-semibold text-[14px]">Generate Brief</Text>
                    <Text className="text-white">✦</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tasks' as any)}
              className="flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-leben-bg-element border border-leben-border active:opacity-80"
            >
              <Text className="text-leben-text font-medium text-[13px]">Create first task</Text>
              <Text className="text-leben-text">›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/habits' as any)}
              className="px-4 py-2.5 rounded-lg border border-leben-border active:opacity-70"
            >
              <Text className="text-[#666] font-medium text-[13px]">Set up habits</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Card>
  );
}
