import AIChatBox from "@/components/ai/AIChatBox";
import { ScreenLayout } from "@/components/shared/ScreenLayout";
import { Text } from "@/components/ui/Text";
import { SparkleIcon } from "@/constants/Icons";
import { useLebenStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export default function AIScreen() {
  const userId = useLebenStore((s) => s.userId);
  const router = useRouter();

  if (!userId) {
    return (
      <ScreenLayout scrollable>
        <View className="flex-1 items-center justify-center pt-16 pb-20 px-6">
          <View
            className="items-center justify-center rounded-2xl mb-6"
            style={{
              width: 72,
              height: 72,
              backgroundColor: "rgba(124,106,240,0.08)",
              borderColor: "rgba(124,106,240,0.2)",
              borderWidth: 1,
            }}
          >
            <SparkleIcon size={32} color="#7c6af0" />
          </View>

          <View className="items-center mb-8">
            <Text
              className="text-leben-text font-black text-center"
              style={{ fontSize: 28, letterSpacing: -0.5, marginBottom: 8 }}
            >
              Neural <Text className="text-leben-accent">AI Assistant</Text>
            </Text>
            <Text className="text-center text-leben-text-muted text-[15px] leading-[22px] max-w-[340px]">
              Sign in to unlock interactive AI chat, personalized schedule optimization, and real-time task breakdowns powered by Neural.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in" as any)}
            className="flex-row items-center gap-3 px-8 py-4 rounded-xl mb-8 bg-leben-accent shadow-lg"
          >
            <Text className="text-white font-bold text-[15px]">
              Sign In to Access AI
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>

          <View className="flex-col w-full gap-3 max-w-[360px]">
            <View className="p-4 rounded-xl bg-leben-bg-card border border-leben-border flex-row items-center gap-3">
              <SparkleIcon size={18} color="#7c6af0" />
              <View className="flex-1">
                <Text className="text-[13px] font-semibold text-leben-text">Context-Aware Planning</Text>
                <Text className="text-[11px] text-leben-text-dim mt-0.5">AI analyzes your energy and habits</Text>
              </View>
            </View>
            <View className="p-4 rounded-xl bg-leben-bg-card border border-leben-border flex-row items-center gap-3">
              <SparkleIcon size={18} color="#7c6af0" />
              <View className="flex-1">
                <Text className="text-[13px] font-semibold text-leben-text">Sub-Task Decomposition</Text>
                <Text className="text-[11px] text-leben-text-dim mt-0.5">Automatically break complex goals down</Text>
              </View>
            </View>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable={false}>
      <AIChatBox />
    </ScreenLayout>
  );
}
