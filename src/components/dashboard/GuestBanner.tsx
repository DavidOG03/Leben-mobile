import { Text } from "@/components/ui/Text";
import { useLebenStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export function GuestBanner() {
  const userId = useLebenStore((s) => s.userId);
  const router = useRouter();

  if (userId) return null;

  return (
    <View className="px-4 mt-2">
      <View className="bg-[#fff8e6] dark:bg-[#2e2617] border border-[#ffdb80] dark:border-[#524429] rounded-xl p-4 flex-row items-start">
        <View className="mr-3 mt-1">
          <Text className="text-xl">⚠️</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[#8c6b14] dark:text-[#f2cc68] font-geist-semibold text-[13px] mb-1">
            You're currently using guest mode
          </Text>
          <Text className="text-[#8c6b14] dark:text-[#f2cc68] opacity-80 font-geist-medium text-[12px] leading-relaxed mb-3">
            Your progress is only saved locally. Create a free account to back up your workspace and unlock cloud sync across all your devices!
          </Text>
          <TouchableOpacity 
            onPress={() => router.push("/(auth)/sign-in" as any)}
            className="bg-[#d9a836] dark:bg-[#b0841f] self-start px-4 py-2 rounded-lg active:opacity-80"
          >
            <Text className="text-white font-geist-semibold text-xs">
              Secure My Data
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
