import { SyncCompleteIcon, SyncingIcon } from "@/constants/Icons";
import { Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

interface ToastProps {
  message: string;
  type: "info" | "syncing" | "success" | "error";
}

export function Toast({ message, type }: ToastProps) {
  const isSyncing = type === "syncing";
  const isSuccess = type === "success";
  const isError = type === "error";

  // Choose colors based on type
  const bgClass = isError ? "bg-red-500" : "bg-zinc-800";
  const textClass = "text-white";

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      className={`px-4 py-3 rounded-full flex-row items-center shadow-lg mb-2`}
      style={{ minWidth: 200, justifyContent: "center" }}
    >
      {isSyncing && (
        <View className="mr-2">
          <SyncingIcon color="#fff" />
        </View>
      )}
      {isSuccess && (
        <View className="mr-2">
          <SyncCompleteIcon color="#22c55e" />
        </View>
      )}
      <Text className=" font-medium">{message}</Text>
    </Animated.View>
  );
}
