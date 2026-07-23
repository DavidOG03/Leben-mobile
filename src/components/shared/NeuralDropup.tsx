// components/shared/NeuralDropup.tsx
// Press "Neural ✦" tab → BottomSheet opens showing Planner, AI Chat, Analytics
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import {
  AIIcon,
  AnalyticsIcon,
  CalIcon,
  SettingsIcon,
} from "@/constants/Icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Pressable, View } from "react-native";

interface SubLink {
  label: string;
  icon: React.ElementType;
  href:
    | "/(tabs)/planner"
    | "/(tabs)/ai"
    | "/(tabs)/analytics"
    | "/(tabs)/settings";
  desc: string;
}

const SUB_LINKS: SubLink[] = [
  {
    label: "Daily Planner",
    icon: CalIcon,
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
  {
    label: "Settings",
    icon: SettingsIcon,
    href: "/(tabs)/settings",
    desc: "App preferences",
  },
];

interface NeuralDropupProps {
  visible: boolean;
  onClose: () => void;
  tabBarHeight?: number;
}

export function NeuralDropup({ visible, onClose }: NeuralDropupProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const bgColor = colorScheme === "dark" ? "#141419" : "#ffffff";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      containerStyle={{ backgroundColor: bgColor }}
    >
      <View className="gap-3 my-4 px-4">
        {SUB_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Pressable
              key={link.href}
              onPress={() => {
                onClose();
                router.push(link.href as any);
              }}
              className="flex-row items-center gap-4 px-4 py-5 rounded-2xl active:bg-leben-bg-card bg-leben-bg-card border border-leben-border-subtle"
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
                <Text className="text-leben-text-muted text-[13px]">
                  {link.desc}
                </Text>
              </View>
              <Text className="text-leben-text-dim text-xl">›</Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
