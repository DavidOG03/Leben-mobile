import { Card } from "@/components/ui/Card";
import { calcLongestStreak, calcStreak } from "@/utils/habits";
import { WeeklyProgressProps } from "@/utils/habits.types";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const daysLabels = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Maps a completion ratio (0–1) to an intensity colour.
 * 0 = skipped (no colour), >0 = increasingly bright purple.
 */
function dayColor(ratio: number, isToday: boolean): string {
  if (ratio <= 0) return "var(--bg-card)"; // skipped — no colour
  if (isToday) return "today"; // flag for svg gradient
  if (ratio <= 0.33) return "rgba(107, 127, 255, 0.35)"; // leben-accent-90
  if (ratio <= 0.66) return "var(--accent-blue-light)"; // leben-accent-light
  return "var(--accent-blue)"; // leben-accent
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ habits }) => {
  const weeklyAnalytics = useMemo(() => {
    const today = new Date();
    const data = [];
    let totalCompletedThisWeek = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime());
      date.setDate(today.getDate() - i);
      const dateStr = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];
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
      className="rounded-2xl p-5 bg-leben-bg-card border border-leben-border-subtle mb-5"
    >
      <Text
        className="font-geist-semibold text-leben-text mb-1"
        style={{ fontSize: 14 }}
      >
        Weekly Progress
      </Text>
      <Text
        className="text-leben-text-2"
        style={{ fontSize: 10, marginBottom: 14 }}
      >
        Coloured days = habits tracked · Grey = skipped
      </Text>

      {!weeklyAnalytics.hasData ? (
        <>
          {/* Ghost bars */}
          <View
            className="flex-row items-end gap-2 mb-2"
            style={{ height: 70 }}
          >
            {[0.3, 0.45, 0.4, 0.55, 0.35, 0.25, 0.2].map((h, i) => (
              <View
                key={i}
                className="flex-1 bg-leben-border"
                style={{
                  height: `${h * 100}%`,
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
              <Text
                key={i}
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {l}
              </Text>
            ))}
          </View>
          <Text style={{ fontSize: 12, color: "var(--text-dim)" }}>
            No data this week — start checking off habits
          </Text>
        </>
      ) : (
        <>
          {/* ── Bar chart ─────────────────────────────────── */}
          <View
            className="flex-row items-end gap-2 mb-2"
            style={{ height: 70 }}
          >
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
                      <Svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 1 1"
                        preserveAspectRatio="none"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      >
                        <Defs>
                          <LinearGradient
                            id={`todayGrad-${i}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <Stop offset="0" stopColor="#5a6bff" />
                            <Stop offset="1" stopColor="#6b7fff" />
                          </LinearGradient>
                        </Defs>
                        <Rect
                          width="1"
                          height="1"
                          fill={`url(#todayGrad-${i})`}
                        />
                      </Svg>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Day labels ───────────────────────────────── */}
          <View className={`flex-row justify-between mb-4 `}>
            {weeklyAnalytics.days.map((d, i) => (
              <Text
                className={`font-geist-light ${d.isToday ? "text-leben-accent font-geist-bold" : d.isSkipped ? "text-leben-text-muted" : "text-leben-text"}`}
                key={i}
                style={{
                  fontSize: 9,
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
          <View className="pt-3 border-t border-t-leben-border-subtle gap-3">
            {/* <View className="flex-row items-center justify-between">
              <Text style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Current Streak
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color:
                    weeklyAnalytics.currentStreak > 0
                      ? "var(--success-green)"
                      : "#f87171",
                  fontWeight: "600",
                }}
              >
                {weeklyAnalytics.currentStreak} days
              </Text>
            </View> */}

            <View className="flex-row items-center justify-between">
              <Text className="text-leben-text" style={{ fontSize: 12 }}>
                Longest Streak
              </Text>
              <Text className="font-geist-semibold text-leben-accent text-sm">
                {weeklyAnalytics.longestStreak} days
              </Text>
            </View>

            {/* {weeklyAnalytics.currentStreak === 0 &&
              weeklyAnalytics.longestStreak > 0 && (
                <Text
                  style={{
                    fontSize: 10,
                    color: "var(--text-dim)",
                    marginTop: 6,
                  }}
                >
                  Streak reset — best was {weeklyAnalytics.longestStreak} days.
                  Start fresh today!
                </Text>
              )} */}
          </View>
        </>
      )}
    </Card>
  );
};

export default WeeklyProgress;
