import { Text } from "@/components/ui/Text";
import { TrashIcon } from "@/constants/Icons";
import { useLebenStore } from "@/store/useStore";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function PushPermissionBanner() {
  const [permission, setPermission] =
    useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((status) => {
      setPermission(status.status);
    });
  }, []);

  if (!permission || permission === "granted" || permission === "denied")
    return null;

  return (
    <View className="flex-row items-center justify-between mx-4 my-2 px-3 py-3 rounded-xl bg-[rgba(124,106,240,0.08)] border border-[rgba(124,106,240,0.2)]">
      <Text className="text-leben-text-2 text-[12px] flex-1 mr-2 leading-5">
        Enable push notifications to receive reminders in real time.
      </Text>
      <TouchableOpacity
        onPress={async () => {
          const { status } = await Notifications.requestPermissionsAsync();
          setPermission(status);
        }}
        className="bg-[rgba(124,106,240,0.15)] border border-[rgba(124,106,240,0.3)] rounded-md px-3 py-1.5"
      >
        <Text className="text-leben-accent font-bold text-[11px]">Enable</Text>
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
  const insets = useSafeAreaInsets();

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      {/* Background overlay to close on outside click */}
      <Pressable className="flex-1" onPress={() => setOpen(false)}>
        <View className="flex-1" />
      </Pressable>

      {/* The actual popup container */}
      <View
        className="absolute w-[320px] rounded-2xl border border-leben-border overflow-hidden bg-leben-bg shadow-md"
        style={{
          top: insets.top + (Platform.OS === "ios" ? 60 : 70), // Push it slightly below the header
          right: 16, // Right padding
          shadowColor: "#00000050",
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.5,
          shadowRadius: 500,
          elevation: 10,
        }}
      >
        {/* Header */}
        <View className="px-5 py-4 border-b border-leben-border-subtle flex-row items-center justify-between bg-[rgba(255,255,255,0.02)]">
          <Text className="text-leben-text font-semibold text-[14px]">
            Notifications
          </Text>
          <View>
            {notifications.some((n: any) => !n.read) && (
              <TouchableOpacity onPress={() => markAllRead()}>
                <Text className="text-leben-accent font-semibold text-[11px]">
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <PushPermissionBanner />

        {/* List */}
        <ScrollView
          className="max-h-[360px]"
          showsVerticalScrollIndicator={true}
        >
          {notifications.length === 0 ? (
            <View className="px-5 py-10 items-center">
              <Text className="text-leben-text-dim text-[12px]">
                No notifications yet
              </Text>
            </View>
          ) : (
            notifications.map((n: any) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => markRead(n.id)}
                className={`px-5 py-4 border-b border-[#131313] ${
                  !n.read ? "bg-[rgba(124,106,240,0.02)]" : ""
                }`}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-leben-accent font-bold text-[10px] uppercase tracking-wider mb-1">
                      {n.title}
                    </Text>
                    <Text
                      className={`${!n.read ? "text-leben-text" : "text-leben-text-muted"} text-[13px] leading-[18px]`}
                    >
                      {n.body}
                    </Text>
                    <Text className="text-leben-text-dim text-[10px] mt-1.5">
                      {new Date(n.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  {!n.read && (
                    <View className="w-2 h-2 rounded-full bg-leben-accent mt-1" />
                  )}
                  <TouchableOpacity
                    onPress={() => deleteNotification(n.id)}
                    className="items-center justify-center w-[26px] h-[26px] rounded-[6px]"
                  >
                    <TrashIcon color="#71717a" size={16} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        {notifications.length > 0 && (
          <View className="px-5 py-3 bg-[rgba(255,255,255,0.01)] items-center border-t border-leben-border-subtle">
            <Text className="text-leben-text-dim text-[10px]">
              Showing last {notifications.length} notifications
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
