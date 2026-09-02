import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function EfficiencyScore() {
  const userId = useLebenStore((s) => s.userId);
  const tasks = useLebenStore((s) => s.tasks);
  const habits = useLebenStore((s) => s.habits);
  const goals = useLebenStore((s) => s.goals);
  const books = useLebenStore((s) => s.books);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const analytics = useMemo(() => {
    if (!userId) return null;

    const today = new Date();
    const todayIso = today.toISOString().split("T")[0];

    // Build the 30-day date window
    const thirtyDayDates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0];
    });
    const weekDates     = thirtyDayDates.slice(0, 7);  // current period
    const baselineDates = thirtyDayDates.slice(7);     // days 8–30

    // ── Helper: per-day score (tasks + habits only — the two daily metrics) ──
    const getDayScore = (dateStr: string): number | null => {
      const dayScheduled  = tasks.filter((t) => t.date === dateStr).length;
      const dayCompleted  = tasks.filter((t) => t.completed && t.completedAt?.split("T")[0] === dateStr).length;
      const existingHabits = habits.filter((h) => !h.createdAt || h.createdAt.split("T")[0] <= dateStr);
      const habitsCompleted = existingHabits.filter((h) => h.completedDates?.includes(dateStr)).length;

      if (dayScheduled === 0 && existingHabits.length === 0) return null;

      let wSum = 0, wTotal = 0;
      if (dayScheduled > 0)       { wSum += (dayCompleted / dayScheduled) * 0.4; wTotal += 0.4; }
      if (existingHabits.length > 0) { wSum += (habitsCompleted / existingHabits.length) * 0.6; wTotal += 0.6; }
      return wTotal > 0 ? (wSum / wTotal) * 100 : null;
    };

    // ── Current 7-day full score (tasks + habits + milestones + books) ──────
    let totalScheduledTasks   = 0;
    let totalCompletedTasks   = 0;
    let totalPossibleHabitDays = 0;
    let totalCompletedHabitDays = 0;
    let weeklyActiveDays      = 0;

    for (const dateStr of weekDates) {
      const dayScheduled = tasks.filter((t) => t.date === dateStr).length;
      const dayCompleted = tasks.filter((t) => t.completed && t.completedAt?.split("T")[0] === dateStr).length;
      const existingHabits     = habits.filter((h) => !h.createdAt || h.createdAt.split("T")[0] <= dateStr);
      const dayHabitsCompleted = existingHabits.filter((h) => h.completedDates?.includes(dateStr)).length;
      const dayMilestones      = goals.reduce(
        (count, g) => count + g.milestones.filter((m) => m.done && m.completedAt?.split("T")[0] === dateStr).length,
        0,
      );

      totalScheduledTasks    += dayScheduled;
      totalCompletedTasks    += dayCompleted;
      totalPossibleHabitDays  += existingHabits.length;
      totalCompletedHabitDays += dayHabitsCompleted;
      if (dayScheduled > 0 || existingHabits.length > 0 || dayMilestones > 0) weeklyActiveDays++;
    }

    const totalMilestones          = goals.reduce((acc, g) => acc + g.milestones.length, 0);
    const totalCompletedMilestones = goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.done).length, 0);
    const totalBooks    = books.length;
    const engagedBooks  = books.filter(
      (b) => b.status === "finished" || (b.status === "reading" && b.currentPage > 0),
    ).length;

    const taskRate  = totalScheduledTasks    > 0 ? totalCompletedTasks    / totalScheduledTasks    : 0;
    const habitRate = totalPossibleHabitDays  > 0 ? totalCompletedHabitDays / totalPossibleHabitDays : 0;
    const goalRate  = totalMilestones         > 0 ? totalCompletedMilestones / totalMilestones       : 0;
    const bookRate  = totalBooks              > 0 ? engagedBooks             / totalBooks             : 0;

    const weights = { task: 0.4, habit: 0.3, goal: 0.2, book: 0.1 };
    let wSum = 0, wTotal = 0;
    if (totalScheduledTasks    > 0) { wSum += taskRate  * weights.task;  wTotal += weights.task;  }
    if (totalPossibleHabitDays  > 0) { wSum += habitRate * weights.habit; wTotal += weights.habit; }
    if (totalMilestones         > 0) { wSum += goalRate  * weights.goal;  wTotal += weights.goal;  }
    if (totalBooks              > 0) { wSum += bookRate  * weights.book;  wTotal += weights.book;  }

    const currentScore = wTotal > 0 ? (wSum / wTotal) * 100 : 0;

    // ── 30-day personal baseline (per-day average over days 8–30) ───────────
    const baselineScores = baselineDates
      .map((d) => getDayScore(d))
      .filter((s): s is number => s !== null);

    const hasBaseline  = baselineScores.length >= 5;
    const baselineAvg  = hasBaseline
      ? baselineScores.reduce((a, b) => a + b, 0) / baselineScores.length
      : null;
    const delta = baselineAvg !== null ? currentScore - baselineAvg : null;

    // ── Activity check (show score from day 1) ───────────────────────────────
    const hasAnyActivity =
      totalScheduledTasks > 0 || totalPossibleHabitDays > 0 || weeklyActiveDays > 0;

    // ── Rating: relative when baseline exists, absolute as fallback ──────────
    let rating: string;
    if (delta !== null) {
      if      (delta > 15)  rating = "Surging";
      else if (delta > 5)   rating = "Improving";
      else if (delta >= -5) rating = "Consistent";
      else if (delta >= -15) rating = "Slipping";
      else                  rating = "Falling";
    } else {
      // Absolute fallback while baseline is building
      if      (currentScore > 80) rating = "Elite";
      else if (currentScore > 60) rating = "Deep";
      else if (currentScore > 40) rating = "Steady";
      else                        rating = "Growth";
    }

    // Colour cue for the rating badge
    const ratingColor =
      delta !== null
        ? delta > 5  ? "#22c55e"
        : delta < -5 ? "#ef4444"
        : "#6b7fff"
        : "#6b7fff";

    return {
      score:        Math.round(currentScore),
      baselineAvg:  baselineAvg !== null ? Math.round(baselineAvg) : null,
      delta:        delta       !== null ? Math.round(delta)       : null,
      hasBaseline,
      hasAnyActivity,
      rating,
      ratingColor,
    };
  }, [userId, tasks, habits, goals, books]);


  // Animation
  const progress = useSharedValue(0);

  useEffect(() => {
    if (analytics && analytics.hasAnyActivity) {
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

  const { colorScheme } = useColorScheme();
  const strokeBorder = colorScheme === "dark" ? "#1e1e1e" : "#e5e5ea";
  const strokeSubtle = colorScheme === "dark" ? "#1a1a1a" : "#f4f4f5";
  const strokeAccent = "#6b7fff";

  return (
    <Card className="min-h-[260px] items-center justify-center p-7 bg-leben-bg-card border border-leben-border-subtle">
      <Text className="uppercase tracking-widest text-leben-text-dim text-[10px] font-geist-semibold mb-6">
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
                stroke={strokeBorder}
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
                stroke={strokeBorder}
                strokeWidth="6"
              />
              <Circle
                cx={70}
                cy={70}
                r={54}
                fill="none"
                stroke={strokeSubtle}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray="8 6"
                originX={70}
                originY={70}
                rotation={-90}
              />
            </Svg>
            <View className="absolute">
              <Text className="text-leben-text-dim text-2xl font-geist-medium">🔒</Text>
            </View>
          </View>
          <Text className="text-leben-text-muted text-xs text-center leading-relaxed mb-4 font-geist-medium">
            Sign in to analyze{"\n"}your daily performance.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in" as any)}
            className="px-4 py-2 rounded-lg border border-[rgba(124,106,240,0.25)] bg-[rgba(124,106,240,0.1)] active:opacity-70"
          >
            <Text className="text-leben-accent font-geist-semibold text-xs">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      ) : !analytics || !analytics.hasAnyActivity ? (
        <View className="items-center justify-center w-full">
          <View className="relative items-center justify-center mb-5">
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Circle cx="70" cy="70" r="54" fill="none" stroke={strokeBorder} strokeWidth="8" />
              <Circle
                cx={70} cy={70} r={54} fill="none"
                stroke={strokeSubtle} strokeWidth={8}
                strokeLinecap="round" strokeDasharray="12 8"
                originX={70} originY={70} rotation={-90}
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-leben-text-dim text-3xl font-geist-bold leading-none">—</Text>
              <Text className="text-leben-text-dim text-[9px] uppercase tracking-widest mt-1 font-geist-medium">
                No data
              </Text>
            </View>
          </View>
          <Text className="text-leben-text-dim text-[11px] text-center leading-relaxed font-geist-medium">
            Start tracking to{"\n"}see your score.
          </Text>
        </View>
      ) : (
        <View className="items-center justify-center w-full">
          <View className="relative items-center justify-center mb-5">
            <Svg width="140" height="140" viewBox="0 0 140 140">
              <Defs>
                <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#6b7fff" stopOpacity="1" />
                  <Stop offset="1" stopColor="#5a6bff" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Circle cx="70" cy="70" r="54" fill="none" stroke={strokeBorder} strokeWidth="8" />
              <AnimatedCircle
                cx={70} cy={70} r={54} fill="none"
                stroke="url(#scoreGrad)" strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                originX={70} originY={70} rotation={-90}
                animatedProps={animatedProps}
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-leben-text text-3xl font-geist-black tracking-tight">
                {analytics.score}%
              </Text>
              <Text
                style={{ color: analytics.ratingColor }}
                className="text-[10px] uppercase tracking-widest font-geist-semibold mt-1"
              >
                {analytics.rating}
              </Text>
            </View>
          </View>

          {/* Delta vs personal baseline */}
          {analytics.delta !== null ? (
            <Text className="text-leben-text-dim text-[11px] text-center leading-relaxed font-geist-medium">
              {analytics.delta > 5
                ? "You're outperforming your usual pace.\n"
                : analytics.delta < -5
                  ? "You're falling behind your usual pace.\n"
                  : "You're right on track with your usual pace.\n"}
              <Text className="opacity-70 text-[10px]">
                This week: {analytics.score}% • Your avg: {analytics.baselineAvg}%
              </Text>
            </Text>
          ) : (
            <Text className="text-leben-text-dim text-[11px] text-center leading-relaxed font-geist-medium">
              Building your baseline…{"\n"}keep tracking daily.
            </Text>
          )}
        </View>
      )}
    </Card>
  );
}
