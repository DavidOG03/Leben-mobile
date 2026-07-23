import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AIInsightsCard } from "@/components/planner/AIInsightsCard";
import { EmptyPlannerState } from "@/components/planner/EmptyPlannerState";
import { EnergyDistribution } from "@/components/planner/EnergyDistribution";
import { Timeline } from "@/components/planner/Timeline";
import { TodaysFocusCard } from "@/components/planner/TodaysFocusCard";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { Text } from "@/components/ui/Text";
import { PlusIcon, RefreshIcon, SparkleIcon, TrashIcon } from "@/constants/Icons";
import { generateDayPlan } from "@/lib/ai/aiPlanner";
import { useLebenStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";

export default function PlannerScreen() {
  const userId = useLebenStore((s) => s.userId);
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);
  const schedule = useLebenStore((s) => s.schedule);
  const setSchedule = useLebenStore((s) => s.setSchedule);
  const router = useRouter();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [mainFocus, setMainFocus] = useState<{
    title: string;
    reason: string;
  } | null>(null);

  const isAlive = tasks.length > 1;

  useEffect(() => {
    if (userId && isAlive && schedule.length === 0 && !isRegenerating) {
      handleRegenerate(false);
    }
  }, [isAlive, userId]);

  if (!userId) {
    return (
      <ScreenLayout scrollable>
        <DashboardHeader />
        <View className="flex-1 items-center justify-center pt-10 pb-20 px-6">
          <View
            className="items-center justify-center rounded-2xl mb-6"
            style={{
              width: 72,
              height: 72,
              backgroundColor: "rgba(124,106,240,0.08)",
              borderColor: "rgba(124,106,240,0.2)",
              borderWidth: 1,
            }}
          >
            <SparkleIcon size={32} color="#7c6af0" />
          </View>

          <View className="items-center mb-8">
            <Text
              className="text-leben-text font-black text-center"
              style={{ fontSize: 28, letterSpacing: -0.5, marginBottom: 8 }}
            >
              Neural <Text className="text-leben-accent">Day Planner</Text>
            </Text>
            <Text className="text-center text-leben-text-muted text-[15px] leading-[22px] max-w-[340px]">
              Sign in to unlock AI automated day scheduling, energy peak matching, and intelligent focus recommendations.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in" as any)}
            className="flex-row items-center gap-3 px-8 py-4 rounded-xl mb-8 bg-leben-accent shadow-lg"
          >
            <Text className="text-white font-bold text-[15px]">
              Sign In to Unlock Day Planner
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  const handleRegenerate = async (forceRefresh = true) => {
    if (!isAlive) return;

    setIsRegenerating(true);
    setInsightsLoading(true);

    try {
      const {
        schedule: newSchedule,
        insights,
        mainFocus: newMainFocus,
      } = await generateDayPlan(
        { tasks, habits, goals },
        undefined,
        forceRefresh,
      );

      setSchedule(newSchedule);
      setAiInsights(insights);
      if (newMainFocus) setMainFocus(newMainFocus);
    } catch (err: any) {
      console.error("Planner AI failed:", err);
      Alert.alert("AI Error", err.message || "Failed to generate plan.");
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
      <DashboardHeader />
      <View className="flex-col gap-10 px-4 md:px-10 py-6 md:py-8 bg-leben-bg">
        {/* Page Header */}
        <View className="flex-col md:flex-row items-start justify-between gap-6">
          <View className="flex-col gap-3">
            <Text
              className="text-leben-text font-bold"
              style={{ fontSize: 32, letterSpacing: -0.5 }}
            >
              Your Day, Planned
            </Text>
            <Text
              className="text-leben-text-dim"
              style={{ fontSize: 14, lineHeight: 22, maxWidth: 480 }}
            >
              Optimized for your current energy peaks and high-priority
              deliverables.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleRegenerate(true)}
            disabled={isRegenerating}
            className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl border bg-leben-bg-card border-leben-border"
            style={{ opacity: isRegenerating ? 0.5 : 1 }}
          >
            <RefreshIcon color="#a1a1a1" size={14} />
            <Text className="text-leben-text-2 font-bold text-[13px]">
              {isRegenerating ? "Regenerating..." : "Regenerate Plan"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-col gap-10">
          <View>
            <View className="flex-row items-center justify-between mb-8">
              <Text
                className="text-leben-text-2 font-bold"
                style={{ fontSize: 18 }}
              >
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
              onPress={() => router.push("/(tabs)/tasks" as any)}
              className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl border flex-1 min-w-[140px] bg-leben-bg-card border-leben-border"
            >
              <PlusIcon color="#666" size={16} />
              <Text className="text-leben-text font-bold text-[13px]">
                Add Task
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSchedule([])}
              className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl border flex-1 min-w-[140px] bg-leben-bg-card border-leben-border"
            >
              <TrashIcon color="#e85555" size={14} />
              <Text className="text-leben-error font-bold text-[13px]">
                Clear Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}
