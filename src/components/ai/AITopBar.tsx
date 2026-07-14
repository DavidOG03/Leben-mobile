import { View, Text, TouchableOpacity } from 'react-native';
import { useLebenStore } from '@/store/useStore';
import { BellIcon } from '@/constants/Icons';
import { useRouter } from 'expo-router';

export default function AITopBar({ toggleLeftPanel }: { toggleLeftPanel?: () => void }) {
  const setNotificationOpen = useLebenStore((s) => s.setNotificationOpen);
  const notifications = useLebenStore((s) => s.notifications || []);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const router = useRouter();

  return (
    <View
      className="flex-row items-center justify-between px-5 py-4 border-b border-[#181818] bg-leben-bg"
      style={{
        height: 56,
      }}
    >
      <View className="flex-row items-center gap-3">
        {/* Hamburger — toggles left panel on mobile */}
        {toggleLeftPanel && (
          <TouchableOpacity
            className="md:hidden items-center justify-center p-2 rounded-lg"
            onPress={toggleLeftPanel}
          >
            <Text className="text-[#555] text-lg">☰</Text>
          </TouchableOpacity>
        )}

        <Text
          className="font-bold text-white"
          style={{ fontSize: 15, letterSpacing: -0.1 }}
        >
          Leben
        </Text>
      </View>

      <View className="flex-row items-center gap-4">
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={() => setNotificationOpen(true)}
          className="relative items-center justify-center w-8 h-8 rounded-full bg-[#111] border border-[#222]"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#111]" />
          )}
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings' as any)}
          className="rounded-full items-center justify-center flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            borderWidth: 1.5,
            borderColor: '#333',
            backgroundColor: '#2a2a3a'
          }}
        >
          <Text className="text-[#888] text-sm">👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
