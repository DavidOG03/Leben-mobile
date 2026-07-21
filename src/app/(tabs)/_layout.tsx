// app/(tabs)/_layout.tsx
// Bottom tab navigator with 5 tabs + Neural dropup for Planner / AI / Analytics
import { NeuralDropup } from "@/components/shared/NeuralDropup";
import { Text } from "@/components/ui/Text";
import {
  GoalIcon,
  GridIcon,
  HabitIcon,
  SparkleIcon,
  TaskIcon,
} from "@/constants/Icons";
import { Tabs, usePathname } from "expo-router";
import { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Tab Bar ──────────────────────────────────────────────────────────────────

const TAB_HEIGHT = 65;

interface TabItem {
  name: string;
  label: string;
  icon: React.ElementType;
  route: string;
}

const MAIN_TABS: TabItem[] = [
  { name: "index", label: "Home", icon: GridIcon, route: "/(tabs)" },
  { name: "tasks", label: "Tasks", icon: TaskIcon, route: "/(tabs)/tasks" },
  { name: "habits", label: "Habits", icon: HabitIcon, route: "/(tabs)/habits" },
  { name: "goals", label: "Goals", icon: GoalIcon, route: "/(tabs)/goals" },
];

// Screens inside the tabs group that belong to "Neural" (shown via dropup)
const NEURAL_SCREENS = ["planner", "ai", "analytics"];

function CustomTabBar() {
  const [dropupOpen, setDropupOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const totalHeight = TAB_HEIGHT + insets.bottom;
  const isNeuralActive = NEURAL_SCREENS.some((s) => pathname.includes(s));

  const toggleDropup = useCallback(() => setDropupOpen((v) => !v), []);
  const closeDropup = useCallback(() => setDropupOpen(false), []);

  return (
    <>
      {/* Dropup panel — renders above the tab bar */}
      <NeuralDropup
        visible={dropupOpen}
        onClose={closeDropup}
        tabBarHeight={totalHeight}
      />

      {/* Tab bar */}
      <View
        style={{ height: totalHeight, paddingBottom: insets.bottom }}
        className="flex-row bg-leben-bg-card border-t border-leben-border items-center px-2"
      >
        {MAIN_TABS.map((tab) => {
          const active =
            (tab.name === "index" && pathname === "/") ||
            (tab.name !== "index" && pathname.startsWith(`/${tab.name}`));

          return (
            <TabButton
              key={tab.name}
              tab={tab}
              active={active}
              onPress={closeDropup}
            />
          );
        })}

        {/* Neural ✦ — dropup trigger */}
        <TouchableOpacity
          className="flex-1 items-center justify-center pt-2 pb-1"
          onPress={toggleDropup}
          activeOpacity={0.7}
        >
          <SparkleIcon
            size={22}
            color={
              isNeuralActive || dropupOpen ? "#7c6af0" : "#888888"
            }
          />
          <Text
            className={`text-[10px] mt-1.5 font-medium ${
              isNeuralActive || dropupOpen
                ? "text-leben-accent"
                : "text-leben-text-dim"
            }`}
          >
            Neural
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// ── Single Tab Button ─────────────────────────────────────────────────────────

function TabButton({
  tab,
  active,
  onPress,
}: {
  tab: TabItem;
  active: boolean;
  onPress: () => void;
}) {
  const { useRouter } = require("expo-router");
  const router = useRouter();
  const Icon = tab.icon;

  return (
    <TouchableOpacity
      className="flex-1 items-center justify-center pt-2 pb-1"
      onPress={() => {
        onPress();
        router.push(tab.route as any);
      }}
      activeOpacity={0.7}
    >
      <Icon size={22} color={active ? "#7c6af0" : "#888888"} />
      <Text
        className={`text-[10px] mt-1.5 font-medium ${
          active ? "text-leben-accent" : "text-leben-text-dim"
        }`}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Tabs Layout ───────────────────────────────────────────────────────────────

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{ headerShown: false }}
    >
      {/* Main tabs */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen name="habits" options={{ title: "Habits" }} />
      <Tabs.Screen name="goals" options={{ title: "Goals" }} />

      {/* Neural sub-screens (not in bottom bar — accessed via dropup) */}
      <Tabs.Screen name="planner" options={{ title: "Planner", href: null }} />
      <Tabs.Screen name="ai" options={{ title: "Neural AI", href: null }} />
      <Tabs.Screen
        name="analytics"
        options={{ title: "Analytics", href: null }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", href: null }}
      />
    </Tabs>
  );
}
