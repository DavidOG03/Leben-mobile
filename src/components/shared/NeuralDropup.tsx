// components/shared/NeuralDropup.tsx
// Press "Neural ✦" tab → BottomSheet opens showing Planner, AI Chat, Analytics
import { BottomSheet } from "@/components/ui/BottomSheet";
import { AIIcon, AnalyticsIcon, SparkleIcon } from "@/constants/Icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface SubLink {
  label: string;
  icon: React.ElementType;
  href: "/(tabs)/planner" | "/(tabs)/ai" | "/(tabs)/analytics";
  desc: string;
}

const SUB_LINKS: SubLink[] = [
  {
    label: "Daily Planner",
    icon: SparkleIcon,
    href: "/(tabs)/planner",
    desc: "AI-generated schedule",
  },
  {
    label: "Neural Chat",
    icon: AIIcon,
    href: "/(tabs)/ai",
    desc: "Ask your AI assistant",
  },
  {
    label: "Analytics",
    icon: AnalyticsIcon,
    href: "/(tabs)/analytics",
    desc: "Productivity insights",
  },
];

interface NeuralDropupProps {
  visible: boolean;
  onClose: () => void;
  tabBarHeight?: number;
}

export function NeuralDropup({ visible, onClose }: NeuralDropupProps) {
  const router = useRouter();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      containerStyle={{ backgroundColor: '#161616' }}
    >
      <View className="mb-6 flex-row items-center justify-between">
        <Text
          className="font-black text-white text-[24px]"
          style={{ letterSpacing: -0.4 }}
        >
          Neural <SparkleIcon size={18} color="#888888" />
        </Text>
      </View>

      <View className="gap-3 mb-4">
        {SUB_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Pressable
              key={link.href}
              onPress={() => {
                onClose();
                router.push(link.href as any);
              }}
              className="flex-row items-center gap-4 px-4 py-5 rounded-2xl active:bg-[#161616]"
              style={{
                backgroundColor: "#111",
                borderWidth: 1,
                borderColor: "#1a1a1a",
              }}
            >
              {/* Icon bubble */}
              <View className="w-12 h-12 rounded-xl bg-leben-accent-dim border border-[rgba(124,106,240,0.2)] items-center justify-center">
                <Icon size={22} color="#7c6af0" />
              </View>
              {/* Text */}
              <View className="flex-1">
                <Text className="text-leben-text font-bold text-[16px] mb-1">
                  {link.label}
                </Text>
                <Text className="text-[#888] text-[13px]">{link.desc}</Text>
              </View>
              <Text className="text-[#444] text-xl">›</Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
