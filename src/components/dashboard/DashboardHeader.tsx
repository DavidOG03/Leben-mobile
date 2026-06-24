import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLebenStore } from '@/store/useStore';
import { LC } from '@/constants/theme';

export function DashboardHeader() {
  const router = useRouter();
  const userId = useLebenStore((s) => s.userId);
  const userFullName = useLebenStore((s: any) => s.userFullName);
  const userEmail = useLebenStore((s: any) => s.userEmail);

  let firstName = 'Guest';
  if (userFullName) {
    firstName = userFullName.split(' ')[0];
  } else if (userEmail) {
    firstName = userEmail.split('@')[0];
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
      {/* Left: Greeting */}
      <View>
        <Text className="text-white font-semibold text-lg leading-snug">
          {getGreeting()}, {firstName}
        </Text>
        <Text className="text-[#555] text-[10px] tracking-widest font-medium uppercase mt-0.5">
          {currentDate}
        </Text>
      </View>

      {/* Right: Actions */}
      <View className="flex-row items-center gap-4">
        {/* Notification Bell Placeholder */}
        <TouchableOpacity className="items-center justify-center">
          <Text className="text-[#666] text-xl">🔔</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings' as any)}
          className="w-9 h-9 rounded-full items-center justify-center border-[1.5px] border-[#333]"
          style={{ backgroundColor: '#2a2a3a' }}
        >
          <Text className="text-[#888] text-sm">👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
