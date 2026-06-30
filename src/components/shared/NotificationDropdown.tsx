import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { TrashIcon } from "@/constants/Icons";
import { useLebenStore } from "@/store/useStore";
import { BottomSheet } from "@/components/ui/BottomSheet";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

function PushPermissionBanner() {
  const [permission, setPermission] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((status) => {
      setPermission(status.status);
    });
  }, []);

  if (!permission || permission === "granted" || permission === "denied") return null;

  return (
    <View className="flex-row items-center justify-between mx-4 my-2 px-3 py-3 rounded-xl bg-[rgba(124,106,240,0.08)] border border-[rgba(124,106,240,0.2)]">
      <Text className="text-[#aaa] text-[12px] flex-1 mr-2 leading-5">
        Enable push notifications to receive reminders in real time.
      </Text>
      <TouchableOpacity
        onPress={async () => {
          const { status } = await Notifications.requestPermissionsAsync();
          setPermission(status);
        }}
        className="bg-[rgba(124,106,240,0.15)] border border-[rgba(124,106,240,0.3)] rounded-md px-3 py-1.5"
      >
        <Text className="text-[#7c6af0] font-bold text-[11px]">Enable</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function NotificationDropdown() {
  const notifications = useLebenStore((s: any) => s.notifications);
  const markAllRead = useLebenStore((s: any) => s.markAllNotificationsRead);
  const markRead = useLebenStore((s: any) => s.markNotificationRead);
  const deleteNotification = useLebenStore((s: any) => s.deleteNotification);
  const isOpen = useLebenStore((s: any) => s.isNotificationOpen);
  const setOpen = useLebenStore((s: any) => s.setNotificationOpen);

  return (
    <BottomSheet visible={isOpen} onClose={() => setOpen(false)}>
      <View className="flex-row items-center justify-between mb-4 border-b border-[#181818] pb-3">
        <Text className="text-white font-semibold text-[16px]">Notifications</Text>
        {notifications.some((n: any) => !n.read) && (
          <TouchableOpacity onPress={() => markAllRead()}>
            <Text className="text-[#7c6af0] font-bold text-[12px]">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <PushPermissionBanner />

      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[360px]">
        {notifications.length === 0 ? (
          <View className="px-5 py-10 items-center">
            <Text className="text-[#444] text-[12px]">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((n: any) => (
            <TouchableOpacity
              key={n.id}
              onPress={() => markRead(n.id)}
              className={`flex-row items-start justify-between gap-3 px-2 py-4 border-b border-[#131313] ${
                !n.read ? "bg-[rgba(124,106,240,0.02)]" : ""
              }`}
            >
              <View className="flex-1">
                <Text className="text-[#7c6af0] font-bold text-[10px] uppercase tracking-wider mb-1">
                  {n.title}
                </Text>
                <Text className={`${!n.read ? "text-[#e0e0e0]" : "text-[#888]"} text-[13px] leading-5`}>
                  {n.body}
                </Text>
                <Text className="text-[#333] text-[10px] mt-1.5">
                  {new Date(n.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              
              <View className="items-center">
                {!n.read && <View className="w-2 h-2 rounded-full bg-[#7c6af0] mt-1 mb-2" />}
                <TouchableOpacity
                  onPress={() => deleteNotification(n.id)}
                  className="items-center justify-center w-[26px] h-[26px] rounded-md"
                >
                  <TrashIcon className="text-white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  );
}
