import { Card } from "@/components/ui/Card";
import { useLebenStore } from "@/store/useStore";
import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function WeeklyProductivity() {
  const tasks = useLebenStore((s) => s.tasks);
  const historyStore = useLebenStore((s) => s.productivityHistory);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const history = historyStore || {};
    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - idx));
      const dateStr = date.toISOString().split("T")[0];

      // Only count tasks that were actually completed on this date
      const completedOnThisDay = tasks.filter(
        (t) => t.completed && t.completedAt === dateStr,
      );
      const currentCompleted = completedOnThisDay.length;
      const currentTotal = completedOnThisDay.length;

      // History data
      const hist = history[dateStr] || { completed: 0, total: 0 };

      // Use the maximum of current or history
      const completed = Math.max(currentCompleted, hist.completed);
      const total = Math.max(currentTotal, hist.total, completed);

      return {
        day: DAY_LABELS[date.getDay()],
        completed,
        total,
        date: dateStr,
        isToday: idx === 6,
        isFuture: date > today,
      };
    });
  }, [tasks, historyStore]);

  const maxCompleted = Math.max(...weeklyData.map((d) => d.completed), 1);
  const totalWeek = weeklyData.reduce((s, d) => s + d.completed, 0);
  const bestDay = weeklyData.reduce(
    (best, d) => (d.completed > best.completed ? d : best),
    weeklyData[0],
  );

  return (
    <Card
      variant="none"
      className="rounded-xl p-5 mt-6 bg-leben-bg-card border border-leben-border-subtle"
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between mb-1">
        <Text
          className="text-leben-text font-geist-semibold"
          style={{ fontSize: 13 }}
        >
          Weekly Productivity
        </Text>
        <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <Path
            d="M1 10L4.5 6l3 3L12 3"
            stroke="#7c6af0"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <Text style={{ fontSize: 10, color: "#333333", marginBottom: 16 }}>
        Tasks completed per day — last 7 days
      </Text>

      {/* ── Bar chart ───────────────────────────────────────── */}
      <View
        className="flex-row items-end justify-between gap-1.5"
        style={{ height: 100 }}
      >
        {weeklyData.map((d) => {
          const isSkipped = d.completed === 0;
          const ratio = maxCompleted > 0 ? d.completed / maxCompleted : 0;

          // Height logic: small stub for empty days, otherwise proportional
          const heightPct = isSkipped
            ? 6
            : Math.max((d.completed / maxCompleted) * 100, 12);

          // Colour intensity logic matched with WeeklyProgress
          let barColor: string;
          if (isSkipped) {
            barColor = "#1a1a1a";
          } else if (d.isToday) {
            barColor = "today";
          } else if (ratio <= 0.33) {
            barColor = "#1e2a4a";
          } else if (ratio <= 0.66) {
            barColor = "#3a3580";
          } else {
            barColor = "#5a4fd4";
          }

          const isGrad = barColor === "today";

          return (
            <View
              key={d.date}
              className="flex-col items-center flex-1 justify-end relative"
              style={{ height: "100%" }}
            >
              {/* Bar */}
              <View
                className="w-full absolute bottom-0 overflow-hidden"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isGrad ? "transparent" : barColor,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
                  opacity: isSkipped ? 0.4 : 1,
                }}
              >
                {isGrad && (
                  <Svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                  >
                    <Defs>
                      <LinearGradient
                        id={`todayGrad-prod-${d.date}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <Stop offset="0" stopColor="#9d8ff5" />
                        <Stop offset="1" stopColor="#7c6af0" />
                      </LinearGradient>
                    </Defs>
                    <Rect width="1" height="1" fill={`url(#todayGrad-prod-${d.date})`} />
                  </Svg>
                )}
              </View>

              {/* Subtle count indicator (always visible) */}
              {!isSkipped && (
                <Text
                  className="absolute"
                  style={{
                    bottom: `${heightPct}%`,
                    marginBottom: 4,
                    fontSize: 9,
                    color: d.isToday ? "#9d8ff5" : "#555555",
                    fontWeight: d.isToday ? "700" : "600",
                  }}
                >
                  {d.completed}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ── Day labels ──────────────────────────────────────── */}
      <View className="flex-row justify-between mt-2.5 gap-1.5">
        {weeklyData.map((d) => (
          <View key={d.day + d.date} className="flex-1 items-center">
            <Text
              style={{
                fontSize: 9,
                color: d.isToday ? "#7c6af0" : "#444",
                letterSpacing: 0.6,
                fontWeight: d.isToday ? "700" : "400",
              }}
            >
              {d.day}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Summary stats ───────────────────────────────────── */}
      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-t-leben-border-subtle">
        <View className="items-center">
          <Text style={{ fontSize: 16, color: "#f0f0f0", fontWeight: "700" }}>
            {totalWeek}
          </Text>
          <Text style={{ fontSize: 9, color: "#444", letterSpacing: 0.5 }}>
            TOTAL
          </Text>
        </View>
        <View className="items-center">
          <Text style={{ fontSize: 16, color: "#f0f0f0", fontWeight: "700" }}>
            {bestDay.completed}
          </Text>
          <Text style={{ fontSize: 9, color: "#444", letterSpacing: 0.5 }}>
            BEST DAY
          </Text>
        </View>
        <View className="items-center">
          <Text
            style={{
              fontSize: 11,
              marginTop: 4,
              marginBottom: 1,
              color:
                weeklyData.filter((d) => d.completed > 0).length >= 5
                  ? "#4caf7d"
                  : "#e8a855",
              fontWeight: "700",
            }}
          >
            {weeklyData.filter((d) => d.completed > 0).length}/7
          </Text>
          <Text style={{ fontSize: 9, color: "#444", letterSpacing: 0.5 }}>
            ACTIVE DAYS
          </Text>
        </View>
      </View>
    </Card>
  );
}
