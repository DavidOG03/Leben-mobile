import { Card } from "@/components/ui/Card";
import { calcLongestStreak, calcStreak } from "@/utils/habits";
import { WeeklyProgressProps } from "@/utils/habits.types";
import React, { useMemo, useState } from "react";
import { Text, View, Pressable } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const daysLabels = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Maps a completion ratio (0–1) to a Tailwind class.
 * 0 = skipped, >0 = increasingly bright purple.
 */
function dayColorClass(ratio: number, isToday: boolean): string {
  if (ratio <= 0) return "bg-leben-border-subtle"; // skipped
  if (isToday) return "today"; // flag for svg gradient
  if (ratio <= 0.33) return "bg-leben-accent-90"; 
  if (ratio <= 0.66) return "bg-leben-accent-light"; 
  return "bg-leben-accent"; 
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ habits }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

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

  const selectedData = selectedDayIndex !== null ? weeklyAnalytics.days[selectedDayIndex] : null;

  return (
    <Card
      variant="none"
      className="rounded-2xl p-5 bg-leben-bg-card border border-leben-border-subtle mb-5"
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text
          className="font-geist-semibold text-leben-text"
          style={{ fontSize: 14 }}
        >
          Weekly Progress
        </Text>
      </View>
      <Text
        className="text-leben-text-2"
        style={{ fontSize: 10, marginBottom: 14 }}
      >
        {selectedData 
          ? `${selectedData.count} habit${selectedData.count === 1 ? '' : 's'} tracked on ${selectedData.date}`
          : "Coloured days = habits tracked · Grey = skipped"}
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
                className="text-leben-text-muted"
                style={{
                  fontSize: 9,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {l}
              </Text>
            ))}
          </View>
          <Text className="text-leben-text" style={{ fontSize: 12 }}>
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
              const colorClass = dayColorClass(d.ratio, d.isToday);
              const heightPct = d.isSkipped ? 6 : Math.max(d.pct, 10);
              const isGrad = colorClass === "today";
              const isSelected = selectedDayIndex === i;

              return (
                <Pressable
                  key={i}
                  className={`flex-1 items-center justify-end relative rounded-t-[3px] rounded-b-[2px] ${isSelected ? 'bg-leben-border-subtle/30' : ''}`}
                  style={{ height: "100%" }}
                  onPress={() => setSelectedDayIndex(isSelected ? null : i)}
                >
                  <View
                    className={`w-full absolute bottom-0 overflow-hidden ${isGrad ? "bg-transparent" : colorClass}`}
                    style={{
                      height: `${heightPct}%`,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                      borderBottomLeftRadius: 2,
                      borderBottomRightRadius: 2,
                      opacity: d.isSkipped ? 0.4 : (isSelected ? 0.8 : 1),
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
                </Pressable>
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
            <View className="flex-row items-center justify-between">
              <Text className="text-leben-text" style={{ fontSize: 12 }}>
                Longest Streak
              </Text>
              <Text className="font-geist-semibold text-leben-accent text-sm">
                {weeklyAnalytics.longestStreak} days
              </Text>
            </View>
          </View>
        </>
      )}
    </Card>
  );
};

export default WeeklyProgress;

