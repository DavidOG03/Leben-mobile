import { BellIcon } from "@/constants/Icons";
import { useLebenStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { , TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';


export function DashboardHeader() {
  const router = useRouter();
  const userId = useLebenStore((s) => s.userId);
  const userFullName = useLebenStore((s: any) => s.userFullName);
  const userEmail = useLebenStore((s: any) => s.userEmail);
  const setNotificationOpen = useLebenStore((s: any) => s.setNotificationOpen);
  const notifications = useLebenStore((s: any) => s.notifications || []);

  let firstName = "Guest";
  if (userFullName) {
    firstName = userFullName.split(" ")[0];
  } else if (userEmail) {
    firstName = userEmail.split("@")[0];
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  const hasUnread = notifications.some((n: any) => !n.read);

  return (
    <>
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-leben-border-subtle">
        {/* Left: Greeting */}
        <View>
          <Text className="text-white font-semibold text-lg leading-snug">
            {getGreeting()}, {firstName}
          </Text>
          <Text className="text-leben-text-muted text-[10px] tracking-widest font-medium uppercase mt-0.5">
            {currentDate}
          </Text>
        </View>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-4">
          {/* Notification Bell */}
          <TouchableOpacity
            className="items-center justify-center relative w-8 h-8"
            onPress={() => setNotificationOpen(true)}
          >
            <BellIcon color="#888" size={22} />
            {hasUnread && (
              <View className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-leben-accent border-2 border-leben-bg" />
            )}
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings" as any)}
            className="w-9 h-9 rounded-full items-center justify-center border-[1.5px] border-leben-border"
            style={{ backgroundColor: "#2a2a3a" }}
          >
            <Text className="text-leben-text-muted text-sm">👤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
