import type { Task, Habit } from "@/store/useStore";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StatCard {
  label: string;
  val: string;
  sub: string;
  up: boolean | null;
}

export interface DayActivity {
  day: string;
  tasks: number;
  habits: number;
  focusHours: number;
}

export interface ProductivityData {
  score: number;
  trend: number[];
  taskCount: number;
  habitCount: number;
  deepWorkSessions: number;
  avgDailyScore: number;
}

export interface AnalyticsData {
  statCards: StatCard[];
  weekActivity: DayActivity[];
  productivity: ProductivityData;
  topHabits: any[]; // HabitStats type simplified
  goalProgress: any[];
  aiInsights: any[];
  hasTaskData: boolean;
  hasHabitData: boolean;
  hasGoalData: boolean;
}

// ─── Date helpers ────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return toISODate(d);
  });
}

export function currentWeekDates(): { isoDate: string; label: string }[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      isoDate: toISODate(d),
      label: DAY_LABELS[d.getDay()],
    };
  });
}

// ─── Stat card computation ────────────────────────────────────────────────────

export function computeStatCards(
  tasks: Task[],
  habits: Habit[],
  goals: any[],
): StatCard[] {
  const completedTasks = tasks.filter((t) => t.completed).length;

  const last7 = lastNDays(7);
  const totalExpected = habits.length * 7;
  const totalActual = habits.reduce(
    (sum, h) =>
      sum + (h.completedDates ?? []).filter((d) => last7.includes(d)).length,
    0,
  );
  const habitPct =
    totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : 0;

  const activeGoals = goals.length;

  return [
    {
      label: "Tasks Completed",
      val: completedTasks.toString(),
      sub: completedTasks > 0 ? "total completed" : "no tasks yet",
      up: completedTasks > 0 ? true : null,
    },
    {
      label: "Habit Consistency",
      val: totalExpected > 0 ? `${habitPct}%` : "--",
      sub: totalExpected > 0 ? "last 7 days" : "no habits tracked",
      up: habitPct >= 70 ? true : habitPct > 0 ? false : null,
    },
    {
      label: "Focus Hours",
      val: "--", 
      sub: "focus timer coming soon",
      up: null,
    },
    {
      label: "Goals Active",
      val: activeGoals > 0 ? activeGoals.toString() : "--",
      sub: activeGoals > 0 ? `${activeGoals} in progress` : "no goals yet",
      up: null,
    },
  ];
}

// ─── Weekly bar chart data ───────────────────────────────────────────────────

export function computeWeekActivity(
  tasks: Task[],
  habits: Habit[],
): DayActivity[] {
  const week = currentWeekDates();

  return week.map(({ isoDate, label }) => {
    const dayTasks = tasks.filter((t) => t.completedAt?.startsWith(isoDate)).length;
    const dayHabits = habits.reduce(
      (sum, h) => sum + ((h.completedDates ?? []).includes(isoDate) ? 1 : 0),
      0,
    );
    return {
      day: label,
      tasks: dayTasks,
      habits: dayHabits,
      focusHours: 0, 
    };
  });
}

export function computeProductivity(
  tasks: Task[],
  habits: Habit[],
): ProductivityData {
  const last30 = lastNDays(30);

  const trend = last30.map((isoDate) => {
    const dayTasks = tasks.filter((t) => t.completedAt?.startsWith(isoDate)).length;
    const dayHabits = habits.reduce(
      (sum, h) => sum + ((h.completedDates ?? []).includes(isoDate) ? 1 : 0),
      0,
    );
    const taskScore = Math.min(dayTasks / 5, 1) * 60;
    const habitScore = habits.length > 0 ? (dayHabits / habits.length) * 40 : 0;
    return Math.round(taskScore + habitScore);
  });

  const nonZero = trend.filter((s) => s > 0);
  const avgDailyScore =
    nonZero.length > 0
      ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length)
      : 0;

  const latestScore = trend[trend.length - 1];

  return {
    score: latestScore,
    trend,
    taskCount: tasks.length,
    habitCount: habits.length,
    deepWorkSessions: 0,
    avgDailyScore,
  };
}

export function computeHabitStats(habits: Habit[]): any[] {
  const last30 = lastNDays(30);
  return habits
    .map((h) => ({
      label: h.label,
      icon: h.icon,
      color: h.color,
      streak: h.streak,
      consistency: ((h.completedDates ?? []).filter((d) => last30.includes(d)).length / 30)
    }))
    .sort((a, b) => b.consistency - a.consistency)
    .slice(0, 4);
}

export function buildAnalyticsData(
  tasks: Task[],
  habits: Habit[],
  goals: any[],
): AnalyticsData {
  const hasTaskData = tasks.length > 0;
  const hasHabitData = habits.length > 0;
  const hasGoalData = goals.length > 0;

  return {
    statCards: computeStatCards(tasks, habits, goals),
    weekActivity: computeWeekActivity(tasks, habits),
    productivity: computeProductivity(tasks, habits),
    topHabits: computeHabitStats(habits),
    goalProgress: [],
    aiInsights: [],
    hasTaskData,
    hasHabitData,
    hasGoalData,
  };
}
