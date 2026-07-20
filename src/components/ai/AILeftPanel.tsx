import { Text } from "@/components/ui/Text";
import { BoltIcon } from "@/constants/Icons";
import { useAIChatPanel } from "@/hooks/useAIChatPanel";
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

const navItems = [{ label: "Quick Prompt", icon: <BoltIcon />, active: true }];

const prompts = [
  { title: "Plan my day", sub: "Daily focus mapping" },
  { title: "Weekly review", sub: "Metric aggregation" },
  { title: "Summarize goals", sub: "Quarterly alignment" },
  { title: "Identify focus blocks", sub: "Calendar optimization" },
];

export default function AILeftPanel({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { sendMessage } = useAIChatPanel();

  const handlePrompt = (title: string) => {
    setIsOpen(false);
    sendMessage(title);
  };

  const panelContent = (
    <View className="flex-1">
      {/* AI identity */}
      <View className="flex-row items-center gap-3 px-5 mb-6">
        <View>
          <Text
            className="font-bold text-leben-text"
            style={{ fontSize: 14, letterSpacing: -0.1 }}
          >
            Leben AI
          </Text>
          <Text style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Productivity Engine
          </Text>
        </View>
      </View>

      {/* Nav */}
      <View className="px-3 mb-6">
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            className="flex-row items-center gap-2.5 px-3 py-2 rounded-lg"
            style={{
              backgroundColor: item.active
                ? "var(--border-primary)"
                : "transparent",
            }}
          >
            <View style={{ opacity: item.active ? 1 : 0.6 }}>{item.icon}</View>
            <Text
              style={{
                color: item.active
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
                fontSize: 13,
                fontWeight: item.active ? "500" : "400",
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Prompts */}
      <View className="px-5 flex-1">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-1.5 h-1.5 rounded-full bg-leben-accent" />
          <Text
            className="uppercase"
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              letterSpacing: 1.4,
            }}
          >
            Quick Prompts
          </Text>
        </View>
        <View className="gap-2">
          {prompts.map((p) => (
            <TouchableOpacity
              key={p.title}
              onPress={() => handlePrompt(p.title)}
              className="rounded-xl px-4 py-3 border border-leben-border bg-leben-bg-card"
            >
              <Text
                className="font-medium text-leben-text"
                style={{ fontSize: 13 }}
              >
                {p.title}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {p.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Modal visible={isOpen} transparent animationType="fade">
        <View className="flex-1 flex-row">
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setIsOpen(false)}
          />
          <View
            className="h-full py-6"
            style={{
              width: 260,
              backgroundColor: "var(--bg-primary)",
              borderRightWidth: 1,
              borderRightColor: "var(--bg-card)",
            }}
          >
            <ScrollView>{panelContent}</ScrollView>
          </View>
        </View>
      </Modal>

      {/* Desktop sidebar (hidden on mobile, relies on NativeWind md:flex) */}
      <View
        className="hidden md:flex h-full py-6"
        style={{
          width: 250,
          backgroundColor: "var(--bg-primary)",
          borderRightWidth: 1,
          borderRightColor: "var(--bg-card)",
        }}
      >
        <ScrollView>{panelContent}</ScrollView>
      </View>
    </>
  );
}
