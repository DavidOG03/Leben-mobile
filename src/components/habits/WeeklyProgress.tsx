import React, { useMemo } from "react";
import { View, Text } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Habit } from "@/store/useStore";
import { WeeklyProgressProps } from "@/utils/habits.types";
import { calcStreak, calcLongestStreak } from "@/utils/habits";
import { Card } from "@/components/ui/Card";

const daysLabels = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Maps a completion ratio (0–1) to an intensity colour.
 * 0 = skipped (no colour), >0 = increasingly bright purple.
 */
function dayColor(ratio: number, isToday: boolean): string {
  if (ratio <= 0) return "#1a1a1a"; // skipped — no colour
  if (isToday) return "today"; // flag for svg gradient
  if (ratio <= 0.33) return "#1e2a4a";
  if (ratio <= 0.66) return "#3a3580";
  return "#5a4fd4";
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ habits }) => {
  const weeklyAnalytics = useMemo(() => {
    const today = new Date();
    const data = [];
    let totalCompletedThisWeek = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = daysLabels[date.getDay()];
      const isToday = i === 0;

      const completedOnDay = habits.filter((h) =>
        h.completedDates?.includes(dateStr),
      ).length;

      // A day is "active" if at least one habit was tracked, OR books were updated.
      // We infer book updates from the habit data available; treat completedOnDay > 0 as active.
      const isSkipped = completedOnDay === 0;
      const ratio = habits.length > 0 ? completedOnDay / habits.length : 0;

      data.push({
        day: dayLabel,
        pct: ratio * 100,
        count: completedOnDay,
        date: dateStr,
        isToday,
        isSkipped,
        ratio,
      });

      totalCompletedThisWeek += completedOnDay;
    }

    // Compute current streak and longest streak across all habits
    // using the existing calcStreak/calcLongestStreak helpers.
    const allDates = habits.flatMap((h) => h.completedDates ?? []);

    // Streak resets when a day is skipped — calcStreak already handles this
    // by walking backwards from today/yesterday and stopping at the first miss.
    const currentStreak =
      habits.length > 0
        ? Math.min(...habits.map((h) => calcStreak(h.completedDates ?? [])))
        : 0;

    const longestStreak =
      habits.length > 0
        ? Math.max(
            0,
            ...habits.map((h) => calcLongestStreak(h.completedDates ?? [])),
          )
        : 0;

    return {
      days: data,
      dailyAverage: totalCompletedThisWeek / 7,
      currentStreak,
      longestStreak,
      hasData: totalCompletedThisWeek > 0,
    };
  }, [habits]);

  return (
    <Card
      variant="none"
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#111111", borderColor: "#1e1e1e", borderWidth: 1 }}
    >
      <Text className="font-semibold text-white mb-1" style={{ fontSize: 14 }}>
        Weekly Progress
      </Text>
      <Text style={{ fontSize: 10, color: "#333333", marginBottom: 14 }}>
        Coloured days = habits tracked · Grey = skipped
      </Text>

      {!weeklyAnalytics.hasData ? (
        <>
          {/* Ghost bars */}
          <View className="flex-row items-end gap-2 mb-2" style={{ height: 70 }}>
            {[0.3, 0.45, 0.4, 0.55, 0.35, 0.25, 0.2].map((h, i) => (
              <View
                key={i}
                className="flex-1"
                style={{
                  height: `${h * 100}%`,
                  backgroundColor: "#1a1a1a",
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
                }}
              />
            ))}
          </View>
          <View className="flex-row justify-between mb-3">
            {daysLabels.map((l, i) => (
              <Text key={i} style={{ fontSize: 9, color: "#2e2e2e", flex: 1, textAlign: "center" }}>
                {l}
              </Text>
            ))}
          </View>
          <Text style={{ fontSize: 12, color: "#333333" }}>
            No data this week — start checking off habits
          </Text>
        </>
      ) : (
        <>
          {/* ── Bar chart ─────────────────────────────────── */}
          <View className="flex-row items-end gap-2 mb-2" style={{ height: 70 }}>
            {weeklyAnalytics.days.map((d, i) => {
              const color = dayColor(d.ratio, d.isToday);
              const heightPct = d.isSkipped ? 6 : Math.max(d.pct, 10);
              const isGrad = color === "today";

              return (
                <View
                  key={i}
                  className="flex-1 items-center justify-end relative"
                  style={{ height: "100%" }}
                >
                  <View
                    className="w-full absolute bottom-0 overflow-hidden"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isGrad ? "transparent" : color,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                      borderBottomLeftRadius: 2,
                      borderBottomRightRadius: 2,
                      opacity: d.isSkipped ? 0.4 : 1,
                    }}
                  >
                    {isGrad && (
                      <Svg width="100%" height="100%" style={{ position: "absolute" }}>
                        <Defs>
                          <LinearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#9d8ff5" />
                            <Stop offset="1" stopColor="#7c6af0" />
                          </LinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#todayGrad)" />
                      </Svg>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Day labels ───────────────────────────────── */}
          <View className="flex-row justify-between mb-4">
            {weeklyAnalytics.days.map((d, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 9,
                  color: d.isToday
                    ? "#7c6af0"
                    : d.isSkipped
                      ? "#2a2a2a"
                      : "#444",
                  fontWeight: d.isToday ? "700" : "400",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {d.day}
              </Text>
            ))}
          </View>

          {/* ── Stats ───────────────────────────────────── */}
          <View
            className="pt-3"
            style={{ borderTopWidth: 1, borderTopColor: "#1a1a1a", gap: 8 }}
          >
            <View className="flex-row items-center justify-between">
              <Text style={{ fontSize: 12, color: "#555" }}>
                Current Streak
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color:
                    weeklyAnalytics.currentStreak > 0 ? "#4caf7d" : "#e85555",
                  fontWeight: "600",
                }}
              >
                {weeklyAnalytics.currentStreak} days
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text style={{ fontSize: 12, color: "#555" }}>
                Longest Streak
              </Text>
              <Text
                style={{ fontSize: 12, color: "#7c6af0", fontWeight: "600" }}
              >
                {weeklyAnalytics.longestStreak} days
              </Text>
            </View>

            {weeklyAnalytics.currentStreak === 0 &&
              weeklyAnalytics.longestStreak > 0 && (
                <Text
                  style={{ fontSize: 10, color: "#333333", marginTop: 6 }}
                >
                  Streak reset — best was {weeklyAnalytics.longestStreak} days.
                  Start fresh today!
                </Text>
              )}
          </View>
        </>
      )}
    </Card>
  );
};

export default WeeklyProgress;
