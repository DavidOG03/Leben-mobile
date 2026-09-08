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
              className="text-leben-text font-geist-ultrablack text-center"
              style={{ fontSize: 28, letterSpacing: -0.5, marginBottom: 8 }}
            >
              Neural <Text className="text-leben-accent">AI Assistant</Text>
            </Text>
            <Text className="text-center text-leben-text-muted text-[15px] leading-[22px] max-w-[340px]">
              Unlock your personal AI assistant. Sign in to chat, auto-schedule tasks, and optimize your routines.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in" as any)}
            className="flex-row items-center gap-3 px-8 py-4 rounded-xl mb-8 bg-leben-accent shadow-lg"
          >
            <Text className="text-white font-geist-bold text-[15px]">
              Sign In to Access AI
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
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
