import { Text } from "@/components/ui/Text";
import { ScheduleItem, useLebenStore } from "@/store/useStore";
import { View } from "react-native";

export function EnergyDistribution() {
  const schedule = useLebenStore((s) => s.schedule);

  const morningTasks = schedule.filter((item) => {
    const hour = parseInt(item.start.split(":")[0]);
    return hour >= 6 && hour < 12;
  });

  const peakTasks = schedule.filter((item) => {
    const hour = parseInt(item.start.split(":")[0]);
    return hour >= 12 && hour < 18;
  });

  const eveningTasks = schedule.filter((item) => {
    const hour = parseInt(item.start.split(":")[0]);
    return hour >= 18 || hour < 6;
  });

  const calculateH = (tasks: ScheduleItem[]) => {
    if (tasks.length === 0) return 20;
    const score = tasks.reduce(
      (acc, t) =>
        acc + (t.priority === "high" ? 30 : t.priority === "medium" ? 20 : 10),
      0,
    );
    return Math.min(100, 20 + score);
  };

  const getTopTasks = (tasks: ScheduleItem[]) => {
    return tasks
      .sort((a, b) => {
        const pMap = { high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      })
      .slice(0, 3);
  };

  const levels = [
    {
      label: "MOR",
      value: calculateH(morningTasks),
      peak: false,
      topTasks: getTopTasks(morningTasks),
    },
    {
      label: "PEAK",
      value: calculateH(peakTasks),
      peak: true,
      topTasks: getTopTasks(peakTasks),
    },
    {
      label: "EVE",
      value: calculateH(eveningTasks),
      peak: false,
      topTasks: getTopTasks(eveningTasks),
    },
  ];

  return (
    <View className="rounded-2xl p-6 flex-col gap-6 bg-leben-bg-card border border-leben-border">
      <View className="flex-row items-center justify-between">
        <Text
          className="text-leben-text-2 font-semibold pb-4"
          style={{ fontSize: 14 }}
        >
          Energy Distribution
        </Text>
        <Text className="text-leben-accent text-[10px] font-semibold">
          Peak: 10:00 AM
        </Text>
      </View>

      <View className="flex-row items-end justify-between px-4 h-32 gap-6">
        {levels.map((lvl) => (
          <View
            key={lvl.label}
            className="flex-col items-center gap-3 flex-1 h-full justify-end"
          >
            <View
              className={`w-full rounded-lg ${lvl.peak ? "bg-leben-accent" : "bg-leben-border-subtle border border-leben-border-subtle"}`}
              style={{ height: `${lvl.value}%` }}
            />
            <Text
              className={`text-[9px] font-bold tracking-[1px] ${lvl.peak ? "text-leben-accent" : "text-leben-text-muted"}`}
            >
              {lvl.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Tasks underneath the chart */}
      <View className="flex-row justify-between px-2 mt-4 gap-4">
        {levels.map((lvl) => (
          <View key={`${lvl.label}-tasks`} className="flex-1 flex-col gap-2">
            {lvl.topTasks.map((t, idx) => (
              <View key={idx} className="flex-row gap-1.5 items-start">
                <View
                  className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${lvl.peak ? "bg-leben-accent" : "bg-leben-text-dim"}`}
                />
                <Text
                  className="text-leben-text-muted leading-tight"
                  style={{ fontSize: 10 }}
                  numberOfLines={2}
                >
                  {t.title}
                </Text>
              </View>
            ))}
            {lvl.topTasks.length === 0 && (
              <Text
                className="text-leben-text-dim italic text-center"
                style={{ fontSize: 10 }}
              >
                Free time
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
