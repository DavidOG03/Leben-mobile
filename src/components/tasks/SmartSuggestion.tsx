import { Text } from "@/components/ui/Text";
import { getTaskPriority, TaskPrioritySuggestion } from "@/lib/ai/client";
import { useLebenStore } from "@/store/useStore";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export function SmartSuggestion() {
  const tasks = useLebenStore((s) => s.tasks);
  const userId = useLebenStore((s) => s.userId);

  const [suggestion, setSuggestion] = useState<TaskPrioritySuggestion | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const hasTasks = pendingTasks.length > 1;

  // Animate dots while loading
  useEffect(() => {
    if (loading) {
      dotsRef.current = setInterval(() => {
        setDots((d) => (d.length >= 3 ? "." : d + "."));
      }, 400);
    } else {
      if (dotsRef.current) clearInterval(dotsRef.current);
      setDots(".");
    }
    return () => {
      if (dotsRef.current) clearInterval(dotsRef.current);
    };
  }, [loading]);

  const fetchSuggestion = async () => {
    if (!userId) {
      router.push("/(auth)/sign-in" as any);
      return;
    }
    if (!hasTasks || loading) return;

    setLoading(true);
    setSuggestion(null);

    try {
      const taskList = pendingTasks
        .map(
          (t, i) =>
            `${i + 1}. [Tag: ${t.tag ?? "general"}] [Priority: ${t.priority ?? "medium"}] ${t.title}`,
        )
        .join("\n");

      const result = await getTaskPriority(
        taskList,
        new Date().toLocaleTimeString(),
        pendingTasks.length,
      );
      setSuggestion(result);
    } catch (err) {
      console.error("SmartSuggestion error:", err);
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = hasTasks && !loading;

  return (
    <View className="rounded-2xl p-4 mt-4 min-h-[200px] justify-between border overflow-hidden relative bg-leben-accent-75 border-leben-accent-light">
      {/* Glow accent */}
      <View
        className="absolute -top-[30px] -right-[30px] w-[120px] h-[120px] rounded-full bg-leben-accent-90"
        pointerEvents="none"
      />

      <View>
        {/* Sparkle icon badge */}
        <View className="w-[30px] h-[30px] rounded-lg bg-leben-accent-90 items-center justify-center mb-3">
          <Text className="text-sm text-white">✦</Text>
        </View>

        {/* Label */}
        <Text
          className={`text-[10px] text-leben-accent tracking-widest uppercase font-geist-semibold mb-2.5 ${
            loading ? "no-underline" : "no-underline"
          }`}
        >
          {loading ? `Prioritizing${dots}` : "Priority Insight"}
        </Text>

        {/* Loading skeleton */}
        {loading && (
          <View className="gap-2">
            {[1, 0.7, 0.5].map((opacity, i) => (
              <View
                key={i}
                className="h-2.5 rounded bg-white"
                style={{
                  opacity: opacity * 0.07,
                  width: `${100 - i * 20}%`,
                }}
              />
            ))}
          </View>
        )}

        {/* Suggestion result */}
        {!loading && suggestion && (
          <View className="gap-2.5">
            <Text className="text-sm font-geist-bold text-white leading-5">
              {suggestion.task}
            </Text>
            <View className="p-2.5  bg-black/20 border-l-2 border-leben-accent">
              <Text className="text-[11px] text-leben-accent4">
                <Text className="text-indigo-300 italic">Reason: </Text>
                {suggestion.reason}
              </Text>
            </View>
          </View>
        )}

        {/* Idle copy */}
        {!loading && !suggestion && (
          <Text className="text-xs text-leben-accent leading-relaxed">
            {hasTasks
              ? "Analysis required to find your high-impact task."
              : "No pending tasks found. Add some to get a strategy."}
          </Text>
        )}
      </View>

      {/* CTA */}
      <View className="mt-4">
        {suggestion && !loading ? (
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[11px] text-leben-text font-geist-bold">
                {suggestion.action}
              </Text>
            </View>
            <TouchableOpacity onPress={fetchSuggestion} activeOpacity={0.7}>
              <Text className="text-[11px] text-leben-accent">Re-analyze</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={fetchSuggestion}
            disabled={!canAnalyze}
            activeOpacity={0.8}
            className={`flex-row items-center justify-center gap-1.5 rounded-xl py-3 ${
              canAnalyze
                ? "bg-leben-accent"
                : "bg-white/5"
            }`}
            style={canAnalyze ? { 
              elevation: 4, 
              shadowColor: '#7c6af0', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.35, 
              shadowRadius: 6 
            } : {}}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                className={`text-[11px] font-geist-bold tracking-[0.3px] ${
                  canAnalyze ? "text-white" : "text-leben-accent"
                }`}
              >
                Identify Priority
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
