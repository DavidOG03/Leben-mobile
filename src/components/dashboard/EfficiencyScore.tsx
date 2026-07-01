import { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  withTiming,
  Easing,
  useSharedValue,
} from "react-native-reanimated";
import { useLebenStore } from "@/store/useStore";
import { Card } from "@/components/ui/Card";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function EfficiencyScore() {
  const router = useRouter();
  const userId = useLebenStore((s) => s.userId);
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const analytics = useMemo(() => {
    if (!userId) return null;

    const today = new Date();
    const todayIso = today.toISOString().split("T")[0];
    const weekDates = Array.from({ length: 7 }, (_, offset) => {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      return d.toISOString().split("T")[0];
    });

    const allActivityDates = [
      ...tasks
        .map((t) => t.completedAt || t.date)
        .filter(Boolean)
        .map((value) => value!.split("T")[0]),
      ...habits.flatMap((h) => h.completedDates ?? []),
      ...goals.flatMap(
        (g) =>
          g.milestones
            .filter((m) => m.done && m.id) // web uses m.done
            .map((m) => todayIso),
      ),
    ];

    const sortedDates = allActivityDates.sort();
    const firstActivityDate = sortedDates[0];
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceFirstActivity = firstActivityDate
      ? Math.floor(
          (new Date(todayIso).getTime() -
            new Date(firstActivityDate).getTime()) /
            msPerDay,
        )
      : 0;

    let totalScheduledTasks = 0;
    let totalCompletedTasks = 0;
    let totalCompletedHabits = 0;
    let totalCompleteGoals = 0;
    let weeklyActiveDays = 0;

    for (const dateStr of weekDates) {
      // Use task.date for scheduled count to avoid double-counting tasks
      // completed on a different day than they were scheduled.
      const dayScheduled = tasks.filter((t) => t.date === dateStr).length;
      const dayCompleted = tasks.filter(
        (t) => t.completed && t.completedAt?.split("T")[0] === dateStr,
      ).length;
      const dayHabits = habits.filter((h) =>
        h.completedDates?.includes(dateStr),
      ).length;

      totalScheduledTasks += dayScheduled;
      totalCompletedTasks += dayCompleted;
      totalCompletedHabits += dayHabits;

      if (dayScheduled > 0 || dayHabits > 0) {
        weeklyActiveDays += 1;
      }
    }

    const totalPossibleHabits = habits.length * 7;
    const totalMilestones = goals.reduce(
      (acc, g) => acc + g.milestones.length,
      0,
    );
    const totalCompletedMilestones = goals.reduce(
      (acc, g) => acc + g.milestones.filter((m) => m.done).length,
      0,
    );

    const taskRate =
      totalScheduledTasks > 0 ? totalCompletedTasks / totalScheduledTasks : 0;
    const habitRate =
      totalPossibleHabits > 0 ? totalCompletedHabits / totalPossibleHabits : 0;
    const goalRate =
      totalMilestones > 0 ? totalCompletedMilestones / totalMilestones : 0;

    const weights = { task: 0.4, habit: 0.3, goal: 0.3 };
    let activeWeightsCount = 0;
    if (totalScheduledTasks > 0) activeWeightsCount += weights.task;
    if (totalPossibleHabits > 0) activeWeightsCount += weights.habit;
    if (totalMilestones > 0) activeWeightsCount += weights.goal;

    const finalScore =
      activeWeightsCount > 0
        ? (((totalScheduledTasks > 0 ? taskRate * weights.task : 0) +
            (totalPossibleHabits > 0 ? habitRate * weights.habit : 0) +
            (totalMilestones > 0 ? goalRate * weights.goal : 0)) /
            activeWeightsCount) *
          100
        : 0;

    const hasEnoughData =
      firstActivityDate !== undefined &&
      daysSinceFirstActivity >= 6 &&
      weeklyActiveDays > 0;

    return {
      score: Math.round(finalScore),
      hasEnoughData,
      rating:
        finalScore > 80
          ? "Elite"
          : finalScore > 60
            ? "Deep"
            : finalScore > 40
              ? "Steady"
              : "Growth",
    };
  }, [userId, tasks, habits, goals]);

  // Animation
  const progress = useSharedValue(0);

  useEffect(() => {
    if (analytics && analytics.hasEnoughData) {
      progress.value = withTiming(analytics.score / 100, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [analytics]);

  const animatedProps = useAnimatedProps(() => {
    const r = 54;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <Card
      className="min-h-[260px] items-center justify-center p-7"
      style={{ backgroundColor: "#121212", borderColor: "#1e1e1e" }}
    >
      <Text className="uppercase tracking-widest text-[#444] text-[10px] font-semibold mb-6">
        Efficiency Score
      </Text>

      {loading ? (
        <View className="items-center justify-center w-full opacity-50">
          <View className="relative items-center justify-center mb-5">
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="6"
              />
            </Svg>
            <View className="absolute w-10 h-10 rounded-full bg-white/5" />
          </View>
          <View className="w-24 h-3 bg-leben-bg-secondary rounded-full mb-3" />
          <View className="w-20 h-8 bg-leben-bg-secondary rounded-lg" />
        </View>
      ) : !userId ? (
        <View className="items-center justify-center w-full">
          <View className="relative items-center justify-center mb-5">
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="6"
              />
              <Circle
                cx={70}
                cy={70}
                r={54}
                fill="none"
                stroke="#252525"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray="8 6"
                originX={70}
                originY={70}
                rotation={-90}
              />
            </Svg>
            <View className="absolute">
              <Text className="text-[#333] text-2xl">🔒</Text>
            </View>
          </View>
          <Text className="text-[#555] text-xs text-center leading-relaxed mb-4">
            Sign in to analyze{"\n"}your daily performance.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in" as any)}
            className="px-4 py-2 rounded-lg border border-[rgba(124,106,240,0.25)] bg-[rgba(124,106,240,0.1)] active:opacity-70"
          >
            <Text className="text-leben-accent font-semibold text-xs">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      ) : !analytics || !analytics.hasEnoughData ? (
        <View className="items-center justify-center w-full">
          <View className="relative items-center justify-center mb-5">
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="8"
              />
              <Circle
                cx={70}
                cy={70}
                r={54}
                fill="none"
                stroke="#252525"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray="12 8"
                originX={70}
                originY={70}
                rotation={-90}
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-[#2e2e2e] text-3xl font-bold leading-none">
                —
              </Text>
              <Text className="text-[#2e2e2e] text-[9px] uppercase tracking-widest mt-1">
                No data
              </Text>
            </View>
          </View>
          <Text className="text-[#333] text-[11px] text-center leading-relaxed">
            Score appears after{"\n"}your first active week
          </Text>
        </View>
      ) : (
        <View className="items-center justify-center w-full">
          <View className="relative items-center justify-center mb-5">
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="8"
              />
              <AnimatedCircle
                cx={70}
                cy={70}
                r={54}
                fill="none"
                stroke="#7c6af0"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                originX={70}
                originY={70}
                rotation={-90}
                animatedProps={animatedProps}
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-[#f0f0f0] text-3xl font-extrabold tracking-tight">
                {analytics.score}%
              </Text>
              <Text className="text-leben-accent text-[10px] uppercase tracking-widest font-semibold mt-1">
                {analytics.rating}
              </Text>
            </View>
          </View>
          <Text className="text-[#666] text-xs text-center leading-relaxed">
            Based on your activity{"\n"}over the last 7 days.
          </Text>
        </View>
      )}
    </Card>
  );
}
