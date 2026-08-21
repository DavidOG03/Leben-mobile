import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { getAIBrief } from "@/lib/ai/client";
import { useLebenStore } from "@/store/useStore";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export function AIMorningBrief() {
  const {
    tasks,
    habits,
    goals,
    userId,
    morningBrief: brief,
    setMorningBrief: setBrief,
    clearMorningBrief,
    morningBriefGeneratedAt,
  } = useLebenStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavail] = useState(false);

  const hasData = tasks.length > 0 || habits.length > 0 || goals.length > 0;

  const handleGenerate = useCallback(
    async (forceRefresh = false) => {
      if (!userId) {
        router.push("/(auth)/sign-in" as any);
        return;
      }
      setLoading(true);
      setError(null);
      setUnavail(false);

      try {
        const result = await getAIBrief({ forceRefresh });
        setBrief(result);
      } catch (err: any) {
        console.error("Morning brief failed:", err);
        if (
          err?.message?.includes("busy") ||
          err?.message?.includes("demand")
        ) {
          setUnavail(true);
        } else {
          setError(err?.message ?? "Couldn't generate brief. Try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [userId, router, setBrief],
  );

  // Caching logic
  useEffect(() => {
    if (!hasData || !userId) {
      if (brief !== null || morningBriefGeneratedAt !== null) {
        clearMorningBrief();
      }
      return;
    }

    // Check if brief is stale (10 mins) or null
    const TEN_MINS = 10 * 60 * 1000;
    const isStale =
      !brief ||
      !morningBriefGeneratedAt ||
      Date.now() - morningBriefGeneratedAt > TEN_MINS;

    if (isStale) {
      const timeoutId = setTimeout(() => handleGenerate(), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [
    hasData,
    userId,
    morningBriefGeneratedAt,
    brief,
    handleGenerate,
    clearMorningBrief,
  ]);

  return (
    <Card
      variant="none"
      className="justify-between overflow-hidden p-0 bg-leben-accent-75"
      style={{
        minHeight: 260,
        borderWidth: 1,
        borderColor: "rgba(124, 106, 240, 0.5)",
      }}
    >
      {/* Background Gradient
      <View className="absolute inset-0">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#141420" />
              <Stop offset="1" stopColor="#0f0f18" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#cardGrad)" />
        </Svg>
      </View> */}
      <View className="relative z-10 flex-1 justify-between p-5">
        <View>
          {/* Header */}
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-leben-accent text-lg font-geist-medium">
              ✦
            </Text>
            <Text className="text-leben-accent text-[11px] uppercase tracking-widest font-geist-semibold">
              AI MORNING BRIEF
            </Text>
          </View>

          {/* Headline */}
          {loading ? (
            <View className="gap-2 opacity-50 pb-4">
              <View className="h-6 bg-leben-text-dim rounded-full w-full animate-pulse" />
              <View className="h-6 bg-leben-text-dim rounded-full w-3/4 animate-pulse" />
            </View>
          ) : (
            <Text className="text-leben-text text-2xl font-geist-black tracking-tight mb-4 leading-tight">
              {hasData ? (
                brief ? (
                  brief.summary
                ) : (
                  "Ready to plan your day?"
                )
              ) : (
                <Text className="font-geist-extrabold">
                  Welcome to{" "}
                  <Text className="text-leben-accent font-geist-extrabold">
                    Leben.
                  </Text>
                </Text>
              )}
            </Text>
          )}

          {/* Content */}
          {hasData ? (
            <View className="gap-3">
              {loading && (
                <View className="gap-2 opacity-50">
                  <View className="h-3 bg-leben-text-dim rounded-full w-3/4 animate-pulse" />
                  <View className="h-3 bg-leben-text-dim rounded-full w-1/2 animate-pulse" />
                </View>
              )}

              {error && !loading && !unavailable && (
                <Text className="text-leben-error text-[12px] font-geist-medium">
                  {error}
                </Text>
              )}

              {unavailable && !loading && (
                <View className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] p-3 rounded-xl">
                  <Text className="text-prio-medium text-[13px] leading-snug font-geist-medium">
                    ⏳ The AI is experiencing high demand right now. This is
                    temporary — try again in a moment.
                  </Text>
                </View>
              )}

              {brief && !loading && (
                <View className="flex-row flex-wrap gap-2">
                  {brief.insights.slice(0, 2).map((insight, i) => (
                    <Badge
                      key={i}
                      label={insight}
                      variant="primary"
                      numberOfLines={0}
                    />
                  ))}
                </View>
              )}

              {!brief && !loading && !error && (
                <Text className="text-leben-text-muted text-[13px] leading-relaxed font-geist-medium">
                  Your AI morning brief will appear here. Hit the button below
                  to generate it.
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-leben-text-muted text-[13px] leading-relaxed font-geist-medium">
              Your AI morning brief will appear here once you've added tasks,
              habits, and goals. Start by creating your first task.
            </Text>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-3 mt-6">
          {hasData ? (
            <>
              {!brief && (error || unavailable) && (
                <TouchableOpacity
                  onPress={() => handleGenerate(true)}
                  disabled={loading}
                  className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl bg-leben-accent active:opacity-80"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text className="text-white font-geist-semibold text-[14px]">
                        Retry Brief
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {brief && (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/planner" as any)}
                  activeOpacity={0.8}
                  className="rounded-xl overflow-hidden"
                >
                  <View className="absolute inset-0">
                    <Svg width="100%" height="100%">
                      <Defs>
                        <LinearGradient
                          id="btnGrad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <Stop offset="0" stopColor="706af1" stopOpacity="1" />
                          <Stop
                            offset="1"
                            stopColor="#7c6af0"
                            stopOpacity="1"
                          />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#btnGrad)" />
                    </Svg>
                  </View>
                  <View className="flex-row items-center justify-center gap-2 px-5 py-3">
                    <Text className="text-white font-geist-semibold text-[14px]">
                      Plan My Day
                    </Text>
                    <Text className="text-white font-geist-medium">›</Text>
                  </View>
                </TouchableOpacity>
              )}

              {brief && !loading && (
                <TouchableOpacity
                  onPress={() => handleGenerate(true)}
                  className="px-4 py-3 rounded-xl border border-leben-border-text active:opacity-70"
                >
                  <Text className="text-leben-text-muted font-geist-medium text-[13px]">
                    Regenerate
                  </Text>
                </TouchableOpacity>
              )}

              {!brief && !loading && !error && !unavailable && (
                <TouchableOpacity
                  onPress={() => handleGenerate()}
                  disabled={loading}
                  className="flex-row items-center justify-center gap-2 px-5 py-3 rounded-xl bg-leben-accent active:opacity-80"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text className="text-white font-geist-semibold text-[14px]">
                        Generate Brief
                      </Text>
                      <Text className="text-white font-geist-medium">✦</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/tasks" as any)}
                className="flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-leben-bg-element border border-leben-border active:opacity-80"
              >
                <Text className="text-leben-text font-geist-medium text-[13px]">
                  Create first task
                </Text>
                <Text className="text-leben-text font-geist-medium">›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/habits" as any)}
                className="px-4 py-2.5 rounded-lg border border-leben-border active:opacity-70"
              >
                <Text className="text-leben-text-dim font-geist-medium text-[13px]">
                  Set up habits
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Card>
  );
}
