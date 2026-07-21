import { Text } from "@/components/ui/Text";
import { AIIcon, PlusIcon } from "@/constants/Icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export function EmptyPlannerState({ taskCount }: { taskCount: number }) {
  const router = useRouter();
  const remaining = 2 - taskCount;

  return (
    <View className="flex-col items-center justify-center py-20 px-6 rounded-3xl bg-leben-bg border border-leben-border border-dashed">
      <View className="mb-8 p-6 rounded-full items-center justify-center bg-leben-accent-dim">
        <View
          className="items-center justify-center rounded-2xl bg-leben-bg-element border border-leben-border-subtle"
          style={{
            width: 64,
            height: 64,
            transform: [{ rotate: "12deg" }],
          }}
        >
          <AIIcon color="#3b82f6" size={32} />
        </View>
      </View>

      <Text
        className="text-leben-text-2 font-bold mb-3 text-center"
        style={{ fontSize: 20, letterSpacing: -0.5 }}
      >
        System Idle
      </Text>
      <Text
        className="text-leben-text-dim mb-10 text-center"
        style={{ fontSize: 14, lineHeight: 22, maxWidth: 300 }}
      >
        The AI Planner requires more contextual input to generate an optimized
        daily plan. Add{" "}
        <Text className="text-leben-accent font-bold">
          {remaining} more {remaining === 1 ? "task" : "tasks"}
        </Text>{" "}
        to activate high-performance scheduling.
      </Text>

      <View className="flex-col gap-4 w-full" style={{ maxWidth: 240 }}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/tasks" as any)}
          className="flex-row items-center justify-center gap-2 px-6 py-3 rounded-xl bg-leben-accent"
        >
          <PlusIcon color="#fff" size={16} />
          <Text className="text-white text-[14px] font-bold">
            Add Tasks
          </Text>
        </TouchableOpacity>

        <Text
          className="text-center text-leben-text-dim text-[11px] font-semibold tracking-[1px] uppercase"
        >
          Current tasks: {taskCount} / 3
        </Text>
      </View>
    </View>
  );
}
