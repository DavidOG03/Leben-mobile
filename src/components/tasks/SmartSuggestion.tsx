import { getTaskPriority, TaskPrioritySuggestion } from "@/lib/ai/client";
import { useLebenStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';


export function SmartSuggestion() {
  const router = useRouter();
  const tasks = useLebenStore((s) => s.tasks);
  const userId = useLebenStore((s) => s.userId);

  const [suggestion, setSuggestion] = useState<TaskPrioritySuggestion | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const hasTasks = pendingTasks.length > 0;

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
    <View
      style={{
        borderRadius: 14,
        padding: 16,
        marginTop: 16,
        minHeight: 200,
        justifyContent: "space-between",
        backgroundColor: "#1a1745",
        borderWidth: 1,
        borderColor: "rgba(124,106,240,0.3)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Glow accent */}
      <View
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "rgba(124,106,240,0.12)",
        }}
        pointerEvents="none"
      />

      <View>
        {/* Sparkle icon badge */}
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: "rgba(124,106,240,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: "#f0fa00ff" }}>✦</Text>
        </View>

        {/* Label */}
        <Text
          style={{
            fontSize: 10,
            color: "rgba(200,190,255,0.8)",
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: "600",
            marginBottom: 10,
            textDecorationLine: loading ? "none" : "none",
          }}
        >
          {loading ? `Prioritizing${dots}` : "Priority Insight"}
        </Text>

        {/* Loading skeleton */}
        {loading && (
          <View style={{ gap: 8 }}>
            {[1, 0.7, 0.5].map((opacity, i) => (
              <View
                key={i}
                style={{
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: `rgba(255,255,255,${opacity * 0.07})`,
                  width: `${100 - i * 20}%`,
                }}
              />
            ))}
          </View>
        )}

        {/* Suggestion result */}
        {!loading && suggestion && (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#fff",
                lineHeight: 20,
              }}
            >
              {suggestion.task}
            </Text>
            <View
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: "rgba(0,0,0,0.2)",
                borderLeftWidth: 2,
                borderLeftColor: "#7c6af0",
              }}
            >
              <Text style={{ fontSize: 11, color: "#c4b8ff", lineHeight: 16 }}>
                <Text style={{ opacity: 0.5, fontStyle: "italic" }}>
                  Reason:{" "}
                </Text>
                {suggestion.reason}
              </Text>
            </View>
          </View>
        )}

        {/* Idle copy */}
        {!loading && !suggestion && (
          <Text
            style={{
              fontSize: 12,
              color: "rgba(200,190,255,0.4)",
              lineHeight: 18,
            }}
          >
            {hasTasks
              ? "Analysis required to find your high-impact task."
              : "No pending tasks found. Add some to get a strategy."}
          </Text>
        )}
      </View>

      {/* CTA */}
      <View style={{ marginTop: 16 }}>
        {suggestion && !loading ? (
          <TouchableOpacity
            onPress={fetchSuggestion}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 11, color: "#a89cf0", fontWeight: "700" }}>
              {suggestion.action}
            </Text>
            <Text style={{ fontSize: 9, color: "rgba(168,156,240,0.4)" }}>
              Re-analyze
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={fetchSuggestion}
            disabled={!canAnalyze}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              borderRadius: 10,
              paddingVertical: 11,
              backgroundColor: canAnalyze
                ? "#7c6af0"
                : "rgba(255,255,255,0.04)",
              shadowColor: canAnalyze ? "#7c6af0" : "transparent",
              shadowOpacity: canAnalyze ? 0.35 : 0,
              shadowRadius: 10,
              elevation: canAnalyze ? 4 : 0,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                  color: canAnalyze ? "#fff" : "rgba(200,190,255,0.25)",
                }}
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
